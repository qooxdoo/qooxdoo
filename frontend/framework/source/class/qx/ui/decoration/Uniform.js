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
  implement : qx.ui.decoration.IDecorator,
  include : qx.ui.core.MThemeTransform,




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
      check : "Number",
      init : 0,
      apply : "_applyBorderChange"
    },

    /** The border style of all sides */
    style :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyBorderChange"
    },

    /** Set the border color of all sides */
    color :
    {
      nullable : true,
      check : "String",
      apply : "_applyBorderChange",
      transform : "_resolveThemedColor"
    },

    /** The background color */
    backgroundColor :
    {
      nullable : true,
      check : "String",
      apply : "_applyBorderChange",
      transform : "_resolveThemedColor"
    },

    /** The URL of the background image */
    backgroundImage :
    {
      check : "String",
      nullable : true,
      apply : "_applyBorderChange"
    },

    /** How the background should be repeated */
    backgroundRepeat :
    {
      check : ["repeat", "repeat-x", "repeat-y", "no-repeat"],
      init : "repeat",
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
    // interface implementation
    render : function(element, width, height, backgroundColor, changes)
    {
      if (changes.style || changes.init)
      {
        element.setStyle("border", this.getWidth() + "px " + this.getStyle() + " " + (this.getColor() || ""));

        var imageId = qx.util.AliasManager.getInstance().resolve(this.getBackgroundImage());
        var bgStyles = qx.bom.element.Background.getStyles(imageId, this.getBackgroundRepeat());
        element.setStyles(bgStyles);
      }

      if (changes.bgcolor || changes.init) {
        element.setStyle("backgroundColor", backgroundColor || this.getBackgroundColor() || null);
      }

      if (changes.size || changes.init)
      {
        var inset = 2 * this.getWidth();
        qx.ui.decoration.Util.updateSize(
          element,
          width, height,
          inset, inset
        );
      }
    },


    _emptyStyles :
    {
      border: null,
      backgroundImage: null,
      backgroundRepeat: null,
      backgroundColor: null
    },


    // interface implementation
    reset : function(element) {
      element.setStyles(this._emptyStyles);
    },


    // interface implementation
    getInsets : function()
    {
      var width = this.getWidth();
      return {
        top : width,
        right : width,
        bottom : width,
        left : width
      }
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyBorderChange : function() {
      qx.ui.core.queue.Decorator.add(this);
    }
  }
});
