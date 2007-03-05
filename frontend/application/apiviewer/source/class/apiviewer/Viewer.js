/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(apiviewer)
#resource(css:css)
#resource(image:image)

************************************************************************ */

/**
 * The API viewer. Shows the API documentation.
 */
qx.Class.define("apiviewer.Viewer",
{
  extend : qx.ui.layout.DockLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    qx.ui.layout.DockLayout.call(this);

    this.setEdge(0);

    this._titlePrefix = qx.core.Setting.get("apiviewer.title") + " API Documentation";
    document.title = this._titlePrefix;

    // create header
    var header = new qx.ui.embed.HtmlEmbed("<h1>" + "<span>" + qx.core.Setting.get("apiviewer.title") + "</span>" + " API Documentation" + "</h1>" + "<div id='qxversion'>qooxdoo " + qx.core.Version.toString() + "</div>");
    header.setHtmlProperty("id", "header");
    header.setStyleProperty("background", "#134275 url(" + qx.manager.object.AliasManager.getInstance().resolvePath("api/image/colorstrip.gif") + ") top left repeat-x");
    header.setHeight(70);
    this.addTop(header);

    // create button view
    this._buttonView = new qx.ui.pageview.buttonview.ButtonView();
    this._buttonView.set({
      width           : "100%",
      height          : "100%"
    });
    var treeButton = new qx.ui.pageview.buttonview.Button("Packages", apiviewer.TreeUtil.ICON_PACKAGE);
    treeButton.setShow("icon");
    treeButton.setToolTip( new qx.ui.popup.ToolTip("Packages"));
    var infoButton = new qx.ui.pageview.buttonview.Button("Legend", apiviewer.TreeUtil.ICON_INFO);
    infoButton.setShow("icon");
    infoButton.setToolTip( new qx.ui.popup.ToolTip("Information"));

    treeButton.setChecked(true);
    this._buttonView.getBar().add(treeButton, infoButton);
    
    var treePane = new qx.ui.pageview.buttonview.Page(treeButton);
    var infoPane = new qx.ui.pageview.buttonview.Page(infoButton);
    this._buttonView.getPane().add(treePane, infoPane);
    
    // create tree
    this._tree = new qx.ui.tree.Tree("API Documentation");
    this._tree.set({
      backgroundColor : "white",
      overflow        : "scroll",
      width           : "100%",
      height          : "100%",
      paddingLeft     : 5,
      paddingTop      : 3
    });
    this._tree.getManager().addEventListener("changeSelection", this._onTreeSelectionChange, this);

    // fill button view panes
    treePane.add(this._tree);
    infoPane.add(new apiviewer.InfoView());


    this._detailFrame = new qx.ui.layout.CanvasLayout;
    this._detailFrame.set(
    {
      width           : "100%",
      height          : "100%",
      backgroundColor : "white",
      border          : qx.renderer.border.BorderPresets.getInstance().inset
    });

    this._detailFrame.setHtmlProperty("id", "DetailFrame");

    // create vertival splitter
    var mainSplitPane = new qx.ui.splitpane.HorizontalSplitPane(250, "1*");
    mainSplitPane.setLiveResize(true);
    mainSplitPane.addLeft(this._buttonView);
    mainSplitPane.addRight(this._detailFrame);
    this.add(mainSplitPane);

    this._detailLoader = new qx.ui.embed.HtmlEmbed('<h1><div class="please">please wait</div>Loading data...</h1>');
    this._detailLoader.setHtmlProperty("id", "DetailLoader");
    this._detailLoader.setMarginLeft(20);
    this._detailLoader.setMarginTop(20);
    this._detailFrame.add(this._detailLoader);

    this._classViewer = new apiviewer.ClassViewer;
    this._detailFrame.add(this._classViewer);

    this._packageViewer = new apiviewer.PackageViewer;
    this._detailFrame.add(this._packageViewer);

    this._currentTreeType = apiviewer.Viewer.PACKAGE_TREE;

    // Workaround: Since navigating in qx.ui.tree.Tree doesn't work, we've to
    //             maintain a hash that keeps the tree nodes for class names
    this._classTreeNodeHash = {};
    this._classTreeNodeHash[apiviewer.Viewer.PACKAGE_TREE] = {};
    this._classTreeNodeHash[apiviewer.Viewer.INHERITENCE_TREE] = {};

    apiviewer.Viewer.instance = this;

    qx.client.History.getInstance().init();
    qx.client.History.getInstance().addEventListener("request", this._onHistoryRequest, this);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    PACKAGE_TREE     : 1,
    INHERITENCE_TREE : 2
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    /** The documentation tree to show. */
    docTree :
    {
      _legacy : true,
      type    : "object"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // property checker
    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyDocTree : function(propValue, propOldValue, propData)
    {
      this._updateTree(propValue);
      return true;
    },


    /**
     * Loads the API doc tree from a URL. The URL must point to a JSON encoded
     * doc tree.
     *
     * @type member
     * @param url {String} the URL.
     * @return {void}
     */
    load : function(url)
    {
      var req = new qx.io.remote.Request(url);

      req.setTimeout(180000);

      req.addEventListener("completed", function(evt)
      {
        var content = evt.getData().getContent();
        this.setDocTree(eval("(" + content + ")"));

        qx.ui.core.Widget.flushGlobalQueues();

        // Handle bookmarks
        if (window.location.hash)
        {
          var self = this;

          window.setTimeout(function() {
            self.selectItem(window.location.hash.substring(1));
          }, 0);
        }

        this._detailLoader.setHtml('<h1><div class="please">' + qx.core.Setting.get("apiviewer.title") + '</div>API Documentation</h1>');
      },
      this);

      req.addEventListener("failed", function(evt) {
        this.error("Couldn't load file: " + url);
      }, this);

      req.send();
    },


    /**
     * Updates the tree on the left.
     *
     * @type member
     * @param docTree {Map} the documentation tree to use for updating.
     * @return {void}
     */
    _updateTree : function(docTree)
    {
      var inheritenceNode = new qx.ui.tree.TreeFolder("Inheritence hierarchy");
      var packagesNode = new qx.ui.tree.TreeFolder("Packages");

      this._tree.removeAll();
      this._tree.add(inheritenceNode, packagesNode);

      // Fille the packages tree (and fill the _topLevelClassNodeArr)
      this._topLevelClassNodeArr = [];
      this._fillPackageNode(packagesNode, docTree, 0);

      // Sort the _topLevelClassNodeArr
      this._topLevelClassNodeArr.sort(function(node1, node2) {
        return (node1.attributes.fullName < node2.attributes.fullName) ? -1 : 1;
      });

      // Fill the inheritence tree
      for (var i=0; i<this._topLevelClassNodeArr.length; i++) {
        this._createInheritanceNode(inheritenceNode, this._topLevelClassNodeArr[i], docTree);
      }

      packagesNode.open();

      if (this._wantedClassName)
      {
        this.showClassByName(this._wantedClassName);
        this._wantedClassName = null;
      }
    },


    /**
     * Fills a package tree node with tree nodes for the sub packages and classes.
     *
     * @type member
     * @param treeNode {qx.ui.tree.TreeFolder} the package tree node.
     * @param docNode {Map} the documentation node of the package.
     * @param depth {var} TODOC
     * @return {void}
     */
    _fillPackageNode : function(treeNode, docNode, depth)
    {
      var ApiViewer = apiviewer.Viewer;
      var TreeUtil = apiviewer.TreeUtil;

      var packagesDocNode = TreeUtil.getChild(docNode, "packages");

      if (packagesDocNode && packagesDocNode.children)
      {
        for (var i=0; i<packagesDocNode.children.length; i++)
        {
          var packageDocNode = packagesDocNode.children[i];
          var iconUrl = TreeUtil.getIconUrl(packageDocNode);
          var packageTreeNode = new qx.ui.tree.TreeFolder(packageDocNode.attributes.name, iconUrl);
          packageTreeNode.docNode = packageDocNode;
          treeNode.add(packageTreeNode);

          this._fillPackageNode(packageTreeNode, packageDocNode, depth + 1);

          // Open the package node if it has child packages
          if (depth < qx.core.Setting.get("apiviewer.initialTreeDepth") && TreeUtil.getChild(packageDocNode, "packages")) {
            packageTreeNode.open();
          }

          // Register the tree node
          this._classTreeNodeHash[ApiViewer.PACKAGE_TREE][packageDocNode.attributes.fullName] = packageTreeNode;
        }
      }

      var classesDocNode = TreeUtil.getChild(docNode, "classes");

      if (classesDocNode && classesDocNode.children)
      {
        for (var i=0; i<classesDocNode.children.length; i++)
        {
          var classDocNode = classesDocNode.children[i];
          var iconUrl = TreeUtil.getIconUrl(classDocNode);
          var classTreeNode = new qx.ui.tree.TreeFolder(classDocNode.attributes.name, iconUrl);
          classTreeNode.docNode = classDocNode;
          classTreeNode.treeType = ApiViewer.PACKAGE_TREE;
          treeNode.add(classTreeNode);

          // Register the tree node
          this._classTreeNodeHash[ApiViewer.PACKAGE_TREE][classDocNode.attributes.fullName] = classTreeNode;

          // Check whether this is a top-level-class
          if (classDocNode.attributes.superClass == null) {
            this._topLevelClassNodeArr.push(classDocNode);
          }
        }
      }
    },


    /**
     * Creates the tree node for a class containing class nodes for all its child
     * classes.
     *
     * @type member
     * @param parentTreeNode {var} TODOC
     * @param classDocNode {Map} the documentation node of the class.
     * @param docTree {Map} the documentation tree.
     * @return {void}
     */
    _createInheritanceNode : function(parentTreeNode, classDocNode, docTree)
    {
      var ApiViewer = apiviewer.Viewer;
      var TreeUtil = apiviewer.TreeUtil;

      // Create the tree node
      var iconUrl = TreeUtil.getIconUrl(classDocNode);
      var classTreeNode = new qx.ui.tree.TreeFolder(classDocNode.attributes.fullName, iconUrl);
      classTreeNode.docNode = classDocNode;
      classTreeNode.treeType = ApiViewer.INHERITENCE_TREE;
      parentTreeNode.add(classTreeNode);

      // Register the tree node
      this._classTreeNodeHash[ApiViewer.INHERITENCE_TREE][classDocNode.attributes.fullName] = classTreeNode;

      // Add all child classes
      var childClassNameCsv = classDocNode.attributes.childClasses;

      if (childClassNameCsv)
      {
        var childClassNameArr = childClassNameCsv.split(",");

        for (var i=0; i<childClassNameArr.length; i++)
        {
          var childClassDocNode = TreeUtil.getClassDocNode(docTree, childClassNameArr[i]);
          this._createInheritanceNode(classTreeNode, childClassDocNode, docTree);
        }
      }
    },


    /**
     * Event handler. Called when the tree selection has changed.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onTreeSelectionChange : function(evt)
    {
      var treeNode = evt.getData()[0];

      if (treeNode && treeNode.docNode)
      {
        var newTitle = this._titlePrefix + " - class " + treeNode.docNode.attributes.fullName;

        qx.client.History.getInstance().addToHistory(treeNode.docNode.attributes.fullName, newTitle);

        this._currentTreeType = treeNode.treeType;

        this._selectTreeNode(treeNode);

        window.location.hash = "#" + treeNode.docNode.attributes.fullName;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param evt {Event} TODOC
     * @return {void}
     */
    _onHistoryRequest : function(evt) {
      this.showClassByName(evt.getData());
    },


    /**
     * TODOC
     *
     * @type member
     * @param vTreeNode {qx.ui.tree.AbstractTreeElement} TODOC
     * @return {void}
     */
    _selectTreeNode : function(vTreeNode)
    {
      if (!(vTreeNode && vTreeNode.docNode)) {
        this.error("Invalid tree node: " + vTreeNode);
      }

      var vDoc = vTreeNode.docNode;

      this._detailLoader.setVisibility(false);

      if (vDoc.type == "class")
      {
        this._packageViewer.setVisibility(false);
        this._classViewer.showClass(vDoc);
        this._classViewer.setVisibility(true);
      }
      else
      {
        this._classViewer.setVisibility(false);
        this._packageViewer.showInfo(vDoc);
        this._packageViewer.setVisibility(true);
      }
    },


    /**
     * Selects an item (class, property, method or constant).
     *
     * @type member
     * @param fullItemName {String} the full name of the item to select.
     *          (e.g. "qx.mypackage.MyClass" or "qx.mypackage.MyClass#myProperty")
     * @return {void}
     */
    selectItem : function(fullItemName)
    {
      var className = fullItemName;
      var itemName = null;
      var hashPos = fullItemName.indexOf("#");

      if (hashPos != -1)
      {
        className = fullItemName.substring(0, hashPos);
        itemName = fullItemName.substring(hashPos + 1);

        var parenPos = itemName.indexOf("(");

        if (parenPos != -1) {
          itemName = qx.lang.String.trim(itemName.substring(0, parenPos));
        }
      }

      this.showClassByName(className);

      if (itemName) {
        this._classViewer.showItem(itemName);
      }
    },


    /**
     * Shows a certain class.
     *
     * @type member
     * @param className {String} the name of the class to show.
     * @return {void}
     */
    showClassByName : function(className)
    {
      var treeNode = this._classTreeNodeHash[this._currentTreeType][className];

      if (treeNode) {
        treeNode.setSelected(true);
      }
      else if (this.getDocTree() == null)
      {
        // The doc tree has not been loaded yet
        // -> Remeber the wanted class and show when loading is done
        this._wantedClassName = className;
      }
      else
      {
        this.error("Unknown class: " + className);
      }
    }

  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings :
  {
    "apiviewer.title"            : "qooxdoo",
    "apiviewer.initialTreeDepth" : 1
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("_tree", "_detailFrame", "_detailLoader", "_classViewer", "_packageViewer");
    this._disposeFields("_classTreeNodeHash");
  }
});
