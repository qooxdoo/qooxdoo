/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 by STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Til Schneider (til132)
     * Carsten Lergenmueller (carstenl)
 
************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * A header cell renderer which renders an icon (only). The icon cannot be combined
 * with text. 
 * 
 * @param iconUrl {string} URL to the icon to show
 * @param tooltip {string, ""} Text of the tooltip to show if the mouse hovers over the
 *                             icon
 *
 */
qx.OO.defineClass("qx.ui.table.IconHeaderCellRenderer", qx.ui.table.DefaultHeaderCellRenderer,
function(iconUrl, tooltip) {
  qx.ui.table.DefaultHeaderCellRenderer.call(this);
  this.setIconUrl(iconUrl);
  this.setToolTip(tooltip);
});

/**
 * URL of the icon to show
 */
qx.OO.addProperty({ name:"iconUrl", type:qx.constant.Type.String, defaultValue:false, allowNull:false });

/**
 * ToolTip to show if the mouse hovers of the icon
 */
qx.OO.addProperty({ name:"toolTip", type:qx.constant.Type.String, defaultValue:false, allowNull:true });

// overridden
qx.Proto.updateHeaderCell = function(cellInfo, cellWidget) {
  qx.ui.table.DefaultHeaderCellRenderer.prototype.updateHeaderCell.call(this, cellInfo, cellWidget);
  
  // Set URL to icon
  img = cellWidget.getUserData("qx_ui_table_IconHeaderCellRenderer_icon");
  if (img == null){
    img = new qx.ui.basic.Image();
    cellWidget.setUserData("qx_ui_table_IconHeaderCellRenderer_icon", img);
    cellWidget.addAtBegin(img);
  }
  img.setSource(this.getIconUrl());
  
  // Set image tooltip if given
  widgetToolTip = cellWidget.getToolTip();
  if (widgetToolTip == null && this.getToolTip() != null){    
    widgetToolTip = new qx.ui.popup.ToolTip(this.getToolTip());
    cellWidget.setToolTip(widgetToolTip)
  }
}

