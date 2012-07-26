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

/**
 * Registry for interaction methods that will be added to WebElements
 * based on the type of qooxdoo widget they represent.
 */
qx.Class.define("simulator.qxwebdriver.Interaction", {

  statics :
  {
    /**
     * Interactions registry
     */
    __interactions : {},

    /**
     * Register an interaction that will be available on WebElements
     * representing qooxdoo widgets that are instances of the given
     * class or implement the given interface, respectively.
     *
     * @param className {String} Name of a class or interface
     * @param methodName {String} Name for the interaction method
     * @param interaction {Function} interaction implementation
     */
    register : function(className, methodName, interaction)
    {
      if (qx.core.Environment.get("qx.debug")) {
        var assert = qx.core.Assert;
        assert.assertArgumentsCount(arguments, 3, 3);
        assert.assertString(className);
        assert.assertString(methodName);
        assert.assertFunction(interaction);
      }

      if (!this.__interactions[className]) {
        this.__interactions[className] = {};
      }
      this.__interactions[className][methodName] = interaction;
    },

    /**
     * Returns the currently registered interactions
     * @return {Map} map of interactions
     */
    getInteractions : function()
    {
      return this.__interactions;
    }
  }

});