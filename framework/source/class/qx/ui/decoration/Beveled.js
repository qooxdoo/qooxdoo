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
 *
 */
qx.Class.define("qx.ui.decoration.Beveled",
{
  extend : qx.ui.decoration.Abstract,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(outerColor, innerColor)
  {
    this.base(arguments);

    if (outerColor) {
      this.setOuterColor(outerColor);
    }

    if (innerColor) {
      this.setInnerColor(innerColor);
    }
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    innerColor :
    {
      check : "Color",
      nullable : true,
      apply : "_applyInnerColor"
    },

    innerOpacity :
    {
      check : "Number",
      init : 1,
      apply : "_applyInnerOpacity"
    },

    outerColor :
    {
      check : "Color",
      nullable : true,
      apply : "_applyOuterColor"
    },

    backgroundImage :
    {
      check : "String",
      nullable : true,
      apply : "_applyBackgroundImage"
    },

    backgroundColor :
    {
      check : "Color",
      nullable : true,
      apply : "_applyBackgroundColor"
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
    // property apply
    _applyInnerColor : function(value, old) {
    },

    // property apply
    _applyOuterColor : function(value, old) {
    },

    _applyBackgroundImage : function()
    {

    },

    _applyBackgroundColor : function()
    {
    },



    _applyInnerOpacity : function()
    {
    },



    _changeBorderVisibility : function(value)
    {
      // TODO
    },



    // interface implementation
    render : function(element, width, height, backgroundColor, changes)
    {
      if (!element.getChild(0))
      {
        var frame = new qx.html.Element;
        var horiz = new qx.html.Element;
        var vert = new qx.html.Element;
        var inner = new qx.html.Image;
        var overlay = new qx.html.Element;

        element.add(frame, horiz, vert);
        vert.add(inner, overlay);

        // Position
        frame.setStyle("position", "absolute");
        horiz.setStyle("position", "absolute");
        vert.setStyle("position", "absolute");
        inner.setStyle("position", "absolute");
        overlay.setStyle("position", "absolute");
      }


      var pixel = "px";

      var frame = element.getChild(0);
      var horiz = element.getChild(1);
      var vert = element.getChild(2);
      var inner = vert.getChild(0);
      var overlay = vert.getChild(1);

      var outerStyle = "1px solid " + this._resolveColor(this.getOuterColor());
      var innerStyle = "1px solid " + this._resolveColor(this.getInnerColor());

      var bgSource = qx.util.ResourceManager.toUri(qx.util.AliasManager.getInstance().resolve(this.getBackgroundImage()));


      // Colors
      frame.setStyle("border", outerStyle);
      frame.setStyle("opacity", 0.35);

      horiz.setStyle("borderLeft", outerStyle);
      horiz.setStyle("borderRight", outerStyle);

      vert.setStyle("borderTop", outerStyle);
      vert.setStyle("borderBottom", outerStyle);

      inner.setStyle("backgroundColor", this._resolveColor(backgroundColor || this.getBackgroundColor()) || null);
      inner.setAttribute("src", bgSource);

      overlay.setStyle("border", innerStyle);
      overlay.setStyle("opacity", this.getInnerOpacity());



      // Border Widths
      var outerBorder = 1;
      var innerBorder = 1;


      // Dimension
      element.setStyle("width", width + pixel);
      element.setStyle("height", height + pixel);

      frame.setStyle("width", (width-(outerBorder*2)) + pixel);
      frame.setStyle("height", (height-(outerBorder*2)) + pixel);

      horiz.setStyle("width", (width-(outerBorder*2)) + pixel);
      horiz.setStyle("height", (height-(outerBorder*2)) + pixel);
      horiz.setStyle("left", "0px");
      horiz.setStyle("top", outerBorder + pixel);

      vert.setStyle("width", (width-(outerBorder*2)) + pixel);
      vert.setStyle("height", (height-(outerBorder*2)) + pixel);
      vert.setStyle("left", outerBorder + pixel);
      vert.setStyle("top", "0px");

      inner.setStyle("width", (width-(outerBorder*2)) + pixel);
      inner.setStyle("height", (height-(outerBorder*2)) + pixel);

      overlay.setStyle("width", (width-(outerBorder*2)-(innerBorder*2)) + pixel);
      overlay.setStyle("height", (height-(outerBorder*2)-(innerBorder*2)) + pixel);

    },


    // interface implementation
    reset : function(element)
    {
      element.setStyles({
        "width" : null,
        "height" : null
      });
      element.removeAll();
    },


    // interface implementation
    getInsets : function()
    {
      return {
        top : this.getTopBorder() ? 2 : 0,
        right : this.getRightBorder() ? 2 : 0,
        bottom : this.getBottomBorder() ? 2 : 0,
        left : this.getLeftBorder() ? 2 : 0
      };
    }
  }
});
