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
  extend : qx.core.Object,
  implement : [qx.ui.decoration.IDecorator],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(outerColor, innerColor)
  {
    this.base(arguments);

    // Create template
    this._tmpl = new qx.util.Template;

    // Initialize properties
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
      apply : "_applyStyle"
    },

    innerOpacity :
    {
      check : "Number",
      init : 1,
      apply : "_applyStyle"
    },

    outerColor :
    {
      check : "Color",
      nullable : true,
      apply : "_applyStyle"
    },

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
    },


    /** Whether the top border should be visible */
    topBorder :
    {
      check : "Boolean",
      init : true,
      apply : "_applyBorder"
    },

    /** Whether the right border should be visible */
    rightBorder :
    {
      check : "Boolean",
      init : true,
      apply : "_applyBorder"
    },

    /** Whether the bottom border should be visible */
    bottomBorder :
    {
      check : "Boolean",
      init : true,
      apply : "_applyBorder"
    },

    /** Whether the left border should be visible */
    leftBorder :
    {
      check : "Boolean",
      init : true,
      apply : "_applyBorder"
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

    render : function(element, width, height, backgroundColor, changes)
    {
      // Be sure template is up-to-date first
      this._updateTemplate();

      // Fix box model
      if (qx.bom.client.Feature.CONTENT_BOX)
      {
        var insets = this.getInsets();
        var frameWidth = width - 2;
        var frameHeight = height - 2;
        var innerWidth = width - 4;
        var innerHeight = height - 4;
      }
      else
      {

      }

      // Resolve background color
      if (backgroundColor) {
        backgroundColor = qx.theme.manager.Color.getInstance().resolve(backgroundColor);
      }

      // Compile HTML
      var html = this._tmpl.run(
      {
        frameWidth : frameWidth,
        frameHeight : frameHeight,
        innerWidth : innerWidth,
        innerHeight : innerHeight,
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

      this._insets =
      {
        top : this.getTopBorder() ? 2 : 0,
        right : this.getRightBorder() ? 2 : 0,
        bottom : this.getBottomBorder() ? 2 : 0,
        left : this.getLeftBorder() ? 2 : 0
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

      var Color = qx.theme.manager.Color.getInstance();


      var outerStyle = "1px solid " + Color.resolve(this.getOuterColor()) + ";";
      var innerStyle = "1px solid " + Color.resolve(this.getInnerColor()) + ";";


      var html = [];

      // Background frame
      html.push('<div style="width:{frameWidth}px;height:{frameHeight}px;');
      html.push('border:', outerStyle);
      html.push(qx.bom.element.Opacity.compile(0.35));
      html.push('"></div>');

      // Horizontal frame
      html.push('<div style="width:{frameWidth}px;height:{frameHeight}px;');
      html.push('position:absolute;top:1px;left:0px;');
      html.push('border-left:', outerStyle);
      html.push('border-right:', outerStyle);
      html.push('"></div>');

      // Vertical frame
      html.push('<div style="width:{frameWidth}px;height:{frameHeight}px;');
      html.push('position:absolute;top:0px;left:1px;');
      html.push('border-top:', outerStyle);
      html.push('border-bottom:', outerStyle);
      html.push('"></div>');

      // Inner background frame
      var image = this.getBackgroundImage();
      var repeat = this.getBackgroundRepeat();
      var styles =
      {
        position:"absolute",
        top:"1px",
        left:"1px",
        width:"{frameWidth}px",
        height:"{frameHeight}px"
      };
      html.push(qx.ui.decoration.Util.generateBasicDecor(image, repeat, styles).join(""));


      // Inner overlay frame
      html.push('<div style="width:{innerWidth}px;height:{innerHeight}px;');
      html.push('position:absolute;top:1px;left:1px;');
      html.push('border:', innerStyle);
      html.push(qx.bom.element.Opacity.compile(this.getInnerOpacity()));
      html.push('"></div>');


      // Update template
      this._tmpl.setContent(html.join(""));

      // Cleanup flag
      this._invalidTemplate = false;
    }
  }
});
