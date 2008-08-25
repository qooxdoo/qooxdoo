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
 * Beveled is a variant of a rounded decorator which is quite optimal
 * regarding performance and still delivers a good set of features:
 *
 * * One pixel rounded border
 * * Inner glow color with optional transparency
 * * Repeated or scaled background image
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

  /**
   * @param outerColor {Color} The outer border color
   * @param innerColor {Color} The inner border color
   * @param innerOpacity {Float} Opacity of inner border
   */
  construct : function(outerColor, innerColor, innerOpacity)
  {
    this.base(arguments);

    // Initialize properties
    if (outerColor != null) {
      this.setOuterColor(outerColor);
    }

    if (innerColor != null) {
      this.setInnerColor(innerColor);
    }

    if (innerOpacity != null) {
      this.setInnerOpacity(innerOpacity);
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
     * The color of the inner frame.
     */
    innerColor :
    {
      check : "Color",
      nullable : true,
      apply : "_applyStyle"
    },

    /**
     * The opacity of the inner frame. As this inner frame
     * is rendered above the background image this may be
     * intersting to configure as semi-transparent e.g. <code>0.4</code>.
     */
    innerOpacity :
    {
      check : "Number",
      init : 1,
      apply : "_applyStyle"
    },

    /**
     * Color of the outer frame. The corners are automatically
     * rendered with a slight opacity to fade into the background
     */
    outerColor :
    {
      check : "Color",
      nullable : true,
      apply : "_applyStyle"
    },


    /**
     * A background image to show. The background image is rendered
     * behind the inner frame.
     */
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


    /** Color of the background */
    backgroundColor :
    {
      check : "Color",
      nullable : true,
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

    __markup : null,

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyStyle : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this.__markup) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    },





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

      var Color = qx.theme.manager.Color.getInstance();
      var html = [];

      // Prepare border styles
      var outerStyle = "1px solid " + Color.resolve(this.getOuterColor()) + ";";
      var innerStyle = "1px solid " + Color.resolve(this.getInnerColor()) + ";";

      // Outer frame
      html.push('<div style="overflow:hidden;font-size:0;line-height:0;">');

      // Background frame
      html.push('<div style="');
      html.push('border:', outerStyle);
      html.push(qx.bom.element.Opacity.compile(0.35));
      html.push('"></div>');

      // Horizontal frame
      html.push('<div style="position:absolute;top:1px;left:0px;');
      html.push('border-left:', outerStyle);
      html.push('border-right:', outerStyle);
      html.push('"></div>');

      // Vertical frame
      html.push('<div style="');
      html.push('position:absolute;top:0px;left:1px;');
      html.push('border-top:', outerStyle);
      html.push('border-bottom:', outerStyle);
      html.push('"></div>');

      // Inner background frame
      var styles = "position:absolute;top:1px;left:1px;";
      html.push(qx.ui.decoration.Util.generateBackgroundMarkup(this.getBackgroundImage(), this.getBackgroundRepeat(), styles));

      // Inner overlay frame
      html.push('<div style="position:absolute;top:1px;left:1px;');
      html.push('border:', innerStyle);
      html.push(qx.bom.element.Opacity.compile(this.getInnerOpacity()));
      html.push('"></div>');

      // Outer frame
      html.push('</div>');

      // Store
      return this.__markup = html.join("");
    },


    // interface implementation
    resize : function(element, width, height)
    {
      // Fix to keep applied size above zero
      // Makes issues in IE7 when applying value like '-4px'
      if (width < 4) {
        width = 4;
      }

      if (height < 4) {
        height = 4;
      }

      // Fix box model
      if (qx.bom.client.Feature.CONTENT_BOX)
      {
        var outerWidth = width - 2;
        var outerHeight = height - 2;
        var frameWidth = outerWidth;
        var frameHeight = outerHeight;
        var innerWidth = width - 4;
        var innerHeight = height - 4;
      }
      else
      {
        var outerWidth = width;
        var outerHeight = height;
        var frameWidth = width - 2;
        var frameHeight = height - 2;
        var innerWidth = frameWidth;
        var innerHeight = frameHeight;
      }

      var dom = element.getDomElement();
      var pixel = "px";

      var backgroundFrame = dom.childNodes[0].style;
      backgroundFrame.width = outerWidth + pixel;
      backgroundFrame.height = outerHeight + pixel;

      var horizontalFrame = dom.childNodes[1].style;
      horizontalFrame.width = outerWidth + pixel;
      horizontalFrame.height = frameHeight + pixel;

      var verticalFrame = dom.childNodes[2].style;
      verticalFrame.width = frameWidth + pixel;
      verticalFrame.height = outerHeight + pixel;

      var innerBackground = dom.childNodes[3].style;
      innerBackground.width = frameWidth + pixel;
      innerBackground.height = frameHeight + pixel;

      var innerOverlay = dom.childNodes[4].style;
      innerOverlay.width = innerWidth + pixel;
      innerOverlay.height = innerHeight + pixel;
    },


    // interface implementation
    tint : function(element, bgcolor)
    {
      var dom = element.getDomElement();
      var Color = qx.theme.manager.Color.getInstance();

      if (bgcolor == null) {
        bgcolor = this.getBackgroundColor();
      }

      dom.childNodes[3].style.backgroundColor = Color.resolve(bgcolor) || "";
    },


    // interface implementation
    getInsets : function() {
      return this.__insets;
    },


    /** {Map} Static map with insets */
    __insets :
    {
      top : 2,
      right : 2,
      bottom : 2,
      left : 2
    }
  }
});
