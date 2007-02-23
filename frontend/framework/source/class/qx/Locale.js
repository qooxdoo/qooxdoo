/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

qx.Clazz.define("qx.Locale",
{
  statics:
  {
    /**
     * Locale config
     *
     * Example:
     * <pre><code>
     * qx.Locale.define("name",
     * {
     *   "msgId": "msgText",
     *   ...
     * });
     * </code></pre>
     *
     * @type static
     * @param name {String} name of the mixin
     * @param config {Map} config structure
     * @return {void}
     */
    define : function(name, config)
    {
      // Assign to namespace
      var basename = qx.Clazz.createNamespace(name, config);

      // Register to manager
      qx.locale.Manager.getInstance().addTranslation(basename, config);

      // Store class reference in global class registry
      this.__registry[name] = config;
    },


    /**
     * Returns a locale by name
     *
     * @type static
     * @param name {String} locale name to check
     * @return {Object ? void} locale object
     */
    getByName : function(name) {
      return this.__registry[name];
    },


    /**
     * Determine if locale exists
     *
     * @type static
     * @param name {String} locale name to check
     * @return {Boolean} true if locale exists
     */
    isDefined : function(name) {
      return this.getByName(name) !== undefined;
    },


    /**
     * Determine the number of locales which are defined
     *
     * @type static
     * @return {Number} the number of classes
     */
    getNumber : function() {
      return qx.lang.Object.getLength(this.__registry);
    },


    /** {var} TODOC */
    __registry : {}
  }
});
