/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * Module for querying information about the environment / runtime.
 * It adds a static key <code>env</code> to q and offers the given methods.
 *
 * <pre class="javascript">
 * q.env.get("engine.name"); // return "webkit" e.g.
 * </pre>
 *
 * The following values are predefined:
 * "browser.name" --> The name of the browser
 * "browser.version" --> The version of the browser
 * "browser.quirksmode"  --> <code>true</code> if the browser is in quirksmode
 * "browser.documentmode" --> The document mode of the browser
 *
 * "device.name" --> The name of the device e.g. <code>iPad</code>.
 * "device.type" --> Either <code>desktop</code>, <code>tablet</code> or <code>mobile</code>.
 *
 * "engine.name" --> The name of the browser engine
 * "engine.version" --> The version of the browser engine
 */
qx.Bootstrap.define("qx.module.Environment", {
  statics :
  {
    /**
     * Get the value stored for the given key.
     *
     * @attachStatic {q, env.get}
     * @param key {String} The key to check for.
     * @return {var} The value stored for the given key.
     */
    get : function(key) {
      return qx.core.Environment.get(key);
    },

    /**
     * Adds a new environment setting which can be queried via {@link #get}.
     * @param key {String} The key to store the value for.
     *
     * @attachStatic {q, env.add}
     * @param value {var} The value to store.
     * @return {q} The collection for chaining.
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

    qx.core.Environment.get("device.type");

    q.$attachStatic({
      "env" : {get: statics.get, add: statics.add}
    });
  }
});