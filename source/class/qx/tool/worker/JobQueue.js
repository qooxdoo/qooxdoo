/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
 *
 *    Copyright:
 *      2025 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *      * Patryk Malinowski (pmalinowski@vmn.digital, @patryk-m-malinowski)
 *
 * *********************************************************************** */

/**
 * Operates a simple job queue, which uses a pool of node worker threads (each managed by a
 * `qx.tool.worker.WorkerClient`) to process jobs concurrently. The number of concurrent jobs
 * is limited by the `maxConcurrentJobs` property.
 *
 * If the `maxConcurrentJobs` property is set to 1, then the job queue will use a loopback worker
 * client, which executes jobs in the main thread.
 *
 * Each job is implemented by an API - all you have to do is define an interface that conforms
 * to the naming convention defined in `qx.tool.worker.AbstractClientApi` and the job queue will
 * be able to execute your task.
 */
qx.Class.define("qx.tool.worker.JobQueue", {
  extend: qx.core.Object,

  construct() {
    super();
    this.__queue = [];
    this.__jobsByUuid = {};
    this.__workerClientsByUuid = {};
  },

  properties: {
    /**
     * The maximum number of jobs that can be processed concurrently.
     */
    maxConcurrentJobs: {
      check: "Number",
      init: 1
    }
  },

  events: {
    /** Fired when a worker is ready; the data is the `qx.tool.worker.WorkerClient` */
    workerClientReady: "qx.event.type.Data"
  },

  members: {
    /**
     * @typedef {Object} Job
     * @property {String} jobUuid uuid of the job (created if not provided)
     * @property {String} status "queued", "running", or "complete"
     * @property {String} workerClientUuid uuid of the worker client processing the job
     * @property {String} jobApiName the api name of the class that will process the job
     * @property {String} jobMethodName the method name of the class that will process the job
     * @property {Array} jobArgs the arguments to pass to the method
     * @property {qx.Promise} promiseComplete the promise that resolves when the job is complete
     */
    /** @type{Job[]} queue of jobs to be performed */
    __queue: null,

    /** @type{Object<String,Job>} Jobs indexed by UUID */
    __jobsByUuid: null,

    /** @type{Object<String,qx.tool.worker.WorkerClient>} WorkerClients index by UUID */
    __workerClientsByUuid: null,

    /** @type{qx.tool.worker.WorkerClient[]} Idle worker clients */
    __idleWorkerClients: null,

    /** @type{Object<String,qx.tool.worker.WorkerClient>} Busy worker clients indexed by UUID */
    __busyWorkerClients: null,

    /**
     * Called to start the job queue and create the worker clients.
     * This should only be called once, and only in the main thread.
     */
    async start() {
      this.__idleWorkerClients = [];
      this.__busyWorkerClients = {};

      const addWorkerClient = async workerClient => {
        this.__workerClientsByUuid[workerClient.toUuid()] = workerClient;
        await workerClient.start();
        await this.fireDataEventAsync("workerClientReady", workerClient);
        this.__idleWorkerClients.push(workerClient);
        this.__pollQueue();
      };

      if (this.getMaxConcurrentJobs() < 2) {
        let workerClient = qx.tool.worker.WorkerClient.createLoopbackClient();
        await addWorkerClient(workerClient);
      } else {
        for (let i = 0; i < this.getMaxConcurrentJobs(); i++) {
          let workerClient = new qx.tool.worker.WorkerClient();
          await addWorkerClient(workerClient);
        }
      }
    },

    /**
     * Shuts down all worker clients and waits for them to finish.
     */
    async stop() {
      for (let uuid in this.__workerClientsByUuid) {
        let workerClient = this.__workerClientsByUuid[uuid];
        await workerClient.shutdown();
      }
    },

    /**
     * Polls the job queue and assigns jobs to idle worker clients.
     * If a worker client is provided, it will be used to process the next job.
     * If no worker client is provided, an idle worker client will be used if available.
     *
     * @param {qx.tool.worker.WorkerClient?} workerClient
     * @returns
     */
    __pollQueue(workerClient) {
      if (!this.__queue.length) {
        return;
      }
      if (!workerClient) {
        if (!this.__idleWorkerClients.length) {
          return;
        }
        workerClient = this.__idleWorkerClients.shift();
        this.__busyWorkerClients[workerClient.toUuid()] = workerClient;
      }
      let job = this.__queue.shift();
      this.__executeJob(job, workerClient);
    },

    /**
     * Executes a job on a worker client
     *
     * @param {Job} job
     * @param {qx.tool.worker.WorkerClient} workerClient
     */
    __executeJob(job, workerClient) {
      job.status = "running";
      let api = workerClient.getApi(job.jobApiName);
      api[job.jobMethodName]
        .apply(api, job.jobArgs)
        .then(result => this.__onJobComplete(job, workerClient, result))
        .catch(err => this.__onJobError(job, workerClient, err));
    },

    /**
     * Called when a job is complete.
     *
     * @param {Job} job
     * @param {qx.tool.worker.WorkerClient} workerClient
     * @param {*} result
     * @returns
     */
    __onJobComplete(job, workerClient, result) {
      if (!this.__jobsByUuid[job.jobUuid]) {
        // If the job is not found, it may have been removed from the queue, so we can ignore it
        return;
      }

      job.status = "complete";
      job.promiseComplete.resolve(result);

      // Shortcut to process the next job in the queue if there is one, otherwise mark the worker as idle
      if (this.__queue.length) {
        this.__pollQueue(workerClient);
        return;
      }
      delete this.__busyWorkerClients[workerClient.toUuid()];
      this.__idleWorkerClients.push(workerClient);
    },

    /**
     * Called when a job fails; rejects the job's completion promise so the caller can
     * handle the failure (e.g. mark the class as having a fatal compile error) instead
     * of the rejection escaping as an unhandled error.
     *
     * @param {Job} job
     * @param {qx.tool.worker.WorkerClient} workerClient
     * @param {Error} err
     */
    __onJobError(job, workerClient, err) {
      if (!this.__jobsByUuid[job.jobUuid]) {
        // If the job is not found, it may have been removed from the queue, so we can ignore it
        return;
      }

      job.status = "complete";
      job.promiseComplete.reject(err);

      // Continue processing the queue / release the worker, exactly as on success
      if (this.__queue.length) {
        this.__pollQueue(workerClient);
        return;
      }
      delete this.__busyWorkerClients[workerClient.toUuid()];
      this.__idleWorkerClients.push(workerClient);
    },

    /**
     * Adds a job to the queue and returns a promise that resolves when the job is complete.
     *
     * @param {Interface|String} jobApi the API to invoke (either the interface or the interface name)
     * @param {String} jobMethodName the method name to invoke on the API
     * @param {Array?} jobArgs the arguments to pass to the method
     * @returns
     */
    addJob(jobApi, jobMethodName, ...jobArgs) {
      let jobApiName = typeof jobApi === "string" ? jobApi : qx.tool.worker.AbstractClientApi.getApiNameFromInterface(jobApi);
      return this.addJobImpl({
        jobApiName,
        jobMethodName,
        jobArgs
      });
    },

    /**
     * Adds a job to the queue and returns a promise that resolves when the job is complete.
     *
     * @param {Job} job the Job definition
     * @returns {Promise} A promise that resolves when the job is complete.
     */
    addJobImpl(job) {
      if (!job.jobUuid) {
        job.jobUuid = qx.util.Uuid.createUuidV4();
        job.promiseComplete = new qx.Promise();
      }
      job.status = "queued";
      this.__jobsByUuid[job.jobUuid] = job;
      this.__queue.push(job);
      this.__pollQueue();
      return job;
    },

    /**
     * Removes a job from the queue and deletes it from the jobsByUuid map.
     * If the job is currently being processed, it cannot be removed and an error will be thrown.
     *
     * @param {Job} job
     */
    removeJob(job) {
      if (job.status === "running") {
        throw new Error("Cannot remove a job that is currently being processed.");
      }
      let index = this.__queue.indexOf(job);
      if (index !== -1) {
        qx.lang.Array.removeAt(this.__queue, index);
      }
      delete this.__jobsByUuid[job.jobUuid];
    }
  }
});
