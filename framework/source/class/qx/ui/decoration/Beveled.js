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
      html.push('<div>');

      // Background frame
      html.push('<div style="width:{outerWidth}px;height:{outerHeight}px;');
      html.push('border:', outerStyle);
      html.push(qx.bom.element.Opacity.compile(0.35));
      html.push('"></div>');

      // Horizontal frame
      html.push('<div style="width:{outerWidth}px;height:{frameHeight}px;');
      html.push('position:absolute;top:1px;left:0px;');
      html.push('border-left:', outerStyle);
      html.push('border-right:', outerStyle);
      html.push('"></div>');

      // Vertical frame
      html.push('<div style="width:{frameWidth}px;height:{outerHeight}px;');
      html.push('position:absolute;top:0px;left:1px;');
      html.push('border-top:', outerStyle);
      html.push('border-bottom:', outerStyle);
      html.push('"></div>');

      // Inner background frame
      var styles = "position:absolute;top:1px;left:1px;background-color:{bgcolor};width:{frameWidth}px;height:{frameHeight}px";
      html.push(qx.ui.decoration.Util.generateBasicDecor(this.getBackgroundImage(), this.getBackgroundRepeat(), styles));

      // Inner overlay frame
      html.push('<div style="width:{innerWidth}px;height:{innerHeight}px;');
      html.push('position:absolute;top:1px;left:1px;');
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

      var backgroundFrame = dom.childNodes[0].style;
      backgroundFrame.width = outerWidth + "px";
      backgroundFrame.height = outerHeight + "px";

      var horizontalFrame = dom.childNodes[1].style;
      horizontalFrame.width = outerWidth + "px";
      horizontalFrame.height = frameHeight + "px";

      var verticalFrame = dom.childNodes[2].style;
      verticalFrame.width = frameWidth + "px";
      verticalFrame.height = outerHeight + "px";

      var innerBackground = dom.childNodes[3].style;
      innerBackground.width = frameWidth + "px";
      innerBackground.height = frameHeight + "px";

      var innerOverlay = dom.childNodes[4].style;
      innerOverlay.width = innerWidth + "px";
      innerOverlay.height = innerHeight + "px";
    },


    // interface implementation
    tint : function(element, bgcolor)
    {
      var dom = element.getDomElement();
      var innerBackground = dom.childNodes[3].style;
      innerBackground.backgroundColor = bgcolor;
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
