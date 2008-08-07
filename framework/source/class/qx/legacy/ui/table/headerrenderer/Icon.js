/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

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
 */
qx.Class.define("qx.legacy.ui.table.headerrenderer.Icon",
{
  extend : qx.legacy.ui.table.headerrenderer.Default,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  /**
   * @param iconUrl {String} URL to the icon to show
   * @param tooltip {String ? ""} Text of the tooltip to show if the mouse hovers over the
   *                             icon
   */
  construct : function(iconUrl, tooltip)
  {
    this.base(arguments);

    if (iconUrl == null) {
      iconUrl = "";
    }

    this.setIconUrl(iconUrl);
    this.setToolTip(tooltip);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * URL of the icon to show
     */
    iconUrl :
    {
      check : "String",
      init : ""
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    updateHeaderCell : function(cellInfo, cellWidget)
    {
      // Set URL to icon
      var img = cellWidget.getUserData("qx_ui_table_IconHeaderCellRenderer_icon");

      if (img == null)
      {
        img = new qx.legacy.ui.basic.Image();
        cellWidget.setUserData("qx_ui_table_IconHeaderCellRenderer_icon", img);
        cellWidget.addAtBegin(img);
      }

      img.setSource(this.getIconUrl());

      this.base(arguments, cellInfo, cellWidget);
    }
  }
});
