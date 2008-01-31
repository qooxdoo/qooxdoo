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

qx.Class.define("feedreader.view.Article",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(article)
  {
    qx.ui.basic.Terminator.call(this);

    this.setHtmlProperty("className", "blogEntry");
    this.setDimension("100%", "100%");
    this.setBorder("line-top");
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    article :
    {
      apply    : "_applyArticle",
      nullable : true,
      check    : "Object"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _applyArticle : function(propValue, propOldValue, propData)
    {
      if (this._isCreated)
      {
        var element = this.getElement();
        element.innerHTML = this.getHtml();

        var links = element.getElementsByTagName("a");

        for (var i=0; i<links.length; i++) {
          links[i].target = "_blank";
        }
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {string | var} TODOC
     */
    getHtml : function()
    {
      var item = this.getArticle();

      if (!item) {
        return "";
      }

      var html = new qx.util.StringBuilder();

      html.add("<div id='_blogEntry'>");

      html.add("<h1 class='blog'>");
      html.add(item.title);
      html.add("</h1>");

      html.add("<div class='date'>");
      html.add(item.date);
      html.add("</div>");

      html.add("<div class='description'>");
      html.add(item.content);
      html.add("</div>");

      html.add("<a target='_blank' href='");
      html.add(item.link);
      html.add("'>");
      html.add(this.tr("read more ..."));
      html.add("</a>");

      html.add("</div>");

      return html;
    }
  }
});
