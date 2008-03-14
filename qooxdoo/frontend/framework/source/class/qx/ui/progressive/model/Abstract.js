/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell LIpman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_progressive)

************************************************************************ */

/**
 * Data Model for Progressive renderer.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.model.Abstract",
{
  type       : "abstract",
  extend     : qx.core.Target,


  /**
   */
  construct : function()
  {
    this.base(arguments);
  },


  events :
  {
    /** This event is fired when new data has been added to the data model */
    "dataAvailable" : "qx.event.type.Event"
  },


  members :
  {
    getNextElement : function()
    {
      throw new Error("getElement() is abstract");
    },
  }
});
