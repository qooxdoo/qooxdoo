/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Creates a map with all known environment settings as defined in
 * {@link qx.core.Environment} and their values as detected for the current
 * runtime. The <pre>changeFeatures</pre> event is fired when all checks are
 * done and the map is complete.
 */
qx.Class.define("fce.Environment", {

  extend : qx.core.Object,

  properties :
  {
    /**
     * Map of environment features
     */
    features :
    {
      nullable : true,
      init : null,
      event : "changeFeatures"
    }
  },

  members :
  {
    __form : null,


    /**
     * Queries qx.core.Environment to retrieve all settings/values
     */
    check : function()
    {
      var checks = qx.core.Environment.getChecks();
      var keys = qx.lang.Object.getKeys(checks);

      var features = {};
      for (var i=0,l=keys.length; i<l; i++) {
        var key = keys[i];
        if (key.indexOf("fce.") < 0) {
          features[key] = qx.core.Environment.get(key);
        }
      }

      checks = qx.core.Environment.getAsyncChecks();
      var numberOfChecks = qx.lang.Object.getLength(checks);
      keys = qx.lang.Object.getKeys(checks);

      for (var i=0,l=keys.length; i<l; i++) {
        var key = keys[i];
        qx.core.Environment.getAsync(key, function(result) {
          features[key] = result;
          numberOfChecks--;
          if (numberOfChecks == 0) {
            // all async checks done
            this.setFeatures(features);
          }
        }, this);
      }

      if (numberOfChecks == 0) {
        // no pending async checks
        this.setFeatures(features);
      }
    }
  }
});