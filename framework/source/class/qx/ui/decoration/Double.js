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
    // interface implementation
    getInsets : function()
    {
      if (this._insets) {
        return this._insets;
      }

      this._insets =
      {
        top : this.getWidthTop() + this.getInnerWidthTop(),
        right : this.getWidthRight() + this.getInnerWidthRight(),
        bottom : this.getWidthBottom() + this.getInnerWidthBottom(),
        left : this.getWidthLeft() + this.getInnerWidthLeft()
      };

      return this._insets;
    },


    _updateTemplate : function()
    {
      if (!this._invalidTemplate) {
        return;
      }

      var Color = qx.theme.manager.Color.getInstance();



      // Add inner borders
      var innerStyles = {};

      var width = this.getInnerWidthTop();
      if (width > 0) {
        innerStyles.borderTop = width + "px " + this.getStyleTop() + " " + Color.resolve(this.getInnerColorTop());
      }

      var width = this.getInnerWidthRight();
      if (width > 0) {
        innerStyles.borderRight = width + "px " + this.getStyleRight() + " " + Color.resolve(this.getInnerColorRight());
      }

      var width = this.getInnerWidthBottom();
      if (width > 0) {
        innerStyles.borderBottom = width + "px " + this.getStyleBottom() + " " + Color.resolve(this.getInnerColorBottom());
      }

      var width = this.getInnerWidthLeft();
      if (width > 0) {
        innerStyles.borderLeft = width + "px " + this.getStyleLeft() + " " + Color.resolve(this.getInnerColorLeft());
      }

      innerStyles.width = "{width}px";
      innerStyles.height = "{height}px";
      innerStyles.backgroundColor = "{bgcolor}px";

      // Generate inner tag
      var image = this.getBackgroundImage();
      var repeat = this.getBackgroundRepeat();
      var innerHtml = qx.ui.decoration.Util.generateBasicDecor(image, repeat, innerStyles);



      // Add outer border
      var outerStyles = {};
      var width = this.getWidthTop();
      if (width > 0) {
        outerStyles.borderTop = width + "px " + this.getStyleTop() + " " + Color.resolve(this.getColorTop());
      }

      var width = this.getWidthRight();
      if (width > 0) {
        outerStyles.borderRight = width + "px " + this.getStyleRight() + " " + Color.resolve(this.getColorRight());
      }

      var width = this.getWidthBottom();
      if (width > 0) {
        outerStyles.borderBottom = width + "px " + this.getStyleBottom() + " " + Color.resolve(this.getColorBottom());
      }

      var width = this.getWidthLeft();
      if (width > 0) {
        outerStyles.borderLeft = width + "px " + this.getStyleLeft() + " " + Color.resolve(this.getColorLeft());
      }




      // Combine inner and outer
      var html = '<div style="' + qx.bom.element.Style.compile(outerStyles) + '">' + innerHtml.join("") + '</div>';

      // Update template
      this._tmpl.setContent(html);

      // Cleanup flag
      this._invalidTemplate = false;
    }
  }
});
