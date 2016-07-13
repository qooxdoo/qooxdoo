/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * Module for querying information about the environment / runtime.
 * It adds a static key <code>env</code> to qxWeb and offers the given methods.
 *
 * The following values are predefined:
 *
 * * <code>browser.name</code> : The name of the browser
 * * <code>browser.version</code> : The version of the browser
 * * <code>browser.quirksmode</code>  : <code>true</code> if the browser is in quirksmode
 * * <code>browser.documentmode</code> : The document mode of the browser
 *
 * * <code>device.name</code> : The name of the device e.g. <code>iPad</code>.
 * * <code>device.type</code> : Either <code>desktop</code>, <code>tablet</code> or <code>mobile</code>.
 *
 * * <code>engine.name</code> : The name of the browser engine
 * * <code>engine.version</code> : The version of the browser engine
 *
 * * <code>event.touch</code> : Checks if touch events are supported
 * * <code>event.mspointer</code> : Checks if MSPointer events are available
 * @group (Core)
 */
qx.Bootstrap.define("qx.module.Environment", {
  statics :
  {
    /**
     * Get the value stored for the given key.
     *
     * @attachStatic {qxWeb, env.get}
     * @param key {String} The key to check for.
     * @return {var} The value stored for the given key.
     * @lint environmentNonLiteralKey(key)
     */
    get : function(key) {
      return qx.core.Environment.get(key);
    },

    /**
     * Adds a new environment setting which can be queried via {@link #get}.
     * @param key {String} The key to store the value for.
     *
     * @attachStatic {qxWeb, env.add}
     * @param value {var} The value to store.
     * @return {qxWeb} The collection for chaining.
     */
    add : function(key, value) {
      qx.core.Environment.add(key, value);
      return this;
    }
  },


  defer : function(statics) {
    // make sure the desired keys are available (browser.* and engine.*)
    qx.core.Environment.get("browser.name");
    qx.core.Environment.get("browser.version");
    qx.core.Environment.get("browser.quirksmode");
    qx.core.Environment.get("browser.documentmode");

    qx.core.Environment.get("engine.name");
    qx.core.Environment.get("engine.version");

    qx.core.Environment.get("device.name");
    qx.core.Environment.get("device.type");

    qx.core.Environment.get("event.touch");
    qx.core.Environment.get("event.mspointer");

    qxWeb.$attachAll(this, "env");
  }
});
