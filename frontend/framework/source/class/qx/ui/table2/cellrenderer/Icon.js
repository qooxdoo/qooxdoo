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
#embed(qx.static/image/blank.gif)

************************************************************************ */

/**
 * A data cell renderer for boolean values.
 */
qx.Class.define("qx.ui.table2.cellrenderer.Icon",
{
  extend : qx.ui.table2.cellrenderer.Abstract,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this.IMG_BLANK_URL = qx.io.Alias.getInstance().resolve("static/image/blank.gif");

    var clazz = this.self(arguments);
    if (!clazz.stylesheet)
    {
      clazz.stylesheet = qx.legacy.html.StyleSheet.createElement(
        ".qooxdoo-table-cell-icon {" +
        "  text-align:center;" +
        "  padding-top:1px;" +
        "}"
      );
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Identifies the Image to show.
     *
     * @type member
     * @abstract
     * @param cellInfo {Map} The information about the cell.
     *          See {@link #createDataCellHtml}.
     * @return {Map} A map having the following attributes:
     *           <ul>
     *           <li>"url": (type string) must be the URL of the image to show.</li>
     *           <li>"imageWidth": (type int) the width of the image in pixels.</li>
     *           <li>"imageHeight": (type int) the height of the image in pixels.</li>
     *           <li>"tooltip": (type string) must be the image tooltip text.</li>
     *           </ul>
     * @throws the abstract function warning.
     */
    _identifyImage : function(cellInfo) {
      throw new Error("_identifyImage is abstract");
    },


    /**
     * Retrieves the image infos.
     *
     * @type member
     * @param cellInfo {Map} The information about the cell.
     *          See {@link #createDataCellHtml}.
     * @return {Map} Map with an "url" attribute (type string)
     *                 holding the URL of the image to show
     *                 and a "tooltip" attribute
     *                 (type string) being the tooltip text (or null if none was specified)
     */
    _getImageInfos : function(cellInfo)
    {
      // Query the subclass about image and tooltip
      var urlAndTooltipMap = this._identifyImage(cellInfo);

      // If subclass refuses to give map, construct it
      if (urlAndTooltipMap == null || typeof urlAndTooltipMap == "string")
      {
        urlAndTooltipMap =
        {
          url     : urlAndTooltipMap,
          tooltip : null
        };
      }

      // If subclass gave null as url, replace with url to empty image
      if (urlAndTooltipMap.url == null) {
        urlAndTooltipMap.url = this.IMG_BLANK_URL;
      }

      return urlAndTooltipMap;
    },


    // overridden
    _getCellClass : function() {
      return this.base(arguments) + " qooxdoo-table-cell-icon";
    },


    // overridden
    _getContentHtml : function(cellInfo, htmlArr)
    {
      htmlArr.push('<img ');
      var urlAndToolTip = this._getImageInfos(cellInfo);

      if (qx.core.Client.getInstance().isMshtml() && /\.png$/i.test(urlAndToolTip.url)) {
        htmlArr.push(
          'src="', this.IMG_BLANK_URL, '" style="filter:',
          "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='",
          urlAndToolTip.url, "',sizingMethod='scale')", '" '
        );
      } else {
        htmlArr.push('src="', urlAndToolTip.url, '" ');
      }

      if (urlAndToolTip.imageWidth && urlAndToolTip.imageHeight) {
        htmlArr.push(
          ' width="', urlAndToolTip.imageWidth, 'px" height="',
          urlAndToolTip.imageHeight, 'px" '
        );
      }

      var tooltip = urlAndToolTip.tooltip;

      if (tooltip != null) {
        htmlArr.push('title="', tooltip, '" ');
      }

      htmlArr.push(">");
    }
  }
});
