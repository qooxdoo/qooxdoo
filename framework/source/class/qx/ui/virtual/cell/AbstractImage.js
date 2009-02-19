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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * A template class for cell renderer, which display images. Concrete
 * implementations must implement the method @{link #_identifyImage}.
 */
qx.Class.define("qx.ui.virtual.cell.AbstractImage",
{
  extend : qx.ui.virtual.cell.Cell,
  type : "abstract",



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    // 
    // var clazz = this.self(arguments);
    // if (!clazz.__style)
    // {
    //   clazz.__style = qx.bom.Stylesheet.createElement(
    //     ".qooxdoo-cell-icon {" +
    //     "  text-align:center;" +
    //     "  padding-top:1px;" +
    //     "}"
    //   );
    // }
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    // overwritten
    getInsets : function(value, states) {
      return [0, 2];
    },


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
    _identifyImage : function(value) {
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
    _getImageInfos : function(value)
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
    _getCssClasses : function(cellInfo) {
      return this.base(arguments) + " qooxdoo-cell-icon";
    },


    // // overridden
    // getCellProperties : function(value, states)
    // {
    //   var urlAndToolTip = this._getImageInfos(value);
    // 
    //   var content = "<div></div>";
    // 
    //   // set image
    //   if (urlAndToolTip.url) {
    //     var content = qx.bom.element.Decoration.create(urlAndToolTip.url, "no-repeat", {
    //       width: urlAndToolTip.imageWidth ? urlAndToolTip.imageWidth + "px" : null,
    //       height: urlAndToolTip.imageHeight ? urlAndToolTip.imageHeight + "px" : null,
    //     });
    //   };
    // 
    //   // set tool tip
    //   var tooltip = urlAndToolTip.tooltip;
    //   if (tooltip != null) {
    //     var content = content.replace("></div>", "title='"+tooltip+"'></div>");
    //   }
    // 
    //   return content;
    // }




    _getStyles : function(value, states)
    {
      //       display: qx.bom.client.Engine.GECKO && qx.bom.client.Engine.VERSION < 1.9 ? "-moz-inline-box" : "inline-block",
      //       verticalAlign: "top",
      //       position: "static"
    },

    getCellProperties : function(value, states)
    {
      return {
        classes : this._getCssClasses(value, states),
        style : '',
        attributes : this._getAttributes(value, states),
        content : this._getValue(value, states),
        insets : this._getInsets(value, states)
      };
    }

  }
});
