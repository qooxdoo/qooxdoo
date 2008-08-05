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
 * A very simple decorator featuring background colors and a simple uniform
 * border based on CSS styles.
 */
qx.Class.define("qx.ui.decoration.Uniform",
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
    /** Set the border width of all sides */
    width :
    {
      check : "PositiveInteger",
      init : 0,
      apply : "_applyWidth"
    },


    /** The border style of all sides */
    style :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyStyle"
    },


    /** Set the border color of all sides */
    color :
    {
      nullable : true,
      check : "Color",
      apply : "_applyStyle"
    },


    /** The URL of the background image */
    backgroundImage :
    {
      check : "String",
      nullable : true,
      apply : "_applyStyle"
    },


    /** How the background should be repeated */
    backgroundRepeat :
    {
      check : ["repeat", "repeat-x", "repeat-y", "no-repeat"],
      init : "repeat",
      apply : "_applyStyle"
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
    render : function(element, width, height, backgroundColor, changes)
    {
      if (changes.style || changes.init) {
        element.setStyles(this.__getStyles());
      }

      if (changes.bgcolor || changes.init)
      {
        var Color = qx.theme.manager.Color.getInstance();
        element.setStyle("backgroundColor", Color.resolve(backgroundColor));
      }

      if (changes.size || changes.init)
      {
        var axis = this.__insetAxis;
        qx.ui.decoration.Util.updateSize(element, width, height, axis, axis);
      }
    },


    // interface implementation
    reset : function(element) {
      element.setStyles(this.__emptyStyles);
    },


    // interface implementation
    getInsets : function()
    {
      if (this.__insets) {
        return this.__insets;
      }

      var width = this.getWidth();
      this.__insets =
      {
        top : width,
        right : width,
        bottom : width,
        left : width
      };

      return this.__insets;
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyWidth : function(value, old)
    {
      this.__insets = null;
      this.__styles = null;
    },


    // property apply
    _applyStyle : function(value, old) {
      this.__styles = null;
    },




    /*
    ---------------------------------------------------------------------------
      HELPERS
    ---------------------------------------------------------------------------
    */

    /** {Map} Default styles */
    __emptyStyles :
    {
      border: null,
      backgroundImage: null,
      backgroundRepeat: null,
      backgroundColor: null
    },


    /**
     * Compiles styles for background and border into one cached map
     */
    __getStyles : function()
    {
      if (this.__styles) {
        return this.__styles;
      }

      var Color = qx.theme.manager.Color.getInstance();
      var Alias = qx.util.AliasManager.getInstance();
      var Background = qx.bom.element.Background;

      var image = Alias.resolve(this.getBackgroundImage());
      var styles = Background.getStyles(image, this.getBackgroundRepeat());

      var color = Color.resolve(this.getColor());
      var width = this.getWidth();

      if (width > 0) {
        styles.border = this.getWidth() + "px " + this.getStyle() + " " + color;
      } else {
        styles.border = null;
      }

      return this.__styles = styles;
    }
  }
});
