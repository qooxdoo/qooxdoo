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
    
    this.__defaultWidth = 16;
    this.__defaultHeight = 16;
    this.__aliasManager = qx.util.AliasManager.getInstance();
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

    __defaultWidth : null,
    __defaultHeight : null,
    __aliasManager : null,

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
    _identifyImage : function(value, states) {
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
    __getImageInfos : function(value)
    {
      // Query the subclass about image and tooltip
      var urlAndTooltipMap = this._identifyImage(value);

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
    getCssClasses : function(value, states) {
      return this.base(arguments) + " qooxdoo-cell-icon";
    },


    getStyles : function(value, states)
    {
    },

    getCellProperties : function(value, states)
    {
      return {
        classes : this.getCssClasses(value, states),
        style : this.getStyles(value, states),
        attributes : this.getAttributes(value, states),
        content : this.getContent(value, states),
        insets : this.getInsets(value, states)
      };
    }

  }
});
