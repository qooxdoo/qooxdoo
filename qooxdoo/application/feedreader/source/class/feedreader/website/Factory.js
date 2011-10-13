qx.Bootstrap.define("feedreader.website.Factory", 
{
  statics :
  {
    __uid : 0,


    createArticleView : function (article) {
      var container = qx.bom.Element.create("div");
      qx.bom.element.Class.add(container, "article-container");

      var indicator = qx.bom.Element.create("div");
      indicator.innerHTML = "[+]";
      qx.bom.element.Class.add(indicator, "article-indicator");
      container.appendChild(indicator);

      var title = qx.bom.Element.create("label");
      title.innerHTML = article.getTitle();
      qx.bom.element.Class.add(title, "article-title");
      container.appendChild(title);

      var content = qx.bom.Element.create("div");
      qx.bom.element.Class.add(content, "article-content");
      content.innerHTML = feedreader.ArticleBuilder.createHtml(article, false);
      qx.bom.element.Style.set(content, "display", "none");
      container.appendChild(content);

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


    createTreeFolder : function(name) {
      var folder = qx.bom.Element.create("div");
      qx.bom.element.Class.add(folder, "feed-folder");
      folder.innerHTML = name;
      return folder;
    },


    createTreeItem : function(feed) {
      var container = qx.bom.Element.create("div");
      var id = "feed-" + this.__uid++;
      // create radio button
      var rb = qx.bom.Element.create("input");
      qx.bom.element.Attribute.set(rb, "type", "radio");
      qx.bom.element.Attribute.set(rb, "name", "feeds");
      qx.bom.element.Attribute.set(rb, "id", id);
      qx.bom.element.Style.set(rb, "display", "none");
      rb.feed = feed;

      container.appendChild(rb);
      // create label
      var label = qx.bom.Element.create("label");
      qx.bom.element.Attribute.set(label, "for", id);
      qx.bom.element.Attribute.set(label, "name", "feedslabel");
      qx.bom.element.Class.add(label, "feed-item");
      label.innerHTML = feed.getTitle();
      container.appendChild(label);

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