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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This is a static factory for creating the DOM nodes needed for the webseite 
 * view of the feedreader.
 */
qx.Bootstrap.define("feedreader.view.website.Factory", 
{
  statics :
  {
    __uid : 0,

    /**
     * Creates an article element.
     * 
     * @param article {qx.core.Object} An article model.
     * @return {DomNode} The DOM node holding all the infos of the article.
     */
     createArticleView : function (article) {
       var data = {
         title : article.getTitle(),
         content : feedreader.ArticleBuilder.createHtml(article, false)
       };
       
       var container = qx.bom.Template.get("article", data);
       var indicator = container.children[0];
       var title = container.children[1];
       var content = container.children[2];

       // handler for the click on either the title or the indicator
       var onClick = function(e) {
         if (qx.bom.element.Style.get(content, "display") == "none") {
           qx.bom.element.Style.set(content, "display", "");
           indicator.innerHTML = "[-]";
         } else {
           qx.bom.element.Style.set(content, "display", "none");
           indicator.innerHTML = "[+]";
         }
       };
     
       qx.bom.Event.addNativeListener(title, "click", onClick);
       qx.bom.Event.addNativeListener(indicator, "click", onClick);
     
       return container;
     },


    /**
     * Create a DOM representing a tree folder.
     *
     * @param name {String} The name of the folder
     * @return {DomNode} The folder DOM node.
     */
    createTreeFolder : function(name) {
      return qx.bom.Template.get("tree-folder", {name: name});
    },


    /**
     * Creates a tree item for a feed.
     * 
     * @param feed {qx.core.Object} A feed model.
     * @return {DomNode} The DOM node representing the feed.
     */
     createTreeItem : function(feed) {
       var data = {
         id : "feed-" + this.__uid++,
         title : feed.getTitle()
        };

       var container = qx.bom.Template.get("tree-item", data);
       container.children[0].feed = feed;

       // listener for the change to sync back the css class
       qx.bom.Event.addNativeListener(container, "change", function(e) {
         var newItem = qx.bom.Event.getTarget(e);
         var newItemId = qx.bom.element.Attribute.get(newItem, "id");
         var labels = document.getElementsByName("feedslabel");
         for (var i=0; i < labels.length; i++) {
           var label = labels[i];
     
           if (qx.bom.element.Attribute.get(label, "for") == newItemId) {
             qx.bom.element.Class.add(label, "selectedFeed");
           } else {
             qx.bom.element.Class.remove(label, "selectedFeed");
           }
         };
       });

       return container;
     }
  }
});