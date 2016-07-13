/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.event.handler.Offline",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __handler : qx.event.Registration.getManager(window).getHandler(qx.event.handler.Offline),


    testIsOnline : function() {
      this.assertBoolean(this.__handler.isOnline());
    }
  }
});
