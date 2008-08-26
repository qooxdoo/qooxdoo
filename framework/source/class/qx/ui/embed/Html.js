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

/**
 * The Html widget embeds plain HTML code into the application
 *
 * *Example*
 *
 * Here is a little example of how to use the canvas widget.
 *
 * <pre class='javascript'>
 * var html = new qx.ui.embed.Html();
 * html.setHtml("<h1>Hello World</h1>");
 * </pre>
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/widget/html' target='_blank'>
 * Documentation of this widget in the qooxdoo wiki.</a>
 */
qx.Class.define("qx.ui.embed.Html",
{
  extend : qx.ui.core.Widget,
  include : [qx.ui.core.MNativeOverflow],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param html {String} Initial HTML content
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
      apply : "_applyHtml",
      event : "changeHtml",
      nullable : true
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


    // overridden
    selectable :
    {
      refine : true,
      init : true
    },


    // overridden
    focusable :
    {
      refine : true,
      init : true
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
      WIDGET API
    ---------------------------------------------------------------------------
    */

    getFocusElement : function() {
      return this.getContentElement();
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyHtml : function(value, old)
    {
      var elem = this.getContentElement();

      // Insert HTML content
      elem.setAttribute("html", value||"");

      // Local style override problematic sections applied through
      // a optional classname
      elem.setStyle("padding", "0px");
      elem.setStyle("border", "none");
    },


    // property apply
    _applyCssClass : function (value, old) {
      this.getContentElement().setAttribute("class", value);
    },




    /*
    ---------------------------------------------------------------------------
      FONT SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _applyFont : function(value, old)
    {
      var styles = value ? qx.theme.manager.Font.getInstance().resolve(value).getStyles() : qx.bom.Font.getDefaultStyles();
      this.getContentElement().setStyles(styles);
    },




    /*
    ---------------------------------------------------------------------------
      TEXT COLOR SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _applyTextColor : function(value, old)
    {
      if (value) {
        this.getContentElement().setStyle("color", qx.theme.manager.Color.getInstance().resolve(value));
      } else {
        this.getContentElement().removeStyle("color");
      }
    }
  }
});
