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

qx.Interface.define("qx.tool.compiler.ICompilerInterface", {
  events: {
    /**
     * Fired when application writing starts
     */
    writingApplications: "qx.event.type.Event",

    /**
     * Fired when writing of single application starts; data is an object containing:
     *   maker {qx.tool.compiler.makers.Maker}
     *   target {qx.tool.compiler.targets.Target}
     *   appMeta {qx.tool.compiler.targets.meta.ApplicationMeta}
     */
    writingApplication: "qx.event.type.Data",

    /**
     * Fired when writing of single application is complete; data is an object containing:
     *   maker {qx.tool.compiler.makers.Maker}
     *   target {qx.tool.compiler.targets.Target}
     *   appMeta {qx.tool.compiler.targets.meta.ApplicationMeta}
     *
     * Note that target.getAppMeta() will return null after this event has been fired
     */
    writtenApplication: "qx.event.type.Data",

    /**
     * Fired after writing of all applications; data is an object containing an array,
     * each of which has previously been passed with `writeApplication`:
     *   maker {qx.tool.compiler.makers.Maker}
     *   target {qx.tool.compiler.targets.Target}
     *   appMeta {qx.tool.compiler.targets.meta.ApplicationMeta}
     *
     * Note that target.getAppMeta() will return null after this event has been fired
     */

    writtenApplications: "qx.event.type.Data",

    /**
     * Fired when a class is about to be compiled.
     *
     * The event data is an object with the following properties:
     *
     * dbClassInfo: {Object} the newly populated class info
     * oldDbClassInfo: {Object} the previous populated class info
     * classFile - {ClassFile} the qx.tool.compiler.ClassFile instance
     */
    compilingClass: "qx.event.type.Data",

    /**
     * Fired when a class is compiled.
     *
     * The event data is an object with the following properties:
     * dbClassInfo: {Object} the newly populated class info
     * oldDbClassInfo: {Object} the previous populated class info
     * classFile - {ClassFile} the qx.tool.compiler.ClassFile instance
     */
    compiledClass: "qx.event.type.Data",

    /**
     * Fired when the database is been saved
     *
     *  data:
     * database: {Object} the database to save
     */
    saveDatabase: "qx.event.type.Data",

    /**
     * Fired after all enviroment data is collected
     *
     * The event data is an object with the following properties:
     *  application {qx.tool.compiler.app.Application} the app
     *  enviroment: {Object} enviroment data
     */
    checkEnvironment: "qx.event.type.Data",

    /**
     * Fired when making of apps begins
     */
    making: "qx.event.type.Data",

    /**
     * Fired when making of apps is done.
     */
    made: "qx.event.type.Data",

    /**
     * Fired when all compilation is done.
     */
    allDone: "qx.event.type.Event",

    /**
     * Fired when minification begins.
     *
     * The event data is an object with the following properties:
     *  application {qx.tool.compiler.app.Application} the app being minified
     *  part: {String} the part being minified
     *  filename: {String} the part filename
     */
    minifyingApplication: "qx.event.type.Data",

    /**
     * Fired when minification is done.
     *
     * The event data is an object with the following properties:
     *  application {qx.tool.compiler.app.Application} the app being minified
     *  part: {String} the part being minified
     *  filename: {String} the part filename
     */
    minifiedApplication: "qx.event.type.Data"
  },

  members: {
    /**
     * Starts the compilation process
     */
    async start() {},

    /**
     * Stops the compilation process
     */
    async stop() {},

    /**
     * @returns {Promise<qx.tool.compiler.makers.Maker[]>} Information about the makers, in native Objects
     */
    async getMakers() {}
  }
});
