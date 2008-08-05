/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Helper class for common decorator functionality
 */
qx.Class.define("qx.ui.decoration.Util",
{
  statics :
  {
    /**
     * Update the element's size respecting the current box model
     *
     * @param decorationElement {qx.html.Element} The widget's decoration element.
     * @param height {Integer} The widget's new height
     * @param width {Integer} The widget's new width
     * @param horizontalInsets {Integer} The sum of the horizontal border widths
     *     and paddings applied to the element
     * @param verticalInsets {Integer} The sum of the vertical border heights
     *     and paddings applied to the element
     */
    updateSize : function(decorationElement, width, height, horizontalInsets, verticalInsets)
    {
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        if (qx.bom.client.Feature.CONTENT_BOX)
        {
          width -= horizontalInsets;
          height -= verticalInsets;
        }
      }
      else
      {
        decorationElement.setStyle("boxSizing", "border-box");
      }

      decorationElement.setStyle("width", width + "px");
      decorationElement.setStyle("height", height + "px");
    },



    generateBasicDecor : function(image, repeat, styles)
    {
      var html = [];
      var tag = image && repeat == "scale" ? "img" : "div";

      // Starttag
      html.push('<', tag, ' ');

      // Support for images
      if (image)
      {
        var resolved = qx.util.AliasManager.getInstance().resolve(image);

        // Scaled image
        if (repeat == "scale")
        {
          var Resource = qx.util.ResourceManager;
          var uri = Resource.toUri(resolved);
          html.push('src="', uri, '" style="');
        }

        // Repeated image
        else
        {
          html.push('style="');

          var Background = qx.bom.element.Background;
          html.push(Background.compile(resolved, repeat, 0, 0));
        }
      }
      else
      {
        html.push('style="');
      }

      html.push('width:{width}px;height:{height}px;background-color:{bgcolor};');

      if (styles) {
        html.push(qx.bom.element.Style.compile(styles));
      }

      html.push('"></', tag, '>');

      return html;
    }
  }
});
