/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
      this.require(["webkit"]);

      qx.test.mobile.MobileTestCase._oldApplicationFunction = qx.core.Init.getApplication;

      qx.core.Init.getApplication = function()
      {
        return {
          getRoot : function() {
            return this.getRoot();
          }
        }
      }
    },


    tearDown : function()
    {
      this.getRoot().removeAll();
      qx.core.Init.getApplication = qx.test.mobile.MobileTestCase._oldApplicationFunction;
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
