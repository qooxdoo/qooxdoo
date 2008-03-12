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
 * A very complex decoration using two, partly combined and clipped images
 * to render a graphically impressive borders with gradients.
 *
 * The decoration supports all forms of vertical gradients. The gradients must
 * be stretchable to support different heights.
 *
 * The edges could use different styles of rounded borders. Even different
 * edge sizes are supported. The sizes are automatically detected by
 * the build system using the image metadata.
 *
 * The decoration uses clipped images to reduce the number of external
 * resources.
 */
qx.Class.define("qx.ui.decoration.Grid",
{
  extend : qx.core.Object,
  implement : qx.ui.decoration.IDecorator,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(baseImage)
  {
    this.base(arguments);

    if (baseImage) {
      this.setBaseImage(baseImage);
    }
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Base Image URL. All the different images needed are named by the default
     * naming scheme:
     *
     * ${baseImageWithoutExtension}-${imageName}.${baseImageExtension}
     *
     * These image names are used:
     *
     * * tl (top-left edge)
     * * tr (top-right edge)
     * * bl (bottom-left edge)
     * * br (bottom-right edge)
     *
     * * t (top side)
     * * r (right side)
     * * b (bottom side)
     * * l (left side)
     *
     * * c (center image)
     */
    baseImage :
    {
      check : "String",
      nullable : true,
      apply : "_changeBaseImage"
    },

    /** Whether the top border should be visible */
    topBorder :
    {
      check : "Boolean",
      init : true,
      apply : "_changeBorderVisibility"
    },

    /** Whether the right border should be visible */
    rightBorder :
    {
      check : "Boolean",
      init : true,
      apply : "_changeBorderVisibility"
    },

    /** Whether the bottom border should be visible */
    bottomBorder :
    {
      check : "Boolean",
      init : true,
      apply : "_changeBorderVisibility"
    },

    /** Whether the left border should be visible */
    leftBorder :
    {
      check : "Boolean",
      init : true,
      apply : "_changeBorderVisibility"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _changeBaseImage : function(value)
    {

    },

    _changeBorderVisibility : function(value)
    {

    },


    // interface implementation
    init : function(decorationElement) {
      // empty
    },


    // TODO: Make dynamic from image data
    __topWidth : 16,
    __rightWidth : 16,
    __bottomWidth : 16,
    __leftWidth : 16,



    __createInnerElement : function()
    {
      var pixel = "px";
      var topWidth = this.__topWidth;
      var rightWidth = this.__rightWidth;
      var bottomWidth = this.__bottomWidth;
      var leftWidth = this.__leftWidth;

      // Create edges and vertical sides
      // Order: tl, t, tr, bl, b, bt, l, c, r
      var html = [];
      html.push('<div style="position:absolute;top:0;left:0;"></div>');
      html.push('<div style="position:absolute;top:0;"></div>');
      html.push('<div style="position:absolute;top:0;right:0;"></div>');
      html.push('<div style="position:absolute;bottom:0;left:0;"></div>');
      html.push('<div style="position:absolute;bottom:0;"></div>');
      html.push('<div style="position:absolute;bottom:0;right:0;"></div>');
      html.push('<div style="position:absolute;left:0"></div>');
      html.push('<div style="position:absolute"></div>');
      html.push('<div style="position:absolute;right:0"></div>');

      var content = document.createElement("div");
      content.innerHTML = html.join("");

      // TODO: Move these to the markup above
      content.childNodes[0].style.width = leftWidth + pixel;
      content.childNodes[0].style.height = topWidth + pixel;

      content.childNodes[1].style.left = leftWidth + pixel;
      content.childNodes[1].style.height = topWidth + pixel;

      content.childNodes[2].style.width = rightWidth + pixel;
      content.childNodes[2].style.height = topWidth + pixel;

      content.childNodes[3].style.width = leftWidth + pixel;
      content.childNodes[3].style.height = bottomWidth + pixel;

      content.childNodes[4].style.left = leftWidth + pixel;
      content.childNodes[4].style.height = bottomWidth + pixel;

      content.childNodes[5].style.width = rightWidth + pixel;
      content.childNodes[5].style.height = bottomWidth + pixel;

      content.childNodes[6].style.top = topWidth + pixel;
      content.childNodes[6].style.width = leftWidth + pixel;

      content.childNodes[7].style.top = topWidth + pixel;
      content.childNodes[7].style.left = leftWidth + pixel;

      content.childNodes[8].style.top = topWidth + pixel;
      content.childNodes[8].style.width = rightWidth + pixel;


      // Test elements
      // Order: tl, t, tr, bl, b, bt, l, c, r
      content.childNodes[0].style.backgroundColor = "red";
      content.childNodes[1].style.backgroundColor = "maroon";
      content.childNodes[2].style.backgroundColor = "orange";
      content.childNodes[3].style.backgroundColor = "fuchsia";
      content.childNodes[4].style.backgroundColor = "green";
      content.childNodes[5].style.backgroundColor = "lime";
      content.childNodes[6].style.backgroundColor = "aqua";
      content.childNodes[7].style.backgroundColor = "yellow";
      content.childNodes[8].style.backgroundColor = "blue";

      return content;
    },


    // interface implementation
    update : function(decorationElement, width, height, backgroundColor)
    {
      var init = !decorationElement._element || !decorationElement._element.firstChild;
      var content = init ? this.__createInnerElement() : decorationElement._element.firstChild;
      var pixel = "px";

      // Sync width/height of outer element
      decorationElement.setStyle("width", width + pixel);
      decorationElement.setStyle("height", height + pixel);

      // Dimension dependending styles
      content.childNodes[1].style.width =
        content.childNodes[4].style.width =
        content.childNodes[7].style.width =
        (width - this.__leftWidth - this.__rightWidth) + pixel;

      content.childNodes[6].style.height =
        content.childNodes[7].style.height =
        content.childNodes[8].style.height =
        (height - this.__topWidth - this.__bottomWidth) + pixel;

      // Sync to HTML attribute
      if (init) {
        decorationElement.setAttribute("html", content.innerHTML);
      }
    },


    // interface implementation
    reset : function(decorationElement)
    {
      decorationElement.setStyles({
        "width" : null,
        "height" : null
      });
    },


    // interface implementation
    getInsets : function()
    {
      return {
        top : this.__topWidth,
        right : this.__rightWidth,
        bottom : this.__bottomWidth,
        left : this.__leftWidth
      }
    }
  }
});
