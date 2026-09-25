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

const { Worker, isMainThread, parentPort } = require("worker_threads");
const os = require("os");

/**
 * WorkerServer is a singleton class that runs in a Worker thread and listens for messages from the main thread.
 * In your applications `main` method you need to add this code at the begining:
 *
 * <code>
 * async main() {
 *  if (await qx.tool.worker.WorkerServer.initialise()) {
 *     return;
 *  }
 *  await super.main();
 *  // ... rest of your main method
 * }
 * </code>
 */
qx.Class.define("qx.tool.worker.WorkerServer", {
  extend: qx.core.Object,

  construct(loopback) {
    super();
    this.__loopback = loopback;
    this.__apisByApiName = {};
    if (qx.tool.worker.WorkerServer.__instance) {
      throw new Error("WorkerServer is a singleton and an instance already exists");
    }
    qx.tool.worker.WorkerServer.__instance = this;
  },

  members: {
    /** @type {boolean} Whether the server is in loopback mode */
    __loopback: false,

    /** @type{Object<String, qx.core.Object>} list of API instances by name */
    __apisByApiName: null,

    /**
     * Sets the loopback client for this WorkerServer.  This is used when the WorkerServer is running in loopback
     * mode, and allows the WorkerServer to call methods on the main thread.
     *
     * @param {qx.tool.worker.WorkerClient} workerClient
     */
    setLoopbackClient(workerClient) {
      if (!this.__loopback) {
        throw new Error("setLoopbackClient can only be called when the WorkerServer is in loopback mode");
      }
      this.__loopbackClient = workerClient;
    },

    /**
     * Called to start the worker server and listen for messages from the main thread.
     * This should only be called once, and only in a Worker thread.
     */
    start() {
      if (isMainThread && !this.__loopback) {
        throw new Error("qx.tool.worker.WorkerServer can only be used in a Worker thread unless it is in loopback mode");
      }
      if (this.__loopback && !this.__loopbackClient) {
        throw new Error("setLoopbackClient must be called before start when in loopback mode");
      }
      if (!this.__loopback) {
        parentPort.on("message", msg => this.onMessage(msg));
      }
      this.__postMessage({ type: "ready" });
    },

    /**
     * Posts a message to the other side (main thread or loopback client)
     *
     * @param {*} msg
     */
    __postMessage(msg) {
      if (this.__loopback) {
        process.nextTick(() => this.__loopbackClient.onMessage(msg));
      } else {
        parentPort.postMessage(msg);
      }
    },

    /**
     * Handles messages from the main thread
     *
     * @param {*} msg The message from the main thread
     */
    onMessage(msg) {
      if (msg.type === "callMethod") {
        let api = this.getApi(msg.apiName);
        let result = undefined;
        try {
          result = api[msg.methodName].apply(api, msg.args);
        } catch (error) {
          this.__postMessage({ type: "methodReturn", uuid: msg.uuid, error: error.message });
          return;
        }

        if (result instanceof Promise) {
          result
            .then(resolvedResult => {
              this.__postMessage({ type: "methodReturn", uuid: msg.uuid, result: resolvedResult });
            })
            .catch(error => {
              this.__postMessage({ type: "methodReturn", uuid: msg.uuid, error: error.message });
            });
        } else {
          this.__postMessage({ type: "methodReturn", uuid: msg.uuid, result: result });
        }
      }
    },

    /**
     * Returns an API instance for the given API name.  If the API instance does not exist, it will be created and cached.
     *
     * @param {String} apiName The name of the API class to get an instance of
     * @returns {qx.core.Object} An instance of the API class
     */
    getApi(apiName) {
      if (typeof apiName == "object" && typeof apiName.name == "string") {
        apiName = qx.tool.worker.AbstractClientApi.getApiNameFromInterface(apiName);
      }
      let api = this.__apisByApiName[apiName];
      if (!api) {
        let clazz = qx.Class.getByName(apiName);
        if (!clazz) {
          throw new Error(`API class ${apiName} not found`);
        }
        api = new clazz(this);
        this.__apisByApiName[apiName] = api;
      }
      return api;
    }
  },

  statics: {
    /** @type {qx.tool.worker.WorkerServer?} the singleton instance */
    __instance: null,

    /** @type{qx.tool.worker.WorkerServer?} Returns the singleton instance of the WorkerServer for this Worker thread */
    getThisServerInstance() {
      return qx.tool.worker.WorkerServer.__instance;
    },

    /**
     * Called to initialise as a worker; if this returns true, then this is a worker thread and the WorkerServer has been started.
     * If it returns false, then this is the main thread and the WorkerServer has not been started.
     *
     * This should be called from the `main` function in your node application, before any other code, and if it returns true
     * then you should return from the main function.
     */
    async initialise() {
      if (isMainThread) {
        return false;
      }
      let workerServer = new qx.tool.worker.WorkerServer();
      await workerServer.start();
      qx.tool.worker.WorkerServer.__promiseShutdown = new qx.Promise();
      return await qx.tool.worker.WorkerServer.__promiseShutdown;
    },

    /**
     * Shuts down the WorkerServer - anything awaiting on the initialise method will be resolved.
     */
    shutdown() {
      if (isMainThread) {
        return true;
      }
      qx.tool.worker.WorkerServer.__promiseShutdown.resolve(true);
    }
  }
});
