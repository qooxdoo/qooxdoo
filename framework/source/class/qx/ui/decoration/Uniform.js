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
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Create template
    this._tmpl = new qx.util.Template;
  },




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
      check : ["repeat", "repeat-x", "repeat-y", "no-repeat", "scale"],
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
      // Be sure template is up-to-date first
      this._updateTemplate();

      // Fix box model
      if (qx.bom.client.Feature.CONTENT_BOX)
      {
        var inset = this.getInsets().top * 2;
        width -= inset;
        height -= inset;
      }

      // Resolve background color
      if (backgroundColor) {
        backgroundColor = qx.theme.manager.Color.getInstance().resolve(backgroundColor);
      }

      // Compile HTML
      var html = this._tmpl.run(
      {
        width: width,
        height: height,
        bgcolor: backgroundColor
      });

      // Apply HTML
      element.setAttribute("html", html);
    },


    // interface implementation
    reset : function(element) {
      element.setAttribute("html", null);
    },


    // interface implementation
    getInsets : function()
    {
      if (this._insets) {
        return this._insets;
      }

      var width = this.getWidth();
      this._insets =
      {
        top : width,
        right : width,
        bottom : width,
        left : width
      };

      return this._insets;
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyWidth : function()
    {
      this._insets = null;
      this._invalidTemplate = true;
    },


    // property apply
    _applyStyle : function() {
      this._invalidTemplate = true;
    },




    /*
    ---------------------------------------------------------------------------
      HELPERS
    ---------------------------------------------------------------------------
    */

    _invalidTemplate : true,

    _updateTemplate : function()
    {
      if (!this._invalidTemplate) {
        return;
      }

      // Add border
      var styles = {};
      var width = this.getWidth();
      if (width > 0)
      {
        var Color = qx.theme.manager.Color.getInstance();
        styles.border = width + 'px ' + this.getStyle() + ' ' + Color.resolve(this.getColor());
      }

      styles.width = "{width}px";
      styles.height = "{height}px";
      styles.backgroundColor = "{bgcolor}px";

      // Generate tag
      var image = this.getBackgroundImage();
      var repeat = this.getBackgroundRepeat();
      var html = qx.ui.decoration.Util.generateBasicDecor(image, repeat, styles);

      // Update template
      this._tmpl.setContent(html.join(""));

      // Cleanup flag
      this._invalidTemplate = false;
    }
  }
});
