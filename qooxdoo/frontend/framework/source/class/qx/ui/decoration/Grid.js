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


    // interface implementation
    update : function(decorationElement, width, height, backgroundColor)
    {
      var init = !decorationElement._element || !decorationElement._element.firstChild;

      // Not yet created
      if (init)
      {
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
      }


      decorationElement.setStyle("width", width + "px");
      decorationElement.setStyle("height", height + "px");


      // Border widths
      // TODO: Make dynamic from image data
      var topWidth = 10;
      var rightWidth = 10;
      var bottomWidth = 10;
      var leftWidth = 10;

      // Order: tl, t, tr
      content.childNodes[0].style.width = leftWidth + "px";
      content.childNodes[0].style.height = topWidth + "px";

      content.childNodes[1].style.left = leftWidth + "px";
      content.childNodes[1].style.width = (width-leftWidth-rightWidth) + "px";
      content.childNodes[1].style.height = topWidth + "px";

      content.childNodes[2].style.width = rightWidth + "px";
      content.childNodes[2].style.height = topWidth + "px";


      // Order: bl, b, bt
      content.childNodes[3].style.width = leftWidth + "px";
      content.childNodes[3].style.height = bottomWidth + "px";

      content.childNodes[4].style.left = leftWidth + "px";
      content.childNodes[4].style.width = (width-leftWidth-rightWidth) + "px";
      content.childNodes[4].style.height = bottomWidth + "px";

      content.childNodes[5].style.width = rightWidth + "px";
      content.childNodes[5].style.height = bottomWidth + "px";


      // Order: l, c, r
      content.childNodes[6].style.top = topWidth + "px";
      content.childNodes[6].style.width = leftWidth + "px";
      content.childNodes[6].style.height = (height-topWidth-bottomWidth) + "px";

      content.childNodes[7].style.top = topWidth + "px";
      content.childNodes[7].style.left = leftWidth + "px";
      content.childNodes[7].style.height = (height-topWidth-bottomWidth) + "px";
      content.childNodes[7].style.width = (width-leftWidth-rightWidth) + "px";

      content.childNodes[8].style.top = topWidth + "px";
      content.childNodes[8].style.width = rightWidth + "px";
      content.childNodes[8].style.height = (height-topWidth-bottomWidth) + "px";



      // Test elements
      // Order: tl, t, tr, bl, b, bt, l, c, r
      content.childNodes[0].style.backgroundColor = "red";
      content.childNodes[1].style.backgroundColor = "maroon";
      content.childNodes[2].style.backgroundColor = "purple";
      content.childNodes[3].style.backgroundColor = "fuchsia";
      content.childNodes[4].style.backgroundColor = "green";
      content.childNodes[5].style.backgroundColor = "lime";
      content.childNodes[6].style.backgroundColor = "aqua";
      content.childNodes[7].style.backgroundColor = "yellow";
      content.childNodes[8].style.backgroundColor = "blue";




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
        "height" : null,
        "boxSizing" : null
      });
    },


    // interface implementation
    getInsets : function()
    {
      // TODO
      var width = 0;
      return {
        top : width,
        right : width,
        bottom : width,
        left : width
      }
    }
  }
});
