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
       // calculate aniumation duration (depends on content height)
       var duration = content.offsetHeight * 2;
       duration = Math.max(1000, duration);
       duration = Math.min(200, duration);

       // handler for the click on either the title or the indicator
       var onClick = function(e) {
         if (qx.bom.element.Style.get(content, "display") == "none") {

           qx.bom.element.Style.set(content, "display", "");
           qx.bom.element.Transform.scale(content, [null, 0]);
           qx.bom.element.Animation.animate(content, {
             duration: duration,
             origin: "top center",
             keep: 100,
             keyFrames: {
               0: {
                 "padding-bottom": "0px",
                 "padding-top": "0px",
                 "scale": [null, 0],
                 "height": "0px"
                },
               100: {
                 "padding-bottom": "10px",
                 "padding-top": "10px",
                 "scale": [null, 1],
                 "height": content.offsetHeight-20 + "px"
                }
             }
           }).on("end", function() {
             qx.bom.element.Transform.scale(content, 1);
             indicator.innerHTML = "[-]";
           });

         } else {
           qx.bom.element.Animation.animate(content, {
             duration: duration,
             origin: "top center",
             keyFrames: {
               0: {
                 "padding-bottom": "10px",
                 "padding-top": "10px",
                 "scale": [null, 1],
                 "height": content.offsetHeight-20 + "px"
                },
               100: {
                 "padding-bottom": "0px",
                 "padding-top": "0px",
                 "scale": [null, 0],
                 "height": "0px"
                }
             }
           }).on("end", function(el) {
             qx.bom.element.Style.set(el, "display", "none");
             indicator.innerHTML = "[+]";
           });
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
       var data = {title : feed.getTitle()};

       var label = qx.bom.Template.get("tree-item", data);
       label.feed = feed;

       // listener for the change to sync back the css class
       qx.bom.Event.addNativeListener(label, "click", function(e) {
         var newItem = qx.bom.Event.getTarget(e);
         qx.bom.Collection.query("div[name='feedslabel']").removeClass("selectedFeed");
         qx.bom.element.Class.add(newItem, "selectedFeed");
       });

       return label;
     }
  }
});