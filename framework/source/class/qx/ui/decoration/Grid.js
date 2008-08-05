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
  extend : qx.ui.decoration.Abstract,




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
    },

    /** Width of the left inset */
    insetLeft :
    {
      check : "Number",
      init  : 0
    },

    /** Width of the right inset */
    insetRight :
    {
      check : "Number",
      init  : 0
    },

    /** Width of the bottom inset */
    insetBottom :
    {
      check : "Number",
      init  : 0
    },

    /** Width of the top inset */
    insetTop :
    {
      check : "Number",
      init  : 0
    },

    /** Property group for insets */
    insets :
    {
      group : [ "insetTop", "insetRight", "insetBottom", "insetLeft" ],
      mode  : "shorthand"
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
    },

    _changeBorderVisibility : function(value) {
      this.__markup = null;
    },

    __computeMarkup : function()
    {
      // Compute image names
      var images = this.__images || this.__computeImages();

      // Resolve image data
      var mgr = qx.util.ResourceManager;
      var tl = mgr.getClipped(images.tl);
      var t  = mgr.getClipped(images.t);
      var tr = mgr.getClipped(images.tr);
      var bl = mgr.getClipped(images.bl);
      var b  = mgr.getClipped(images.b);
      var br = mgr.getClipped(images.br);
      var l  = mgr.getClipped(images.l);
      var c  = mgr.getClipped(images.c);
      var r  = mgr.getClipped(images.r);
      
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!(tl&&t&&tr&&bl&&b&&br&&l&&c&&r)) {
          throw new Error("Invalid source for grid decorator: " + this.getBaseImage() + " => " + images.t);
        }
      }

      // Store dimensions
      this.__insets =
      {
        top : t[4],
        bottom : b[4],
        left : l[3],
        right : r[3]
      };

      var topWidth = this.__insets.top;
      var bottomWidth = this.__insets.bottom;
      var leftWidth = this.__insets.left;
      var rightWidth = this.__insets.right;


      // Create edges and vertical sides
      // Order: tl, t, tr, bl, b, bt, l, c, r
      var html = [];

      var leftCombined = mgr.getClipped(l[0]);
      var leftImageWidth = leftCombined ? leftCombined[3] : l[3];

      var rightCombined = mgr.getClipped(r[0]);
      var rightImageWidth = rightCombined ? rightCombined[3] : r[3];


      // Top: left, center, right
      html.push(
        '<div style="position:absolute;top:0;left:0;',
        'width:', leftWidth,
        'px;height:', topWidth, "px;",
        qx.bom.element.Background.compile(tl[0], "repeat-x", tl[1], tl[2]),
        '"></div>'
      );
      html.push(
        '<div style="position:absolute;top:0;',
        'left:', leftWidth,
        'px;height:',topWidth, 'px;',
        qx.bom.element.Background.compile(t[0], "repeat-x", t[1], t[2]),
        '"></div>'
      );
      html.push(
        '<div style="position:absolute;top:0;right:0;',
        'width:', rightWidth,
        'px;height:', topWidth, "px;",
        qx.bom.element.Background.compile(tr[0], "repeat-x", tr[1], tr[2]),
        '"></div>'
      );

      // Bottom: left, center, right
      html.push(
        '<div style="position:absolute;bottom:0;left:0;',
        'width:', leftWidth,
        'px;height:', bottomWidth, "px;",
        qx.bom.element.Background.compile(bl[0], "repeat-x", bl[1], bl[2]),
        '"></div>'
      );
      html.push(
        '<div style="position:absolute;bottom:0;',
        'left:', leftWidth,
        'px;height:', bottomWidth, "px;",
        qx.bom.element.Background.compile(b[0], "repeat-x", b[1], b[2]),
        '"></div>'
      );
      html.push(
        '<div style="position:absolute;bottom:0;right:0;',
        'width:', rightWidth,
        'px;height:', bottomWidth, "px;",
        qx.bom.element.Background.compile(br[0], "repeat-x", br[1], br[2]),
        '"></div>'
      );

      // Middle: left, center, right
      html.push(
        '<img src="', mgr.toUri(l[0]), '" style="position:absolute;left:' + l[1] + 'px;',
        'top:', topWidth,
        'px;width:', leftImageWidth,
        'px;', qx.bom.element.Clip.compile({left: -l[1], width: leftWidth}),'"/>'
      );
      html.push(
        '<img src="', mgr.toUri(c[0]), '" style="position:absolute;',
        'top:', topWidth, 'px;left:', leftWidth, 'px;"/>'
      );
      html.push(
        '<img src="', mgr.toUri(r[0]), '" style="position:absolute;',
        'right:', rightWidth - (rightImageWidth + r[1]) , 'px;top:', topWidth, 'px;width:', rightImageWidth,
        'px;', qx.bom.element.Clip.compile({left: -r[1], width: rightWidth}),'"/>'
      );

      return this.__markup = html.join("");
    },


    __computeImages : function()
    {
      var base = qx.util.AliasManager.getInstance().resolve(this.getBaseImage());
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
    render : function(element, width, height, backgroundColor, changes)
    {
      if (changes.style || changes.init)
      {
        if (element._element)
        {
          var content = element._element;
          content.innerHTML = this.__markup || this.__computeMarkup();
        } else {
          var content = this.__createInnerElement();
        }
      }

      if (!content) {
        var content = element._element ? element._element : this.__createInnerElement();
      }

      var pixel = "px";

      if (backgroundColor) {
      	element.setStyle("backgroundColor", this._resolveColor(backgroundColor));
      }
      
      // Sync width/height of outer element
      element.setStyle("width", width + pixel);
      element.setStyle("height", height + pixel);
      element.setStyle("overflow", "hidden");

      var innerWidth = width - this.__insets.left - this.__insets.right;
      var innerHeight = height - this.__insets.top - this.__insets.bottom;

      // Dimension dependending styles
      content.childNodes[1].style.width =
      content.childNodes[4].style.width =
      content.childNodes[7].style.width =
        innerWidth + pixel;

      content.childNodes[6].style.height =
      content.childNodes[7].style.height =
      content.childNodes[8].style.height =
        innerHeight + pixel;

      // Sync to HTML attribute
      if (!element._element) {
        element.setAttribute("html", content.innerHTML);
      }
    },


    // interface implementation
    reset : function(element) {
      element.setAttribute("html", "");
    },


    // interface implementation
    getInsets : function()
    {
      var insets = {
        left : this.getInsetLeft(),
        right : this.getInsetRight(),
        bottom : this.getInsetBottom(),
        top : this.getInsetTop()
      };

      return insets;
    }
  }
});
