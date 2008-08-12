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
  implement : [qx.ui.decoration.IDecorator],




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
      apply : "_applyBaseImage"
    },

    /** Width of the left inset (keep this margin to the outer box) */
    insetLeft :
    {
      check : "Number",
      init  : 0,
      apply : "_applyInsets"
    },

    /** Width of the right inset (keep this margin to the outer box) */
    insetRight :
    {
      check : "Number",
      init  : 0,
      apply : "_applyInsets"
    },

    /** Width of the bottom inset (keep this margin to the outer box) */
    insetBottom :
    {
      check : "Number",
      init  : 0,
      apply : "_applyInsets"
    },

    /** Width of the top inset (keep this margin to the outer box) */
    insetTop :
    {
      check : "Number",
      init  : 0,
      apply : "_applyInsets"
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
    /*
    ---------------------------------------------------------------------------
      INTERFACE IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    // interface implementation
    init : function(element) {
      element.useMarkup(this.getMarkup());
    },


    // interface implementation
    getMarkup : function()
    {
      if (this.__markup) {
        return this.__markup;
      }

      var base = qx.util.AliasManager.getInstance().resolve(this.getBaseImage());
      var split = /(.*)(\.[a-z]+)$/.exec(base);
      var prefix = split[1];
      var ext = split[2];

      // Store images
      var images =
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

      // Store edges
      this._edges =
      {
        top : t[4],
        bottom : b[4],
        left : l[3],
        right : r[3]
      };

      var topWidth = this._edges.top;
      var bottomWidth = this._edges.bottom;
      var leftWidth = this._edges.left;
      var rightWidth = this._edges.right;


      // Create edges and vertical sides
      // Order: tl, t, tr, bl, b, bt, l, c, r
      var html = [];

      var leftCombined = mgr.getClipped(l[0]);
      var leftImageWidth = leftCombined ? leftCombined[3] : l[3];

      var rightCombined = mgr.getClipped(r[0]);
      var rightImageWidth = rightCombined ? rightCombined[3] : r[3];


      // Base markup
      if (qx.core.Variant.isSet("qx.client", "mshtml")) {
        var base = "font-size:0;line-height:0;position:absolute;";
      } else {
        var base = "position:absolute;";
      }


      // Outer frame
      html.push('<div>');

      // Top: left, center, right
      html.push(
        '<div style="', base, 'top:0;left:0;',
        'width:', leftWidth,
        'px;height:', topWidth, "px;",
        qx.bom.element.Background.compile(tl[0], "repeat-x", tl[1], tl[2]),
        '"></div>'
      );
      html.push(
        '<div style="', base, 'top:0;',
        'left:', leftWidth,
        'px;height:',topWidth, 'px;',
        qx.bom.element.Background.compile(t[0], "repeat-x", t[1], t[2]),
        '"></div>'
      );
      html.push(
        '<div style="', base, 'top:0;right:0;',
        'width:', rightWidth,
        'px;height:', topWidth, "px;",
        qx.bom.element.Background.compile(tr[0], "repeat-x", tr[1], tr[2]),
        '"></div>'
      );

      // Bottom: left, center, right
      html.push(
        '<div style="', base, 'bottom:0px;left:0;',
        'width:', leftWidth,
        'px;height:', bottomWidth, "px;",
        qx.bom.element.Background.compile(bl[0], "repeat-x", bl[1], bl[2]),
        '"></div>'
      );

      html.push(
        '<div style="', base, 'bottom:0;',
        'left:', leftWidth,
        'px;height:', bottomWidth, "px;",
        qx.bom.element.Background.compile(b[0], "repeat-x", b[1], b[2]),
        '"></div>'
      );
      html.push(
        '<div style="', base, 'bottom:0;right:0;',
        'width:', rightWidth,
        'px;height:', bottomWidth, "px;",
        qx.bom.element.Background.compile(br[0], "repeat-x", br[1], br[2]),
        '"></div>'
      );

      // Middle: left, center, right
      html.push(
        '<img src="', mgr.toUri(l[0]), '" style="',
        'position:absolute;',
        'left:' + l[1] + 'px;',
        'top:', topWidth, 'px;',
        'width:', leftImageWidth, 'px;',
        qx.bom.element.Clip.compile({left: -l[1], width: leftWidth}),
        '"/>'
      );
      html.push(
        '<img src="', mgr.toUri(c[0]), '" style="',
        'position:absolute;',
        'top:', topWidth, 'px;left:', leftWidth, 'px;"/>'
      );
      html.push(
        '<img src="', mgr.toUri(r[0]), '" style="',
        'position:absolute;',
        'right:', rightWidth - (rightImageWidth + r[1]) , 'px;',
        'top:', topWidth, 'px;',
        'width:', rightImageWidth, 'px;',
        qx.bom.element.Clip.compile({left: -r[1], width: rightWidth}),
        '"/>'
      );

      // Outer frame
      html.push('</div>');

      // Store
      return this.__markup = html.join("");
    },


    // interface implementation
    resize : function(element, width, height)
    {
      // Compute inner sizes
      var innerWidth = width - this._edges.left - this._edges.right;
      var innerHeight = height - this._edges.top - this._edges.bottom;

      // Update nodes
      var frame = element.getDomElement();

      frame.style.width = width + "px";
      frame.style.height = height + "px";

      frame.childNodes[1].style.width = innerWidth + "px";
      frame.childNodes[4].style.width = innerWidth + "px";
      frame.childNodes[7].style.width = innerWidth + "px";

      frame.childNodes[6].style.height = innerHeight + "px";
      frame.childNodes[7].style.height = innerHeight + "px";
      frame.childNodes[8].style.height = innerHeight + "px";
    },


    // interface implementation
    tint : function(element, bgcolor) {
      // not implemented
    },


    // interface implementation
    getInsets : function()
    {
      if (this._insets) {
        return this._insets;
      }

      this._insets =
      {
        left : this.getInsetLeft(),
        right : this.getInsetRight(),
        bottom : this.getInsetBottom(),
        top : this.getInsetTop()
      };

      return this._insets;
    },






    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyInsets : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this.__markup) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }

      this._insets = null;
    },


    // property apply
    _applyBaseImage : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this.__markup) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    }
  }
});
