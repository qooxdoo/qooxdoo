/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

qx.Class.define("qx.test.mobile.MobileTestCase",
{
  extend : qx.dev.unit.TestCase,
  include : [qx.dev.unit.MRequirements],


  statics :
  {
    _root : null,
    _oldApplicationFunction : null
  },


  members :
  {
    setUp : function()
    {
      if (qx.core.Environment.get("browser.name") == "ie" && qx.core.Environment.get("browser.documentmode") < 10) {
        throw new qx.dev.unit.RequirementError("Mobile tests require Webkit, Gecko or IE10+");
      }

      qx.test.mobile.MobileTestCase._oldApplicationFunction = qx.core.Init.getApplication;

      var self = this;
      qx.core.Init.getApplication = function()
      {
        return {
          getRoot : function() {
            return self.getRoot();
          },
          addListener: function() {
            return self.addListener.apply(self,arguments);
          },
          removeListener: function() {
            return self.removeListener.apply(self,arguments);
          },
          removeListenerById: function() {
            return self.removeListenerById.apply(self,arguments);
          },
          fireEvent: function() {
            return self.fireEvent.apply(self,arguments);
          },
          fireDataEvent: function() {
            return self.fireDataEvent.apply(self,arguments);
          },
          close : function() {},
          terminate : function() {}
        };
      };
    },


    tearDown : function()
    {
      this.getRoot().removeAll();
      qx.core.Init.getApplication = qx.test.mobile.MobileTestCase._oldApplicationFunction;
      if (qx.core.Environment.get("qx.debug.dispose"))
      {
        if (qx.test.mobile.MobileTestCase._root)
        {
          qx.test.mobile.MobileTestCase._root.destroy();
          qx.test.mobile.MobileTestCase._root = null;
        }
      }
    },


    getRoot : function()
    {
      var clazz = qx.test.mobile.MobileTestCase;

      if (!clazz._root)
      {
        clazz._root = new qx.ui.mobile.core.Root();
      }

      return clazz._root;
    },


    assertQxMobileWidget : function(obj)
    {
      this.assertInstance(obj, qx.ui.mobile.core.Widget);
    }
  }

});
