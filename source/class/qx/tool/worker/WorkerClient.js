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

const { Worker } = require("worker_threads");

/**
 * Manages a node worker thread, which will be operated by an instance of
 * `qx.tool.worker.WorkerServer`.  Communication is handled by using "APIs", which is a structured
 * mechanism where you define an interface plus an implementation of that interface, and then the
 * `qx.tool.worker.AbstractClientApi` provides a way to call methods on that interface and have them
 * execute in the worker thread, calling the appropriate methods on the class that you wrote.
 *
 * @see `qx.tool.worker.AbstractClientApi` for more details of the API mechanism.
 *
 * There is an overhead in creating a worker thread, so while you have to write code which follows the
 * API mechanism, you mighht have circumstances when you don't want to actually create a worker, but you
 * also do want your API code to be able to work with and without workers.  In this case, use the
 * `createLoopbackClient` static method to create a loopback client, which will run the WorkerServer in
 * the same main thread as the WorkerClient.
 *
 */
/**
 * @typedef {Object} CallInProgress
 * @property {string} type The type of message, e.g. "callMethod"
 * @property {string} apiName The name of the API the method belongs to
 * @property {string} methodName The name of the method being called
 * @property {Array} args The arguments to the method
 * @property {qx.Promise} promise The promise that will be resolved with the method's return value
 * @property {string} uuid A unique ID for this call, used to match up responses
 */
qx.Class.define("qx.tool.worker.WorkerClient", {
  extend: qx.core.Object,

  construct(worker) {
    super();
    this.__worker = worker;
    this.__callsByUuid = {};
    this.__apisByApiName = {};
  },

  events: {
    /** @type{qx.event.type.Data} sent when an event is received from the worker */
    eventReceived: "qx.event.type.Data"
  },

  members: {
    /** @type{boolean} Whether the client is in loopback mode */
    __loopback: false,

    /** @type{qx.tool.worker.WorkerServer?} The loopback server instance */
    __loopbackServer: null,

    /** @type{Worker} the node Worker */
    __worker: null,

    /** @type{qx.Promise} a promise that resolves when the worker is ready */
    __promiseReady: null,

    /** @type {boolean} whether the worker is ready */
    __ready: false,

    /** @type {Object<String,CallInProgress>} list of calls in progress */
    __callsByUuid: null,

    /** @type{Object<String, qx.tool.worker.AbstractClientApi>} list of API instances by name */
    __apisByApiName: null,

    /**
     * Called to start the worker and wait until it is ready.
     *
     * @ignore(Worker)
     */
    async start() {
      if (this.__loopback) {
        if (!this.__loopbackServer) {
          throw new Error("Loopback server must be set before starting a loopback worker client");
        }
        process.nextTick(() => this.onMessage({ type: "ready" }));
      } else {
        let worker = new Worker(process.argv[1]);
        this.__worker = worker;
        worker.addListener("message", msg => this.onMessage(msg));
      }
      this.__promiseReady = new qx.Promise();
      await this.__promiseReady;
    },

    /**
     * Shuts down the worker and waits for it to finish.
     */
    async shutdown() {
      let api = this.getApi(qx.tool.worker.IWorkerServerApi);
      await api.shutdown();
      this.__ready = false;
      if (!this.__loopback) {
        await this.__worker.terminate();
      }
      this.__worker = null;
    },

    /**
     * Get or creates an API instance for the given interface; caches the result
     *
     * @param {*} apiInterface
     * @returns {qx.tool.worker.AbstractClientApi} an API instance
     */
    getApi(apiInterface) {
      let apiName;
      if (typeof apiInterface === "string") {
        apiName = apiInterface;
        apiInterface = qx.tool.worker.AbstractClientApi.getInterfaceFromApiName(apiName);
      } else {
        apiName = qx.tool.worker.AbstractClientApi.getApiNameFromInterface(apiInterface);
      }
      let api = this.__apisByApiName[apiName];
      if (api) {
        return api;
      }
      let clientApiClass = qx.tool.worker.AbstractClientApi.createClientApiClass(apiInterface);
      api = new clientApiClass(this);
      this.__apisByApiName[apiName] = api;
      return api;
    },

    /**
     * Posts a message to the other side (main thread or loopback client)
     *
     * @param {*} msg
     */
    __postMessage(msg) {
      if (this.__loopback) {
        process.nextTick(() => this.__loopbackServer.onMessage(msg));
      } else {
        this.__worker.postMessage(msg);
      }
    },

    /**
     * Handles messages from the worker
     *
     * @param {*} msg
     */
    onMessage(msg) {
      if (msg.type === "ready") {
        this.__ready = true;
        this.__promiseReady.resolve();
      } else if (msg.type === "methodReturn") {
        let callInProgress = this.__callsByUuid[msg.uuid];
        delete this.__callsByUuid[msg.uuid];
        if (callInProgress) {
          if (msg.error) {
            callInProgress.promise.reject(new Error(msg.error));
          } else {
            callInProgress.promise.resolve(msg.result);
          }
        }
      } else if (msg.type === "event") {
        this.fireDataEvent("eventReceived", msg.eventData);
      } else {
        this.error(`Unknown message type from worker: ${msg.type}`);
      }
    },

    /**
     * Calls a remote method
     *
     * @param {qx.tool.worker.AbstractClientApi} api The API instance making the call
     * @param {string} methodName The name of the method to call
     * @param {Array} args The arguments to pass to the method
     * @returns {Promise} A promise which resolves with the method's return value
     */
    async callMethod(api, methodName, args) {
      args ??= [];
      let promise = new qx.Promise();
      let callInProgress = {
        type: "callMethod",
        apiName: api.getApiName(),
        methodName,
        args,
        promise,
        uuid: qx.util.Uuid.createUuidV4()
      };
      let dataToPost = qx.lang.Object.clone(callInProgress);
      delete dataToPost.promise; //can't post the promise, so we look it up by uuid when we get the response
      this.__callsByUuid[callInProgress.uuid] = callInProgress;
      this.__postMessage(dataToPost);
      return await promise;
    },

    isReady() {
      return this.__ready;
    }
  },

  statics: {
    /** @type{qx.tool.worker.WorkerClient?} the loopback client instance */
    __loopbackClient: null,

    /**
     * Creates a lookback client, where the client and server are in the same process.
     *
     * @returns {qx.tool.worker.WorkerClient} a loopback worker client
     */
    createLoopbackClient() {
      if (qx.tool.worker.WorkerClient.__loopbackClient) {
        return qx.tool.worker.WorkerClient.__loopbackClient;
      }

      let loopbackClient = new qx.tool.worker.WorkerClient();
      qx.tool.worker.WorkerClient.__loopbackClient = loopbackClient;
      loopbackClient.__loopback = true;
      let loopbackServer = new qx.tool.worker.WorkerServer(loopbackClient);
      loopbackClient.__loopbackServer = loopbackServer;
      loopbackServer.setLoopbackClient(loopbackClient);
      return loopbackClient;
    }
  }
});
