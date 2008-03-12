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
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

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
      var elWidth = width;
      var elHeight = height;

      var useContentBox = false;

      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        if (qx.bom.client.Feature.CONTENT_BOX)
        {
          elWidth -= horizontalInsets;
          elHeight -= verticalInsets;
          useContentBox = true;
        }
      }

      var styles = {};
      if (!useContentBox) {
        styles.boxSizing = "border-box"
      }

      styles.width = elWidth + "px";
      styles.height = elHeight + "px";

      decorationElement.setStyles(styles);
    }
  }

});