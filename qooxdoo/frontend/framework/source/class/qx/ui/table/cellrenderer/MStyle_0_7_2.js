/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * Provide the qooxdoo version 0.7.2 default padding for table cells.
 */
qx.Mixin.define("qx.ui.table.cellrenderer.MStyle_0_7_2",
{
  statics :
  {
    __tableCellStyleSheet_0_7_2 :
        "  position: absolute;" +
        "  top: 0px;" +
        "  height: 100%;" +
        "  overflow:hidden;" +
        "  text-overflow:ellipsis;" +
        "  -o-text-overflow: ellipsis;" +
        "  white-space:nowrap;" +
        "  border-right:1px solid #eeeeee;" +
        "  border-bottom:1px solid #eeeeee;" +
        "  padding : 0px 2px;" +
        "  cursor:default;" +
        (qx.core.Variant.isSet("qx.client", "mshtml")
         ? ''
         : ';-moz-user-select:none;'),

    /**
     * Set the current standard cell style settings for table cells to be the
     * values that were used up through qooxdoo version 0.7.2.
     */
    setTableCellStyleSheet_0_7_2 : function()
    {
      var cr = qx.ui.table.cellrenderer.Abstract;
      cr.setTableCellStyleSheet(cr.__tableCellStyleSheet_0_7_2);
    }
  }
});
