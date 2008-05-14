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
     * Andreas Ecker (ecker)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("qx.ui.embed.HtmlEmbed",
{
  extend : qx.ui.core.Widget,
  include : qx.ui.core.MNativeOverflow,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function(html)
  {
    this.base(arguments);

    if (html != null) {
      this.setHtml(html);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Any text string which can contain HTML, too */
    html :
    {
      check : "String",
      init : "",
      apply : "_applyHtml",
      event : "changeHtml"
    },

    /**
     * The css classname for the html embed.
     * <b>IMPORTANT</b> Paddings and borders does not work
     * in the css class. These ttyles coause conflicts with
     * the layout engine.
     */
    cssClass :
    {
      check : "String",
      init : "",
      apply : "_applyCssClass"
    },


    /** Block inheritance as default for font property */
    font :
    {
      refine : true,
      init : null
    },


    /** Block inheritance as default for textColor property */
    textColor :
    {
      refine : true,
      init : null
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
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    _applyHtml : function(value, old)
    {
      this.getContentElement().setAttribute("html", value);
      this.getContentElement().setStyle("padding", "0px");
      this.getContentElement().setStyle("border", "none");
    },


    _applyCssClass : function (value, old) {
      this.getContentElement().setAttribute("class", value);
    },

    /*
    ---------------------------------------------------------------------------
      FONT SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _applyFont : function(value, old) {
      qx.theme.manager.Font.getInstance().connect(this.__styleFont, this, value);
    },

    /**
     * Utility method to render the given font.
     *
     * @type member
     * @param font {qx.bom.Font} new font value to render
     * @return {void}
     */
    __styleFont : function(font)
    {
      // Apply
      var styles = font ? font.getStyles() : qx.bom.Font.getDefaultStyles();
      this._contentElement.setStyles(styles);
    },




    /*
    ---------------------------------------------------------------------------
      TEXT COLOR SUPPORT
    ---------------------------------------------------------------------------
    */

    _applyTextColor : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleTextColor, this, value);
    },

    /**
     * @type member
     * @param value {var} any acceptable CSS color property
     */
    _styleTextColor : function(value) {
      if (value) {
        this.getContentElement().setStyle("color", value);
      } else {
        this.getContentElement().removeStyle("color");
      }
    }
  }
});
