/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2008 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Carsten Lergenmueller (carstenl)
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Abstract Icon cell renderer.
 */
qx.Class.define("qx.ui.progressive.renderer.table.cell.Icon",
{
  type       : "abstract",
  extend     : qx.ui.progressive.renderer.table.cell.Abstract,


  /** Create a new instance of an Icon cell renderer */
  construct : function()
  {
    this.base(arguments);

    var aliasManager = qx.util.AliasManager.getInstance();
    var resourceManager = qx.util.ResourceManager.getInstance();
    var blankImg = aliasManager.resolve("qx/static/blank.gif");

    this.__imageBlank = resourceManager.toUri(blankImg);
  },


  members :
  {
    /**
     * A blank image for use as a spacer in place of another image
     */
    __imageBlank : null,


    /**
     * Retrieve the URI for a blank image
     *
     * @return {String}
     *   The URI of the blank image.
     */
    getBlankImage : function()
    {
      return this.__imageBlank;
    },

    /**
     * Identify the image to be displayed in the cell.
     *
     * @param cellInfo {Map}
     *   Information about the cell being renderered, including:
     *   <ul>
     *     <li>state</li>
     *     <li>rowDiv</li>
     *     <li>stylesheet</li>
     *     <li>element</li>
     *     <li>dataIndex</li>
     *     <li>cellData</li>
     *     <li>height</li>
     *   </ul>
     *
     * @return {Map}
     *   The returned map should contain at least the <i>url</i> field, but
     *   may contain any others of these:
     *
     *   <dl>
     *     <dt>
     *       url
     *     </dt>
     *     <dd>
     *       The URL of the image to be displayed
     *     </dd>
     *
     *     <dt>
     *       imageWidth
     *     </dt>
     *     <dd>
     *       The width at which the image should be displayed
     *     </dd>
     *
     *     <dt>
     *       imageHeight
     *     </dt>
     *     <dd>
     *       The height at which the image should be displayed
     *     </dd>
     *
     *     <dt>
     *       extras
     *     </dt>
     *     <dd>
     *       Any extra attributes to be include in the 'image' tag.
     *     </dd>
     *   </dl>
     */
    _identifyImage : function(cellInfo)
    {
      throw new Error("_identifyImage() is abstract");
    },

    // overridden
    _getCellStyle : function(cellInfo)
    {
      var ret =
        this.base(arguments, cellInfo) +
        "text-align:center;" +
        "vertical-align:middle;";
      return ret;
    },

    // overridden
    _getContentHtml : function(cellInfo)
    {
      var html = [ ];
      var imageData = this.__getImageData(cellInfo);

      // Start the image tag
      html.push('<img ');

      // Add magic to make png images work in IE
      if (qx.core.Environment.get("css.alphaimageloaderneeded") &&
          /\.png$/i.test(imageData.url))
      {
        html.push('src="', this.__imageBlank, '" style="filter:',
                  "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='",
                  imageData.url,
                  "',sizingMethod='scale')",
                  '" ');
      }
      else
      {
        html.push('src="', imageData.url, '" ');
      }

      // If image width is specified...
      if (imageData.imageWidth)
      {
        // ... then add it.
        html.push(" width='", imageData.imageWidth, "px'");
      }

      // If image height is specified...
      if (imageData.imageHeight)
      {
        // ... then add it.
        html.push(" height='", imageData.imageHeight, "px'");
      }

      // Move the image off of the top border
      html.push(" style='padding-top:2px;'");

      // If a tooltip is specified...
      if (imageData.tooltip)
      {
        // ... then add it.
        html.push(" title='", imageData.tooltip, "'");
      }

      // If there are any extra parameters specified, add them now.
      if (imageData.extras)
      {
        html.push(imageData.extras);
      }

      // All done.
      html.push(">");

      // Give 'em what they came for
      return html.join("");
    },

    /**
     * Obtain the image data (url, tooltip) that's appropriate for this cell
     *
     * @param cellInfo {Map}
     *   Information about the cell being renderered, including:
     *   <ul>
     *     <li>state</li>
     *     <li>rowDiv</li>
     *     <li>stylesheet</li>
     *     <li>element</li>
     *     <li>dataIndex</li>
     *     <li>cellData</li>
     *     <li>height</li>
     *   </ul>
     *
     * @return {Map}
     *   See {@link #_identifyImage}
     */
    __getImageData : function(cellInfo)
    {
      // Query the subclass about image and tooltip
      var imageData = this._identifyImage(cellInfo);

      // If subclass refuses to give map, construct it
      if (imageData == null || typeof imageData == "string")
      {
        imageData =
        {
          url     : imageData,
          tooltip : null
        };
      }

      // If subclass gave null as url, replace with url to empty image
      if (imageData.url == null)
      {
        imageData.url = this.__imageBlank;
      }

      return imageData;
    }
  }
});
