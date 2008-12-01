/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.core.Object",
{
  extend : qx.dev.unit.TestCase,

  events :
  {
    "test" : "qx.event.type.Event"
  },

  members :
  {
    testAddListener : function()
    {
      var listener = function() {};
      this.addListener("test", listener, this, false);
      this.assertTrue(this.hasListener("test", false));
      this.removeListener("test", listener, this, false);
      this.assertFalse(this.hasListener("test", false));
    },


    testRemoveListenerById : function()
    {
      var id = this.addListener("test", function() {}, this, false);
      this.assertTrue(this.hasListener("test", false));
      this.removeListenerById(id);
      this.assertFalse(this.hasListener("test", false));
    }
  }
});