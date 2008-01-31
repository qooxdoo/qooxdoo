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
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

qx.Class.define("feedreader.view.Header",
{
  extend : qx.ui.embed.HtmlEmbed,

  construct : function()
  {
    this.base(arguments, "<h1><span>qooxdoo</span> reader</h1>");

    this.setHtmlProperty("className", "header");
    this.setHeight(50);
  }
});
