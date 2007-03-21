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

qx.Class.define("qx.locale.Locale",
{
  statics:
  {
    /**
     * Locale config
     *
     * Example:
     * <pre><code>
     * qx.locale.Locale.define("name",
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
    define : function(name, config) {
      qx.locale.Manager.getInstance().addTranslationFromClass(name, config);
    }
  }
});
