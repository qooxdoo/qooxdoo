/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_tablevarrowheight)

************************************************************************ */

/**
 * A selection model.  .
 */
qx.Clazz.define("qx.ui.tablevarrowheight.SelectionModel",
{
  extend : qx.ui.table.SelectionModel,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    qx.ui.table.SelectionModel.call(this);
  }




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  
  events : {
    "changeSelection" : "qx.event.type.Event" /** Fired when the selection has changed. */
  }
  
});
