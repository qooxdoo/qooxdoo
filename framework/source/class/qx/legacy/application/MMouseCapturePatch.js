/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Mixin.define("qx.legacy.application.MMouseCapturePatch",
{
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // interface implementation
    canDispatchEvent : function(target, event, type)
    {
      return (
        this.__captureElement &&
        this.__captureEvents[type] &&
        event.classname &&
        event.classname.indexOf("qx.legacy") == -1
      );
    }
  }
});
