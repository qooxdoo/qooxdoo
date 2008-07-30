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

/**
 * A template class for cell renderer, which display images. Concrete
 * implementations must implement the method @{link #_identifyImage}.
 */
qx.Class.define("qx.ui.table.cellrenderer.AbstractImage",
{
  extend : qx.ui.table.cellrenderer.Abstract,
  type : "abstract",



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    var clazz = this.self(arguments);
    if (!clazz.stylesheet)
    {
      clazz.stylesheet = qx.bom.Stylesheet.createElement(
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
    _insetY : 2,

    /**
     * Identifies the Image to show. This is a template method, which must be
     * implements by sub classes.
     *
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
          url : urlAndTooltipMap,
          tooltip : null
        };
      }

      return urlAndTooltipMap;
    },


    // overridden
    _getCellClass : function(cellInfo) {
      return this.base(arguments) + " qooxdoo-table-cell-icon";
    },


    // overridden
    _getContentHtml : function(cellInfo)
    {
      var content = ['<span style="position:absolute;'];
      var urlAndToolTip = this._getImageInfos(cellInfo);

      // set image
      if (urlAndToolTip.url) {
        content.push(qx.bom.element.Background.compile(urlAndToolTip.url, "no-repeat"));
      }

      // set size
      if (urlAndToolTip.imageWidth && urlAndToolTip.imageHeight) {
        content.push(
          'width:', urlAndToolTip.imageWidth, 'px;height:',
          urlAndToolTip.imageHeight, 'px;',
          'margin-left:', (-urlAndToolTip.imageWidth >> 1), 'px" '
        );
      }

      // set tool tip
      var tooltip = urlAndToolTip.tooltip;
      if (tooltip != null) {
        content.push('title="', tooltip, '" ');
      }
      content.push("></span>");

      return content.join("");
    }
  }
});
