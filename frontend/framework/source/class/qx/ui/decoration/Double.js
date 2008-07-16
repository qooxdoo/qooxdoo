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
 * Border implementation with two CSS borders. Both borders can be styled
 * independent of each other. This decorator is used to create 3D effects like
 * <code>inset</code>, <code>outset</code> or <code>ridge</code>.
 */
qx.Class.define("qx.ui.decoration.Double",
{
  extend : qx.ui.decoration.Single,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTY: INNER WIDTH
    ---------------------------------------------------------------------------
    */

    /** top width of border */
    innerWidthTop :
    {
      check : "Number",
      init : 0
    },

    /** right width of border */
    innerWidthRight :
    {
      check : "Number",
      init : 0
    },

    /** bottom width of border */
    innerWidthBottom :
    {
      check : "Number",
      init : 0
    },

    /** left width of border */
    innerWidthLeft :
    {
      check : "Number",
      init : 0
    },

    /** Property group to set the inner border width of all sides */
    innerWidth :
    {
      group : [ "innerWidthTop", "innerWidthRight", "innerWidthBottom", "innerWidthLeft" ],
      mode : "shorthand"
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY: INNER COLOR
    ---------------------------------------------------------------------------
    */

    /** top inner color of border */
    innerColorTop :
    {
      nullable : true,
      check : "Color"
    },

    /** right inner color of border */
    innerColorRight :
    {
      nullable : true,
      check : "Color"
    },

    /** bottom inner color of border */
    innerColorBottom :
    {
      nullable : true,
      check : "Color"
    },

    /** left inner color of border */
    innerColorLeft :
    {
      nullable : true,
      check : "Color"
    },

    /**
     * Property group for the inner color properties.
     */
    innerColor :
    {
      group : [ "innerColorTop", "innerColorRight", "innerColorBottom", "innerColorLeft" ],
      mode : "shorthand"
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _updateScaledImage : function(el, width, height)
    {
      var el = el.getChild(0);

      var bgImage = qx.util.ResourceManager.toUri(qx.util.AliasManager.getInstance().resolve(this.getBackgroundImage()));
      if (!bgImage || this.getBackgroundRepeat() !== "scale")
      {
        el.removeAll();
        return;
      }

      var img = el.getChild(0);
      if (!img)
      {
        img = new qx.html.Image();
        el.add(img);
      }

      img.setSource(bgImage);
      img.setStyle("height", "100%");
      img.setStyle("width", "100%");
    },



    /**
     * Get the CSS style map for the decoration
     *
     * @param width {Integer} The widget's width
     * @param height {Integer} The widget's height
     * @return {Map} a map containing the computed CSS styles
     */
    _getInnerStyles : function(width, height)
    {    	
      var styles = {
        borderTopWidth: this.getInnerWidthTop() + "px",
        borderTopColor: this._resolveColor(this.getInnerColorTop()),
        borderRightWidth: this.getInnerWidthRight() + "px",
        borderRightColor: this._resolveColor(this.getInnerColorRight()),
        borderBottomWidth: this.getInnerWidthBottom() + "px",
        borderBottomColor: this._resolveColor(this.getInnerColorBottom()),
        borderLeftWidth: this.getInnerWidthLeft() + "px",
        borderLeftColor: this._resolveColor(this.getInnerColorLeft()),
        backgroundColor: this._resolveColor(this.getBackgroundColor()),
        borderStyle: "solid"
      };

      return styles;
    },


    // interface implementation
    render : function(element, width, height, backgroundColor, changes)
    {
      var innerElement = element.getChild(0);

      if (!innerElement)
      {
        innerElement = new qx.html.Element();

        innerElement.setStyles({
          position: "absolute",
          top: 0,
          left: 0
        });

        element.add(innerElement);
      }

      if (changes.style || changes.bgcolor || changes.init)
      {
        innerElement.setStyles(this._getInnerStyles());
      }

      if (changes.size || changes.init)
      {
        var innerWidth = width - (this.getWidthLeft() + this.getWidthRight());
        var hInsets = this.getInnerWidthLeft() + this.getInnerWidthRight();

        var innerHeight = height - (this.getWidthTop() + this.getWidthBottom());
        var vInsets = this.getInnerWidthTop() + this.getInnerWidthBottom();

        qx.ui.decoration.Util.updateSize(innerElement, innerWidth, innerHeight, hInsets, vInsets);
      }

      this.base(arguments, element, width, height, backgroundColor, changes);
    },


    // interface implementation
    reset : function(element)
    {
      var innerElement = element.getChild(0);
      if (innerElement) {
        element.removeAt(0);
      }

      this.base(arguments, element);
    },


    // interface implementation
    getInsets : function()
    {
      return {
        top : this.getWidthTop() + this.getInnerWidthTop(),
        right : this.getWidthRight() + this.getInnerWidthRight(),
        bottom : this.getWidthBottom() + this.getInnerWidthBottom(),
        left : this.getWidthLeft() + this.getInnerWidthLeft()
      }
    }
  }
});