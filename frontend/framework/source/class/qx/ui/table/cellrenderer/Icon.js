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
qx.Class.define("qx.ui.table.cellrenderer.Icon",
{
  extend : qx.ui.table.cellrenderer.Abstract,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this.IMG_BLANK_URL = qx.io.Alias.getInstance().resolve("static/image/blank.gif");
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    MAIN_DIV_STYLE  : ';text-align:center;padding-top:1px;',
    IMG_START       : '<img src="',
    IMG_END         : '"/>',
    IMG_TITLE_START : '" title="',
    TABLE_DIV       : '<div style="overflow:hidden;height:',
    TABLE_DIV_CLOSE : 'px">',
    TABLE_DIV_END   : '</div>'
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
    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @return {var} TODOC
     */
    _getCellStyle : function(cellInfo)
    {
      var style = qx.ui.table.cellrenderer.Abstract.prototype._getCellStyle(cellInfo);
      style += qx.ui.table.cellrenderer.Icon.MAIN_DIV_STYLE;
      return style;
    },

    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @return {String} TODOC
     */
    _getContentHtml : function(cellInfo)
    {
      var IconDataCellRenderer = qx.ui.table.cellrenderer.Icon;

      var urlAndToolTip = this._getImageInfos(cellInfo);
      var html = IconDataCellRenderer.IMG_START;

      if (qx.core.Client.getInstance().isMshtml() && /\.png$/i.test(urlAndToolTip.url)) {
        html += this.IMG_BLANK_URL + '" style="filter:' + "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + urlAndToolTip.url + "',sizingMethod='scale')";
      } else {
        html += urlAndToolTip.url + '" style="';
      }

      if (urlAndToolTip.imageWidth && urlAndToolTip.imageHeight) {
        html += ';width:' + urlAndToolTip.imageWidth + 'px' + ';height:' + urlAndToolTip.imageHeight + 'px';
      }

      var tooltip = urlAndToolTip.tooltip;

      if (tooltip != null) {
        html += IconDataCellRenderer.IMG_TITLE_START + tooltip;
      }

      html += IconDataCellRenderer.IMG_END;
      return html;
    },

    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @param cellElement {var} TODOC
     * @return {void}
     */
    updateDataCellElement : function(cellInfo, cellElement)
    {
      // Set image and tooltip text
      var urlAndToolTip = this._getImageInfos(cellInfo);

      var img = cellElement.firstChild;

      if(img.src == urlAndToolTip.url) {
        return;
      }

      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        if (/\.png$/i.test(urlAndToolTip.url))
        {
          img.src = this.IMG_BLANK_URL;
          img.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + urlAndToolTip.url + "',sizingMethod='scale')";
        }
        else
        {
          img.src = urlAndToolTip.url;
          img.style.filter = "";
        }
      }
      else
      {
        img.src = urlAndToolTip.url;
      }

      if (urlAndToolTip.imageWidth && urlAndToolTip.imageHeight)
      {
        img.style.width = urlAndToolTip.imageWidth + "px";
        img.style.height = urlAndToolTip.imageHeight + "px";
      }

      if (urlAndToolTip.tooltip != null) {
        img.setAttribute("title", urlAndToolTip.tooltip);
      }
    },

    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @param htmlArr {var} TODOC
     * @return {void}
     */
    _createCellStyle_array_join : function(cellInfo, htmlArr)
    {
      qx.ui.table.cellrenderer.Abstract.prototype._createCellStyle_array_join(cellInfo, htmlArr);

      htmlArr.push(qx.ui.table.cellrenderer.Icon.MAIN_DIV_STYLE);
    },


    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @param htmlArr {var} TODOC
     * @return {void}
     */
    _createContentHtml_array_join : function(cellInfo, htmlArr)
    {
      var IconDataCellRenderer = qx.ui.table.cellrenderer.Icon;

      if (qx.ui.table.pane.Pane.USE_TABLE)
      {
        htmlArr.push(IconDataCellRenderer.TABLE_DIV);
        htmlArr.push(cellInfo.styleHeight - 2); // -1 for the border, -1 for the padding
        htmlArr.push(IconDataCellRenderer.TABLE_DIV_CLOSE);
      }

      htmlArr.push(IconDataCellRenderer.IMG_START);
      var urlAndToolTip = this._getImageInfos(cellInfo);
      htmlArr.push(urlAndToolTip.url);
      var tooltip = urlAndToolTip.tooltip;

      if (tooltip != null)
      {
        IconDataCellRenderer.IMG_TITLE_START;
        htmlArr.push(tooltip);
      }

      htmlArr.push(IconDataCellRenderer.IMG_END);

      if (qx.ui.table.pane.Pane.USE_TABLE) {
        htmlArr.push(IconDataCellRenderer.TABLE_DIV_END);
      }
    }
  }
});
