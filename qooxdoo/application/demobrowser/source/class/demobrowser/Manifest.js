/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/* ************************************************************************

************************************************************************ */

/**
 * Displays the "info" section of a qooxdoo application's Manifest.json file.
 */
qx.Class.define("demobrowser.Manifest", {

  extend : qx.ui.container.Composite,
  
  construct : function(manifestData)
  {
    this.base(arguments);
    this.setLayout(new qx.ui.layout.VBox(10));
    this.setPadding(10);
    if (manifestData) {
      this.setManifestData(manifestData);
    }
  },
  
  properties : {
    manifestData :
    {
      apply : "_applyManifestData"
    }
  },
  
  members : {
    
    _applyManifestData : function(value, old) 
    {
      if (value === old) {
        return;
      }
      
      if (typeof value == "object") {
        this.setManifestData(value);
      } else if (typeof value == "string") {
        this._loadManifest(value);
      }
      
      var kids = this.getChildren();
      while (kids.length > 0) {
        kids[0].destroy();
      }
      
      if (!value.info) {
        this.add(new qx.ui.basic.Label("Manifest data contains no 'info' section!"));
        return;
      }
      
      if (value.info.name) {
        var nameLabel = new qx.ui.basic.Label("<h1>" + value.info.name + "</h1>");
      } else {
        var nameLabel = new qx.ui.basic.Label("<h1>Nameless Library</h1>");      
      }
      nameLabel.setRich(true);
      this.add(nameLabel);
      
      this.add(this._getGroupBox("Info", value.info));
      if (value.info.authors && qx.lang.Type.isArray(value.info.authors)) {
        this.add(this._getAuthorsBox(value.info.authors));
      }
    },
    
    _getGroupBox : function(title, info)
    {
      var container = new qx.ui.groupbox.GroupBox(title);
      container.setLayout(new qx.ui.layout.Grid(10, 10));
      var rowCount = 0;
      for (var key in info) {
        var value = info[key];
        if (key == "name" || key == "authors") {
          continue;          
        } else {
          if (qx.lang.Type.isArray(value)) {
            value = value.join(", ");
          }
          var keyValue = this._getKeyVal(key, value);
          container.add(keyValue[0], {row: rowCount, column: 0});
          container.add(keyValue[1], {row: rowCount, column: 1});
          rowCount++;
        }
      }
      
      return container;
    },
    
    _getAuthorsBox : function(authors)
    {
      var title = authors.length > 1 ? "Authors" : "Author";
      var container = new qx.ui.groupbox.GroupBox(title);
      container.setLayout(new qx.ui.layout.Grid(10, 10));
      var rowCount = 0;
      for (var i=0,l=authors.length; i<l; i++) {
        var author = authors[i];
        if (author.name && author.email) {
          var keyValue = this._getKeyVal(author.name, author.email);
          container.add(keyValue[0], {row: rowCount, column: 0});
          container.add(keyValue[1], {row: rowCount, column: 1});
          rowCount++;
        }
      }
      
      return container;
    },
    
    _getKeyVal : function(key, value)
    {
      var label = new qx.ui.basic.Label(key.replace(/^.{1}/, key[0].toUpperCase()));
      label.set({
        font: "bold",
        minWidth: 100
      });
      
      var content = new qx.ui.basic.Label();
      if (value.indexOf("http") == 0) {
        value = '<a href="' + value + '" target="_blank">' + value + "</a>";
        content.setRich(true);
      }
      content.setValue(value);
      
      return [label, content];
    },
    
    _loadManifest : function(url)
    {
      var req = new qx.io.remote.Request(url, "GET", "application/json");
      req.addListener("completed", function(e) {
        this.setManifestData(e.getContent());
      }, this);
      req.send();
    }
    
  }
  
});