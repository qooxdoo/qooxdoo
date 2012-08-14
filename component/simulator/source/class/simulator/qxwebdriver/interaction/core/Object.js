/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Author:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/* ************************************************************************
#ignore(qxwebdriver)
#ignore(qxwebdriver.util)
************************************************************************ */

/**
 * Common interactions for widgets that inherit from {@link qx.core.Object}
 */
qx.Class.define("simulator.qxwebdriver.interaction.core.Object", {

  statics :
  {

    /**
     * Returns the value of a property. {@see qx.core.Object#get}
     * @param propertyName {String} Name of the property
     * @return {webdriver.promise.Promise} A promise that will resolve to
     * the value of the property
     * @lint ignoreUndefined(qxwebdriver)
     */
    get : function(propertyName)
    {
      var func = function() {
        var obj = qx.core.ObjectRegistry.fromHashCode('QXHASH');
        var value = obj.get('PROPERTYNAME');
        var safeValue = qxwebdriver.util.toSafeValue(value);
        return safeValue;
      };

      var script = simulator.qxwebdriver.Util.functionToString(func, {
        QXHASH : this.qxHash,
        PROPERTYNAME: propertyName
      });
      script = 'return (' + script + ')()';

      return this.driver_.executeScript(script)
      .then(function(value) {
        return value;
      });
    }
  },

  defer : function(statics)
  {
    simulator.qxwebdriver.Interaction.register("qx.core.Object",
      "get", statics.get);
  }
});