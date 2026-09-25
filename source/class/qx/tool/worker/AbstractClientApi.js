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
 * An "API" is a mechanism that you use to call methods in a node worker (managed by WorkerClient) and
 * receive the results asynchronously - it is a wrpper around the `postMessage` mechanism but provides a
 * much more convenient and structured way to invoke code in a worker thread.
 *
 * In this context, the "client" exists in the main thread only, and one "server" exists in each worker thread.
 *
 * An API is always defined by an interface, and the client API class is generated from the interface - i.e.
 * although `qx.tool.worker.AbstractClientApi` is an abtract class, you do not write classes that extend this class;
 * instead, use the static method `createClientApiClass` to create a client API class for a specific interface.
 *
 * The naming convention is required - the interface must be prefixed with an `I` and the server class is the same
 * name but without the `I` prefix.   For example, if the client API name is be `MyPackage.MyApi`, the interface must
 * be named `MyPackage.IMyApi`, and the server implementation must be named `MyPackage.MyApi`.  The `createClientApiClass`
 * method will generate a client API class named `MyPackage.MyApi$Client` which implements the interface
 * `MyPackage.IMyApi`.
 *
 */
qx.Class.define("qx.tool.worker.AbstractClientApi", {
  extend: qx.core.Object,
  type: "abstract",

  construct(apiName, workerClient) {
    super();
    this.__apiName = apiName;
    this.__workerClient = workerClient;
  },

  members: {
    /**
     * Calls a method on the worker with the given method name and arguments, and returns a promise that resolves with the result.
     *
     * @param {String} methodName
     * @param {Array} args
     * @returns {Promise} a promise that resolves with the result of the method call
     */
    _callMethod(methodName, args) {
      return this.__workerClient.callMethod(this, methodName, args);
    },

    /**
     *
     * @returns {String} the API name
     */
    getApiName() {
      return this.__apiName;
    }
  },

  statics: {
    /** @type{Object<String, qx.Class<qx.tool.worker.AbstractClientApi>>} a list of client API classes by name */
    __clientApiClasses: {},

    /**
     * Creates a client API class for the given interface definition. The returned class will extend qx.tool.worker.AbstractClientApi
     * and have methods corresponding to the methods in the interface, which call _callMethod with the appropriate method name and arguments.
     *
     * @param {*} apiInterface the interface definition for the API, e.g. MyPackage.IMyApi
     * @return {qx.Class} a class definition for the client API, which implements apiInterface and extends qx.tool.worker.AbstractClientApi
     */
    createClientApiClass(apiInterface) {
      let apiName = qx.tool.worker.AbstractClientApi.getApiNameFromInterface(apiInterface);
      let clazz = this.__clientApiClasses[apiName];
      if (clazz) {
        return clazz;
      }
      let methodNames = qx.tool.worker.AbstractClientApi.getMethodNamesFromInterface(apiInterface);
      let events = qx.tool.worker.AbstractClientApi.getEventsFromInterface(apiInterface);

      let members = {};
      methodNames.forEach(methodName => {
        members[methodName] = function (...args) {
          return this._callMethod(methodName, args);
        };
      });
      let clientApiClass = qx.Class.define(apiName + "$Client", {
        extend: qx.tool.worker.AbstractClientApi,
        construct(workerClient) {
          super(apiName, workerClient);
        },
        events,
        members
      });
      this.__clientApiClasses[apiName] = clientApiClass;
      return clientApiClass;
    },

    /**
     * Returns the API name from the interface
     */
    getApiNameFromInterface(apiInterface) {
      let match = apiInterface.name.match(/^(.*)\.I([^.]+)$/);
      let package = match[1];
      let name = match[2];
      return package + "." + name;
    },

    getInterfaceFromApiName(apiName) {
      let match = apiName.match(/^(.*)\.([^.]+)$/);
      let package = match[1];
      let name = match[2];
      return qx.Interface.getByName(package + ".I" + name);
    },

    /**
     * Returns the method names implemented by the API
     */
    getMethodNamesFromInterface(apiInterface) {
      let ifcs = qx.Interface.flatten([apiInterface]);
      let methods = {};
      for (let ifc of ifcs) {
        for (let name of Object.keys(ifc.$$members)) {
          let startChar = name.charAt(0);
          if (startChar !== "_" && startChar !== "$") {
            methods[name] = true;
          }
        }
      }
      methods = Object.keys(methods);
      methods.sort();
      return methods;
    },

    /**
     * Returns the method names implemented by the API
     */
    getEventsFromInterface(apiInterface) {
      let ifcs = qx.Interface.flatten([apiInterface]);
      let events = {};
      for (let ifc of ifcs) {
        if (ifc.$$events) {
          for (let name of Object.keys(ifc.$$events)) {
            events[name] = ifc.$$events[name];
          }
        }
      }
      return events;
    }
  }
});
