/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

qx.Class.define("qx.test.mobile.embed.Html",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testHtml : function() {
      var html = new qx.ui.mobile.embed.Html("<strong>affe</strong>");
      this.getRoot().add(html);

      this.assertString(html.getHtml());
      this.assertEquals(html.getHtml(), "<strong>affe</strong>");
      this.assertEquals(html.getHtml(), html.getContentElement().innerHTML);

      this.assertEventFired(html, "changeHtml", function() {
        html.setHtml("");
      });

      this.assertEquals(html.getHtml(), "");
      this.assertEquals(html.getHtml(), html.getContentElement().innerHTML);

      html.destroy();
    }
  }

});
