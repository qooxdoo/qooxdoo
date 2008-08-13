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

qx.Class.define("qx.test.lang.Webkit",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testSwitch : function()
    {
      this.assertEquals(this, this._switchFunction(12));
      this.assertEquals(this, this._switchFunction(this));
    },


    _switchFunction : function(val)
    {
      switch (val)
      {
        case this:
          break;

        default:
          break;
      }
      return this;
    }
  }
});
