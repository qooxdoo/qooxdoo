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
     * Tristan Koch (trkoch)

************************************************************************ */

/* ************************************************************************

#ignore(GITHUB)
#ignore(github.rest)
#ignore(github.view)

************************************************************************ */

/**
 * @tag noPlayground
 * @lint ignoreUndefined(github)
 */
qx.Class.define("demobrowser.demo.data.Github", {
  extend: qx.application.Standalone,

  members: {

    __gistsRes: null,
    __gistRes: null,
    __gistsStore: null,
    __gistStore: null,
    __list: null,
    __gist: null,

    /**
     * @lint ignoreUndefined(GITHUB)
     */
    main: function() {

      if (typeof GITHUB == "undefined") {
        return;
      }

      this.base(arguments);

      this._setUpResources();
      this._setUpStores();
      this._createGui();
      this._setUpBinding();

      this.__gistsRes.get();

      // Select first item in list
      this.__list.addListener("changeModel", function(evt) {
        var model = evt.getData();
        this.__list.getSelection().push(model.getItem(0));
      }, this);

      // On selection of item populate gist view
      this.__list.getSelection().addListener("change", function(evt) {
        var id = this.__list.getSelection().getItem(0).getId();
        this.__gistRes.get({id: id});
      }, this);
    },

    _setUpResources: function() {
      // Index of gists
      this.__gistsRes = new github.rest.Resource({
        "get": { method: "GET", url: "/gists"}
      });

      // Single gist
      this.__gistRes = new github.rest.Resource({
        "get": { method: "GET", url: "/gists/{id}"}
      });
    },

    _setUpStores: function() {
      // Attach particular resource action to stores
      this.__gistsStore = new qx.data.store.Rest(this.__gistsRes, "get");
      this.__gistStore = new qx.data.store.Rest(this.__gistRes, "get");
    },

    _createGui: function() {
      var dockContainer = new qx.ui.container.Composite(new qx.ui.layout.Dock());
      dockContainer.setPadding(10);

      var label = new qx.ui.basic.Label("Gists");
      label.setFont("bold");
      label.setPaddingBottom(10);
      dockContainer.add(label, {edge: "north"});

      this.__list = new qx.ui.list.List();
      this.__list.setWidth(200);
      this.__gist = new github.view.Gist();

      dockContainer.add(this.__list, {edge: "west"});
      dockContainer.add(this.__gist, {edge: "center"});

      this.getRoot().add(dockContainer, {edge: 0});
    },

    _setUpBinding: function() {
      var list = this.__list,
          gistsStore = this.__gistsStore,
          gistStore = this.__gistStore;

      // List
      list.setLabelPath("description");
      list.setLabelOptions({
        converter: function(label, model, source, target) {
          if (label === null || !label.length) {
            return model.getId();
          }
          return label;
        }
      });

      gistsStore.bind("model", list, "model");

      // Gist
      var gist = this.__gist;

      gistStore.bind("model.description", gist.getDescription(), "value");
      gistStore.bind("model.user.login", gist.getUsername(), "value");
      gistStore.bind("model.user.avatar_url", gist.getGravatar(), "source");
      gistStore.bind("model.files", gist.getContent(), "html", {
        converter: function(model) {
          var files = qx.Class.getProperties(model.constructor);
          var content = model.get(files[0]).getContent();
          content = qx.bom.String.escape(content);
          return "<pre>" + content + "</pre>";
        }
      });
    }
  }
});

/**
 * A GitHub REST API resource
 *
 * @lint ignoreUndefined(github)
 */
qx.Class.define("github.rest.Resource", {
  extend: qx.io.rest.Resource,

  /**
   * @lint ignoreUndefined(GITHUB)
   */
  construct: function(description) {
    this.base(arguments, description);

    this.configureRequest(function(req) {
      req.setRequestHeader("Accept", "application/json");
      req.setRequestHeader("Authorization", "token " + GITHUB.access_token);
    });
    this.setBaseUrl("https://api.github.com");
  }
});

/**
 * Gist view
 *
 * @lint ignoreUndefined(github)
 */
qx.Class.define("github.view.Gist", {
  extend: qx.ui.container.Composite,

  construct: function() {
    this.base(arguments);

    var gridLayout = new qx.ui.layout.Grid(5, 5);
    gridLayout.setColumnFlex(0, 1);
    gridLayout.setRowFlex(2, 1);

    this.setLayout(gridLayout);
    this.setPadding(0, 10);

    var label;

    // Description
    var descriptionContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(5));
    label = new qx.ui.basic.Label("Description");
    label.setFont("bold");
    this.__description = new qx.ui.basic.Label();
    descriptionContainer.add(label);
    descriptionContainer.add(this.__description);
    this.add(descriptionContainer, {row: 0, column: 0});

    // User
    var userContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(5));
    this.__gravatar = new qx.ui.basic.Image();
    this.__gravatar.set({
      width: 40,
      height: 40,
      scale: true,
      backgroundColor: "#fff"
    });
    this.__username = new qx.ui.basic.Label();
    userContainer.add(this.__gravatar);
    userContainer.add(this.__username);
    this.add(userContainer, {row: 0, column: 1});

    // Content
    label = new qx.ui.basic.Label("Content");
    label.setFont("bold");
    var scroll = new qx.ui.container.Scroll();
    this.__content = new qx.ui.embed.Html();
    this.__content.setMinHeight(1000);      // TODO: Determine height/width to fit
    scroll.add(this.__content);
    this.add(label, {row: 1, column: 0});
    this.add(scroll, {row: 2, column: 0, colSpan: 2});
  },

  members: {
    getDescription: function() {
      return this.__description;
    },

    getGravatar: function() {
      return this.__gravatar;
    },

    getUsername: function() {
      return this.__username;
    },

    getContent: function() {
      return this.__content;
    }
  }
});