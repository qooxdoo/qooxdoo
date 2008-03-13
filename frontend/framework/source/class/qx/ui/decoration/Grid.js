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
     * * t (top side)
     * * tr (top-right edge)

     * * bl (bottom-left edge)
     * * b (bottom side)
     * * br (bottom-right edge)
     *
     * * l (left side)
     * * c (center image)
     * * r (right side)
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
      this.__markup = null;
      this.__images = null;

      // TODO: Queue update?
    },

    _changeBorderVisibility : function(value)
    {
      this.__markup = null;
      // TODO: Queue update?
    },


    // interface implementation
    init : function(decorationElement) {
      // empty
    },


    __computeMarkup : function()
    {
      // Compute image names
      var images = this.__images || this.__computeImages();

      // Resolve image data
      var reg = qx.util.ImageRegistry.getInstance();
      var tl = reg.resolve(images.tl);
      var t  = reg.resolve(images.t);
      var tr = reg.resolve(images.tr);
      var bl = reg.resolve(images.bl);
      var b  = reg.resolve(images.b);
      var br = reg.resolve(images.br);
      var l  = reg.resolve(images.l);
      var c  = reg.resolve(images.c);
      var r  = reg.resolve(images.r);

      // Store dimensions
      this.__insets =
      {
        top : t[4],
        bottom : b[4],
        left : l[3],
        right : r[3]
      };

      var middleWidth = l[3] + c[3] + r[3];

      var topWidth = this.__insets.top;
      var bottomWidth = this.__insets.bottom;
      var leftWidth = this.__insets.left;
      var rightWidth = this.__insets.right;

      // Create edges and vertical sides
      // Order: tl, t, tr, bl, b, bt, l, c, r
      var pixel = "px";
      var html = [];

      html.push(
        '<div style="position:absolute;top:0;left:0;',
        'width:', leftWidth,
        'px;height:', topWidth,
        'px;background:url(', tl[0] ,') no-repeat ', tl[1], 'px ', tl[2], 'px;"></div>'
      );
      html.push(
        '<div style="position:absolute;top:0;',
        'left:', leftWidth,
        'px;height:',topWidth,
        'px;background:url(', t[0] ,') repeat-x ', t[1], 'px ', t[2], 'px;"></div>'
      );
      html.push(
        '<div style="position:absolute;top:0;right:0;',
        'width:', rightWidth,
        'px;height:', topWidth,
        'px;background:url(', tr[0] ,') no-repeat ', tr[1], 'px ', tr[2], 'px;"></div>'
      );
      html.push(
        '<div style="position:absolute;bottom:0;left:0;',
        'width:', leftWidth,
        'px;height:', bottomWidth,
        'px;background:url(', bl[0] ,') no-repeat ', bl[1], 'px ', bl[2], 'px;"></div>'
      );
      html.push(
        '<div style="position:absolute;bottom:0;',
        'left:', leftWidth,
        'px;height:', bottomWidth,
        'px;background:url(', b[0] ,') repeat-x ', b[1], 'px ', b[2], 'px;"></div>'
      );
      html.push(
        '<div style="position:absolute;bottom:0;right:0;',
        'width:', rightWidth,
        'px;height:', bottomWidth,
        'px;background:url(', br[0] ,') no-repeat ', br[1], 'px ', br[2], 'px;"></div>'
      );
      html.push(
        '<img src="', l[0], '" style="position:absolute;left:0;',
        'top:', topWidth, 'px;width:', middleWidth, 'px;"></div>'
      );
      html.push(
        '<img src="', c[0], '" style="z-index:1;position:absolute;',
        'top:', topWidth, 'px;left:', leftWidth, 'px;"></div>'
      );
      html.push(
        '<img src="', r[0], '" style="position:absolute;right:0;',
        'top:', topWidth, 'px;width:', middleWidth, 'px;"></div>'
      );

      return this.__markup = html.join("");
    },


    __computeImages : function()
    {
      var base = this.getBaseImage();
      var split = /(.*)(\.[a-z]+)$/.exec(base);
      var prefix = split[1];
      var ext = split[2];

      return this.__images =
      {
        tl : prefix + "-tl" + ext,
        t : prefix + "-t" + ext,
        tr : prefix + "-tr" + ext,

        bl : prefix + "-bl" + ext,
        b : prefix + "-b" + ext,
        br : prefix + "-br" + ext,

        l : prefix + "-l" + ext,
        c : prefix + "-c" + ext,
        r : prefix + "-r" + ext
      };
    },

    __createInnerElement : function()
    {
      var content = document.createElement("div");
      content.innerHTML = this.__markup || this.__computeMarkup();
      return content;
    },

    // interface implementation
    update : function(decorationElement, width, height, backgroundColor)
    {
      var init = !decorationElement._element;
      var content = init ? this.__createInnerElement() : decorationElement._element;
      var pixel = "px";

      // Sync width/height of outer element
      decorationElement.setStyle("width", width + pixel);
      decorationElement.setStyle("height", height + pixel);
      decorationElement.setStyle("overflow", "hidden");

      var innerWidth = width - this.__insets.left - this.__insets.right;
      var innerHeight = height - this.__insets.top - this.__insets.bottom;


      // Dimension dependending styles
      content.childNodes[1].style.width =
      content.childNodes[4].style.width =
        innerWidth + pixel;

      content.childNodes[6].style.height =
      content.childNodes[7].style.height =
      content.childNodes[8].style.height =
        innerHeight + pixel;




      var spriteLeft = qx.util.ImageRegistry.getInstance().resolve(this.__images.l);
      var spriteCenter = qx.util.ImageRegistry.getInstance().resolve(this.__images.c);
      var spriteRight = qx.util.ImageRegistry.getInstance().resolve(this.__images.r);

      var imageWidth = spriteLeft[3] + spriteCenter[3] + spriteRight[3];
      var scalingFactor = Math.ceil(width / spriteCenter[3]);
      var finalWidth = imageWidth * scalingFactor;

      content.childNodes[7].style.width = finalWidth + pixel;
      content.childNodes[7].style.marginLeft = (-spriteLeft[3] * scalingFactor) + pixel;

      qx.bom.element.Clip.set(content.childNodes[7], {
        left : spriteLeft[3] * scalingFactor,
        top : null,
        width : innerWidth,
        height : null
      });

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
      if (!this.__insets) {
        this.__computeMarkup();
      }

      return this.__insets;
    }
  }
});
