/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
qx.Class.define("showcase.page.DescriptionBuilder",
{
  statics :
  {
    _demoPrefix : "http://demo.qooxdoo.org/" +
      qx.core.Environment.get("qx.version") + "/demobrowser/",
    _apiPrefix : "http://demo.qooxdoo.org/" +
      qx.core.Environment.get("qx.version") +"/apiviewer/",
    _manualPrefix : "http://manual.qooxdoo.org/" +
      qx.core.Environment.get("qx.version") + "/",


    build : function(header, text, tryThis, features, manual, demos, api)
    {
      var description = [];
      description.push(
        "<div id='description'>",
        "<h1>", header, "</h1>",
        "<p>", text, "</p>"
      );

      if (tryThis) {
        description.push("<h2>Try This</h2>", this.__makeList(tryThis));
      }

      if (features) {
        description.push("<h2>Features</h2>", this.__makeList(features));
      }

      if (manual)
      {
        description.push(
          "<h2>Documentation</h2>",
          this.__makeLinkList(this._manualPrefix, manual)
        )
      }

      if (demos)
      {
        description.push(
          "<h2>Demos</h2>",
          this.__makeLinkList(this._demoPrefix, demos)
        )
      }

      if (api)
      {
        description.push(
          "<h2>Api</h2>",
          this.__makeLinkList(this._apiPrefix, api)
        )
      }

      description.push("</div>");
      return description.join("");
    },


    __makeLinkList : function(prefix, links)
    {
      var linkList = ["<ul>"];
      for (var key in links) {
        linkList.push(
          "<li><a href='", prefix, key, "' target='_blank'>",
          links[key],
          "</a></li>"
        );
      };
      linkList.push("</ul>");
      return linkList.join("");
    },


    __makeList : function(items)
    {
      var list = ["<ul>"];
      for (var key in items) {
        list.push(
          "<li><strong>", key, "</strong>: ", items[key], "</li>"
        );
      };
      list.push("</ul>");
      return list.join("");
    }
  }
});
