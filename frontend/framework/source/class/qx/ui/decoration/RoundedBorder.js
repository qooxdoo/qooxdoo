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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A decorator class, which supports rounded borders. On FireFox and Webkit
 * the native CSS features are used. In Internet Explorer the borders are
 * rendered using VML.
 */
qx.Class.define("qx.ui.decoration.RoundedBorder",
{
  extend : qx.ui.decoration.Basic,



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTY: WIDTH
    ---------------------------------------------------------------------------
    */

    /** Radius of the top left corner */
    radiusTopLeft :
    {
      check : "typeof(value) === 'number' || value instanceof Array",
      init : 0,
      apply : "_applyBorderChange"
    },

    /** Radius of the top right corner */
    radiusTopRight :
    {
      check : "typeof(value) === 'number' || value instanceof Array",
      init : 0,
      apply : "_applyBorderChange"
    },

    /** Radius of the bottom right corner */
    radiusBottomRight :
    {
      check : "typeof(value) === 'number' || value instanceof Array",
      init : 0,
      apply : "_applyBorderChange"
    },

    /** Radius of the bottom left corner */
    radiusBottomLeft :
    {
      check : "typeof(value) === 'number' || value instanceof Array",
      init : 0,
      apply : "_applyBorderChange"
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY GROUP: RADIUS
    ---------------------------------------------------------------------------
    */

    /**
     * Property group for the border radius.
     */
    radius :
    {
      group : [ "radiusTopLeft", "radiusTopRight", "radiusBottomRight", "radiusBottomLeft" ],
      mode : "shorthand"
    },

    /**
     * Only Internet Explorer: Toggle use of anti aliasing. FireFox 2 never uses
     * anti aliasing. All other browsers will always use it.
     */
    antiAlias :
    {
      check : "Boolean",
      init : true,
      apply : "_applyBorderChange"
    }

  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _getStyles : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(width, height)
      {
        var style = this.base(arguments, width, height);

        var topLeft = this.getRadiusTopLeft();
        style.MozBorderRadiusTopleft = (topLeft instanceof Array ? topLeft.join("px ") : topLeft) + "px";

        var topRight = this.getRadiusTopRight();
        style.MozBorderRadiusTopright = (topRight instanceof Array ? topRight.join("px ") : topRight) + "px";

        var bottomRight = this.getRadiusBottomRight();
        style.MozBorderRadiusBottomright = (bottomRight instanceof Array ? bottomRight.join("px ") : bottomRight) + "px";

        var bottomLeft = this.getRadiusBottomLeft();
        style.MozBorderRadiusBottomleft = (bottomLeft instanceof Array ? bottomLeft.join("px ") : bottomLeft) + "px";

        return style;
      },

      "webkit" : function(width, height)
      {
        var style = this.base(arguments, width, height);

        var topLeft = this.getRadiusTopLeft();
        style.WebkitBorderTopLeftRadius = (topLeft instanceof Array ? topLeft.join("px ") : topLeft) + "px";

        var topRight = this.getRadiusTopRight();
        style.WebkitBorderTopRightRadius = (topRight instanceof Array ? topRight.join("px ") : topRight) + "px";

        var bottomRight = this.getRadiusBottomRight();
        style.WebkitBorderBottomRightRadius = (bottomRight instanceof Array ? bottomRight.join("px ") : bottomRight) + "px";

        var bottomLeft = this.getRadiusBottomLeft();
        style.WebkitBorderBottomLeftRadius = (bottomLeft instanceof Array ? bottomLeft.join("px ") : bottomLeft) + "px";

        return style;
      },

      "default" : function(width, height) {
        return this.base(arguments, width, height);
      }
    }),


    // overridden
    reset : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(decorationElement)
      {
        this.base(arguments, decorationElement);
        decorationElement.setStyles({
          MozBorderRadiusTopleft: null,
          MozBorderRadiusTopright: null,
          MozBorderRadiusBottomright: null,
          MozBorderRadiusBottomleft: null
        });
      },

      "webkit" : function(decorationElement)
      {
        this.base(arguments, decorationElement);
        decorationElement.setStyles({
          WebkitBorderTopRightRadius: null,
          WebkitBorderTopLeftRadius: null,
          WebkitBorderBottomRightRadius: null,
          WebkitBorderBottomLeftRadius: null
        });
      },

      "mshtml" : function(decorationElement) {
        decorationElement.setAttribute("html", null);
      },

      "default" : function(decorationElement) {
        return this.base(arguments, decorationElement);
      }
    }),


    // overridden
    init : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(decorationElement) {
        decorationElement.setAttribute("html", null);
      },

      "default" : function(decorationElement) {
        this.base(arguments, decorationElement);
      }
    }),


    // overridden
    update : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(decorationElement, width, height, backgroundColor)
      {
        // use VML in IE to render borders
        // http://www.w3.org/TR/NOTE-VML

        var fillColor = backgroundColor || this.__bgColor || "white";

        // VML currently only supports the "imageRepeat" = "repeat"
        var backgroundImage = this.getBackgroundImage();
        if (backgroundImage) {
          fill = '<v:fill type="tile" src="'+backgroundImage+'"/>'
        } else {
          fill = "";
        }


        // width shortcuts
        var tw = this.getWidthTop();
        var rw = this.getWidthRight();
        var bw = this.getWidthBottom()
        var lw = this.getWidthLeft();

        // radius shortcuts
        var tl = this.getRadiusTopLeft();
        var tr = this.getRadiusTopRight();
        var br = this.getRadiusBottomRight();
        var bl = this.getRadiusBottomLeft();

        // size shortcuts
        var w = width;
        var h = height;

        // positions of the background
        var xl = lw;
        var xr = w - rw;
        var yt = tw;
        var yb = h - bw;

        // inner radius of the background
        var tli = Math.min(tl-tw, tl-lw);
        var tri = Math.min(tr-rw, tr-tw);
        var bri = Math.min(br-rw, br-bw);
        var bli = Math.min(bl-bw, bl-lw);

        var allRadiiNull = tl == 0 && tr == 0 && br == 0 && bl == 0;
        var allBorderWidthsNull = tw == 0 && rw == 0 && bw == 0 && lw == 0;
        var anyBorderWidthNull = (tw == 0 || rw == 0 || bw == 0 || lw == 0);

        var allColorsEqual =
          (this.__colorLeft == this.__colorTop) &&
          (this.__colorRight == this.__colorBottom) &&
          (this.__colorLeft == this.__colorBottom);

        var aa = this.getAntiAlias() && !allRadiiNull ? "true" : "false";

        // shortcut: if all border colors are equal and no border width if null,
        //     draw the border as one piece and draw the background over the
        //     border.
        //     If all borders are null only draw the background.
        if (
          (allColorsEqual && !anyBorderWidthNull) ||
          allBorderWidthsNull
        )
        {
          var lines = [];

          // top line
          if (tri > 0) {
            lines.push(' l ', xr-tri, ',', yt, ' qx ', xr, ',', yt+tri);
          } else {
            lines.push(' l ', xr, ',', yt);
          }

          // right line
          if (bri > 0) {
            lines.push(' l ', xr, ',', yb-bri, ' qy ', xr-bri, ',', yb);
          } else {
            lines.push(' l ', xr, ',', yb);
          }

          // bottom line
          if (bli > 0)
          {
            lines.push(' l ', xl+bli, ',', yb, ' qx ', xl, ',', yb-bli);
          } else {
            lines.push(' l ', xl, ',', yb);
          }

          // left line
          if (tli > 0)
          {
            lines.push(' l ', xl, ',', yt+tli, ' qy ', xl+tli, ',', yt);
          } else {
            lines.push(' l ', xl, ',', yt);
          }

          var background = [
            '<v:shape fillcolor="', fillColor, '" style=";width:', w, ';height:', h, '">',
            '<v:path v="m ', xl, ',', yt, ' ns ', lines.join(""), ' x e"/>',
            '</v:shape>'
          ];
          if (fill) {
            background.push(
              '<v:shape style=";width:', w, ';height:', h, '">',
              fill,
              '<v:path v="m ', xl, ',', yt, ' ns ', lines.join(""), ' x e"/>',
              '</v:shape>'
            )
          }

          if (!allBorderWidthsNull)
          {
            var border = [
              '<v:shape fillcolor="', this.__colorLeft, '" style=";width:', w, ';height:', h, '">',
              '<v:path v="',
              ' m ', tl, ',0',
              ' ns l ', w-tr, ',0',
              ' qx ', w, ',', tr,
              ' l ', w, ',', h-br,
              ' qy ', w-br, ',', h,
              ' l ', bl, ',', h,
              ' qx ', 0, ',', h-bl,
              ' l 0,',tl,
              ' qy ', tl, ',', 0,
              ' x e"/>',
              '</v:shape>'
            ];
          }
          else
          {
            border = [];
          }

          var template = [
            '<v:group coordorigin="0 0" coordsize="', w, ' ', h,
            '" style="position:absolute;top:0;left:0;',
            'antialias:', aa, ';width:', w, ';height:', h, '">',
            border.join(''),
            background.join(''),
            '</v:group>'
          ];
        }
        else
        {
          // top border
          if (tw > 0)
          {
            var topBorder = [
              '<v:shape fillcolor="', this.__colorTop, '" style=";width:', w, ';height:', h, '">',
              '<v:path v="'
            ];
            if (tli <= 0) {
              topBorder.push(' m ', xl, ',', yt, ' ns ');
            } else {
              topBorder.push(
                ' m ', xl+tli, ',', yt,
                ' ns at ', xl, ',', yt, ',', xl+(tli*2), ',', yt+(tli*2), ',', xl+tli, ',', yt, ',', xl, ',', yt
              );
            }
            topBorder.push(
              ' wa 0,0,', tl*2, ',', tl*2, ',0,', 0, ',', tl, ',0',
              ' wa ', w-(tr*2), ',0,', w, ',', tr*2, ',', w-tr, ',', 0, ',', w, ',', 0
            );
            if (tri <= 0) {
              topBorder.push(' l ', xr, ',', yt);
            } else {
              topBorder.push('at ', xr-(tri*2), ',', yt, ',', xr, ',', yt+(tri*2), ',', xr, ',', yt, ',', xr-tri, ',', yt);
            }
            topBorder.push(' x e"/></v:shape>');
          }
          else {
            topBorder = [];
          }


          // right border
          if (rw > 0)
          {
            var rightBorder = [
              '<v:shape fillcolor="', this.__colorRight, '" style=";width:', w, ';height:', h, '">',
              '<v:path v="'
            ];
            if (tri <= 0) {
              rightBorder.push(' m ', xr, ',', yt, ' ns ');
            } else {
              rightBorder.push(
                ' m ', xr, ',', yt+tri,
                ' ns at ', xr-(tri*2), ',', yt, ',', xr, ',', yt+(tri*2), ',', xr, ',', yt+tri, ',', xr, ',', yt
              );
            }
            rightBorder.push(
              ' wa ', w-(tr*2), ',0,', w, ',', tr*2, ',', w, ',', 0, ',', w, ',', tr,
              ' wa ', w-(br*2), ',', h-(br*2), ',', w, ',', h, ', ', w, ',', h-br, ', ', w, ',', h
            );
            if (bri <= 0) {
              rightBorder.push(' l ', xr, ',', yb);
            } else {
              rightBorder.push('at ', xr-(bri*2), ',', yb-(bri*2), ',', xr, ',', yb, ',', xr, ',', yb, ',', xr, ',', yb-bri);
            }
            rightBorder.push(' x e"/></v:shape>');
          }
          else {
            rightBorder = [];
          }


          // bottom border
          if (bw > 0)
          {
            var bottomBorder = [
              '<v:shape fillcolor="', this.__colorBottom, '" style=";width:', w, ';height:', h, '">',
              '<v:path v="'
            ];
            if (bri <= 0) {
              bottomBorder.push(' m ', xr, ',', yb, ' ns ');
            } else {
              bottomBorder.push(
                ' m ', xr-bri, ',', yb,
                ' ns at ', xr-(bri*2), ',', yb-(bri*2), ',', xr, ',', yb, ',', xr-bri, ',', yb, ',', xr, ',', yb
              );
            }

            bottomBorder.push(
              ' wa ', w-(br*2), ',', h-(br*2), ',', w, ',', h, ', ', w, ',', h, ', ', w-br, ',', h,
              ' wa 0,', h-(2*bl), ',', bl*2, ',', h, ', ', bl, ',', h, ', 0,', h
            );

            if (bli <= 0) {
              bottomBorder.push(' l ', xl, ',', yb);
            } else {
              bottomBorder.push('at ', xl, ',', yb-(bli*2), ',', xl+(bli*2), ',', yb, ',', xl, ',', yb, ',', xl+bli, ',', yb);
            }

            bottomBorder.push(' x e"/></v:shape>');
          }
          else
          {
            bottomBorder = [];
          }


          // left border
          if (lw > 0)
          {
            var leftBorder = [
              '<v:shape fillcolor="', this.__colorLeft, '" style=";width:', w, ';height:', h, '">',
              '<v:path v="'
            ];

            if (bli <= 0) {
              leftBorder.push(' m ',xl,',', yb, ' ns ');
            } else {
              leftBorder.push(' m ', xl, ',', yb-bli);
              leftBorder.push('ns at ', xl, ',', yb-(bli*2), ',', xl+(bli*2), ',', yb, ',', xl, ',', yb-bli, ',', xl, ',', yb);
            }

            leftBorder.push(
              ' wa 0,', h-(2*bl), ',', bl*2, ',', h, ', 0,', h, ', 0,', h-bl,
              ' wa 0,0,', tl*2, ',', tl*2, ',0,', tl, ',', 0, ',0'
            );

            if (tli <= 0) {
              leftBorder.push(' l ', xl, ',', yt);
            } else {
              leftBorder.push('at ', xl, ',', yt, ',', xl+(tli*2), ',', yt+(tli*2), ',', xl, ',', yt, ',', xl, ',', yt+tli);
            }
            leftBorder.push(' x e"/></v:shape>');
          }
          else
          {
            leftBorder = [];
          }

          // offsets to the normal positions into the shape. This is needed to
          // avoid the background shining through the borders at the edges.
          var to = tw == 0 ? 0 : 1;
          var ro = rw == 0 ? 0 : 1;
          var bo = bw == 0 ? 0 : 1;
          var lo = lw == 0 ? 0 : 1;

          var background = [
            '<v:shape fillcolor="', fillColor, '" style=";width:', w, ';height:', h, '">',
            '<v:path v="',
            ' m ', tl, ',', to,
            ' ns l ', w-tr, ',', to,
            ' qx ', w-ro, ',', tr,

            ' l ', w-ro, ',', h-br,
            ' qy ', w-br, ',', h-bo,

            ' l ', bl, ',', h-bo,
            ' qx ', lo, ',', h-bl,

            ' l ', lo, ',', tl,
            ' qy ', tl, ',', to,

             ' x e"/>',
            '</v:shape>'
          ];

          var template = [
            '<v:group coordorigin="0 0" coordsize="', w, ' ', h,
            '" style="position:absolute;top:0;left:0;',
            'antialias:', aa, ';width:', w, ';height:', h, '">',
            background.join(''),
            topBorder.join(''),
            rightBorder.join(''),
            bottomBorder.join(''),
            leftBorder.join(''),
            '</v:group>'
          ];
        }

        //this.debug(qx.bom.String.escape(template.join('')));
        decorationElement.setAttribute("html", template.join(''));
      },

      "default" : function(decorationElement, width, height, backgroundColor) {
        this.base(arguments, decorationElement, width, height, backgroundColor);
      }
    })
  },


  defer : qx.core.Variant.select("qx.client",
  {
    "mshtml" : function(statics)
    {
      // Simple pointer to create a pseudo dependency.
      qx.bom.Vml;
    },

    "default" : function(statics) {}
  })
});
