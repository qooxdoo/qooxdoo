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
      // Be sure markup is up-to-date first
      this._updateMarkup();

      // Fix box model
      if (qx.bom.client.Feature.CONTENT_BOX)
      {
        var inset = this.getWidth() * 2;
        width -= inset;
        height -= inset;
      }

      // Compile HTML
      var html = this._tmpl.run({width: width, height: height});

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
    _applyWidth : function() {
      this.__insets = this.__markup = null;
    },


    // property apply
    _applyStyle : function() {
      this.__markup = null;
    },




    /*
    ---------------------------------------------------------------------------
      HELPERS
    ---------------------------------------------------------------------------
    */

    _updateMarkup : function()
    {
      if (this.__markup) {
        return;
      }

      var html = [];

      var image = this.getBackgroundImage();
      var repeat = this.getBackgroundRepeat();

      var tag = image && repeat == "scale" ? "img" : "div";

      // Starttag
      html.push('<', tag, ' ');


      // Support for images
      if (image)
      {
        var resolved = qx.util.AliasManager.getInstance().resolve(image);

        // Scaled images
        if (repeat == "scale")
        {
          var Resource = qx.util.ResourceManager;
          var uri = Resource.toUri(resolved);
          html.push('src="', uri, '" style="');
        }

        // Repeated images
        else
        {
          html.push('style="');

          var Background = qx.bom.element.Background;
          html.push(Background.compile(resolved, repeat, 0, 0));
        }
      }
      else
      {
        html.push('style="');
      }

      html.push('position:absolute;top:0;left:0;width:{width}px;height:{height}px;');

      var width = this.getWidth();
      if (width > 0)
      {
        var Color = qx.theme.manager.Color.getInstance();
        html.push('border:', this.getWidth(), 'px ', this.getStyle(), ' ', Color.resolve(this.getColor()), ';');
      }

      // Endtag
      html.push('"></', tag, '>');


      // Update template
      this._tmpl.setContent(html.join(""));
    }
  }
});
