/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */


/**
 * The Html widget embeds plain HTML code into the application
 *
 * *Example*
 *
 * Here is a little example of how to use the html widget.
 *
 * <pre class='javascript'>
 * var html = new qx.ui.mobile.embed.Html();
 * html.setHtml("<h1>Hello World</h1>");
 * </pre>
 *
 */
qx.Class.define("qx.ui.mobile.embed.Html",
{
  extend : qx.ui.mobile.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param html {String?null} Initial HTML content
   */
  construct : function(html)
  {
    this.base(arguments);
    if (html) {
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
      init : null,
      nullable : true,
      event : "changeHtml",
      apply : "_applyHtml"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // property apply
    _applyHtml : function(value, old)
    {
      this._setHtml(value);
    }
  }
});
