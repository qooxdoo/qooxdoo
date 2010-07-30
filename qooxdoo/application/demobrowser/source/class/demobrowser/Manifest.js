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

#asset(qx/icon/Tango/22/actions/media-playback-start.png)

************************************************************************ */

/**
 * Displays the "info" section of a qooxdoo application's Manifest.json file.
 */
qx.Class.define("demobrowser.Manifest", {

  extend : qx.ui.container.Scroll,

  construct : function(manifestData)
  {
    this.base(arguments);
    this.__container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    this.__container.set({
      padding: 10,
      decorator: "main"
    });
    this.add(this.__container);
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

    __container : null,
    __runButton : null,

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

      // If there is a run button, it will be recycled
      try {
        this.__container.remove(this.__runButton);
      } catch(ex) {}
      // everything else is replaced
      var kids = this.__container.getChildren();
      while (kids.length > 0) {
        kids[0].destroy();
      }

      if (!value.info) {
        this.__container.add(new qx.ui.basic.Label("Manifest data contains no 'info' section!"));
        return;
      }

      if (value.info.name) {
        var nameLabel = new qx.ui.basic.Label("<h1>" + value.info.name + "</h1>");
      } else {
        var nameLabel = new qx.ui.basic.Label("<h1>Nameless Library</h1>");
      }
      nameLabel.setRich(true);
      this.__container.add(nameLabel);

      this.__container.add(this._getGroupBox("Info", this._getSortedInfo(value.info)));

      if (value.isPlayable) {
        this.__container.add(this._getRunButton());
      }
    },

    _getGroupBox : function(title, infoList)
    {
      var container = new qx.ui.groupbox.GroupBox(title);
      container.setLayout(new qx.ui.layout.Grid(10, 10));
      var rowCount = 0;

      for (var c=0,e=infoList.length; c<e; c++) {
        if (!infoList[c]) {
          continue;
        }

        for (var key in infoList[c]) {
          var value = infoList[c][key];
          if (key == "name") {
            continue;
          } else if (key == "authors")  {
            var authors = "";
            for (var i=0,l=value.length; i<l; i++) {
              authors += value[i].name + " &lt;" + value[i].email + "&gt;<br/>";
            }
            var title = value.length > 1 ? "Authors" : "Author";
            var keyValue = this._getKeyVal(title, authors);
            container.add(keyValue[0], {row: rowCount, column: 0});
            container.add(keyValue[1], {row: rowCount, column: 1});
            rowCount++;

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

      }

      return container;
    },

    _getRunButton : function()
    {
      if (this.__runButton) {
        return this.__runButton;
      }
      var runButton = new qx.ui.form.Button("Run Demo", "icon/22/actions/media-playback-start.png");
      runButton.setAllowGrowX(false);
      runButton.addListener("execute", function(ev) {
        qx.core.Init.getApplication().viewer.runSample();
      }, this);
      this.__runButton = runButton;

      return runButton;
    },

    _getKeyVal : function(key, value)
    {
      if (!key.indexOf("qooxdoo") == 0) {
        key = key.replace(/^.{1}/, key[0].toUpperCase());
      }
      var label = new qx.ui.basic.Label(key);
      label.set({
        font: "bold",
        minWidth: 100
      });

      var content = new qx.ui.basic.Label();
      if (value.indexOf("http") == 0) {
        value = '<a href="' + value + '" target="_blank">' + value + "</a>";
      }
      content.setValue(value);
      content.setRich(true);

      return [label, content];
    },

    _getSortedInfo : function(info)
    {
      var sortOrder = {
        "summary" : 0,
        "description" : 1,
        "homepage" : 2,
        "license" : 3,
        "authors" : 4,
        "version" : 5,
        "qooxdoo-versions" : 6
      };

      var sortedInfo = [];
      var unsortedInfo = [];

      for (var key in info) {
        if (key in sortOrder) {
          var map = {};
          map[key] = info[key];
          sortedInfo[sortOrder[key]] = map;
        } else {
          var map = {};
          map[key] = info[key];
          unsortedInfo.push(map);
        }
      }

      var infoList = sortedInfo.concat(unsortedInfo);
      return infoList;
    },

    _loadManifest : function(url)
    {
      var req = new qx.io.remote.Request(url, "GET", "application/json");
      req.addListener("completed", function(e) {
        this.setManifestData(e.getContent());
      }, this);
      req.send();
    }

  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("__container", "__runButton");
  }

});