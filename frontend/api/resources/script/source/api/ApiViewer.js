/*
#module(api)
*/

/**
 * The API viewer. Shows the API documentation.
 *
 * @param clientWindow {qx.client.ClientWindow} the window were to show the API
 *        documentation.
 */
qx.OO.defineClass("api.ApiViewer", qx.core.Object,
function (clientWindow) {
  qx.core.Object.call(this);

  var ApiViewer = api.ApiViewer;

  this._titlePrefix = document.title;

  var boxLayout = new qx.ui.layout.HorizontalBoxLayout;

  boxLayout.setEdge(0);

  this._tree = new qx.ui.tree.Tree("qooxdoo API Documentation");
  this._tree.set({
    backgroundColor: "white",
    border: qx.renderer.border.BorderObject.presets.black,
    overflow: "scroll",
    width: "22%",
    minWidth : 150,
    maxWidth : 300
  });
  this._tree.getManager().addEventListener("changeSelection", this._onTreeSelectionChange, this);
  boxLayout.add(this._tree);

  this._detailViewer = new api.DetailViewer;
  boxLayout.add(this._detailViewer);

  this._currentTreeType = ApiViewer.PACKAGE_TREE;

  // Workaround: Since navigating in qx.ui.tree.Tree doesn't work, we've to
  //             maintain a hash that keeps the tree nodes for class names
  this._classTreeNodeHash = {};
  this._classTreeNodeHash[ApiViewer.PACKAGE_TREE] = {};
  this._classTreeNodeHash[ApiViewer.INHERITENCE_TREE] = {};

  clientWindow.getClientDocument().add(boxLayout);

  api.ApiViewer.instance = this;

  qx.client.History.init();
  qx.client.History.addEventListener("request", this._onHistoryRequest, this);
});


/** The documentation tree to show. */
qx.OO.addProperty({ name:"docTree", type:qx.constant.Type.OBJECT });


// property checker
qx.Proto._modifyDocTree = function(propValue, propOldValue, propData) {
  this._updateTree(propValue);
  return true;
}


/**
 * Loads the API doc tree from a URL. The URL must point to a JSON encoded
 * doc tree.
 *
 * @param url {string} the URL.
 */
qx.Proto.loadDocTreeFromUrl = function(url) {
  var req = new qx.io.remote.RemoteRequest(url);
  handler = function(evt) {
    req.removeEventListener("completed", handler, this);

    content = evt.getData().getContent();
    this.setDocTree(eval("(" + content + ")"));

    // Handle bookmarks
    if (window.location.hash) {
      var self = this;
      window.setTimeout(function() {
        self.selectItem(window.location.hash.substring(1));
      }, 0);
    }
  }
  req.addEventListener("completed", handler, this);
  req.send();
}


/**
 * Updates the tree on the left.
 *
 * @param docTree {Map} the documentation tree to use for updating.
 */
qx.Proto._updateTree = function(docTree) {
  var inheritenceNode = new qx.ui.tree.TreeFolder("Inheritence hierarchy");
  var packagesNode = new qx.ui.tree.TreeFolder("Packages");

  this._tree.removeAll();
  this._tree.add(inheritenceNode, packagesNode);

  // Fille the packages tree (and fill the _topLevelClassNodeArr)
  this._topLevelClassNodeArr = [];
  this._fillPackageNode(packagesNode, docTree);

  // Sort the _topLevelClassNodeArr
  this._topLevelClassNodeArr.sort(function (node1, node2) {
    return (node1.attributes.fullName < node2.attributes.fullName) ? -1 : 1;
  });

  // Fill the inheritence tree
  for (var i = 0; i < this._topLevelClassNodeArr.length; i++) {
    this._createInheritanceNode(inheritenceNode, this._topLevelClassNodeArr[i], docTree);
  }

  packagesNode.open();

  if (this._wantedClassName) {
    this.showClass(this._wantedClassName);
    this._wantedClassName = null;
  }
}


/**
 * Fills a package tree node with tree nodes for the sub packages and classes.
 *
 * @param treeNode {qx.ui.tree.TreeFolder} the package tree node.
 * @param docNode {Map} the documentation node of the package.
 */
qx.Proto._fillPackageNode = function(treeNode, docNode) {
  var ApiViewer = api.ApiViewer;
  var TreeUtil = api.TreeUtil;

  var packagesDocNode = TreeUtil.getChild(docNode, "packages");
  if (packagesDocNode && packagesDocNode.children) {
    for (var i = 0; i < packagesDocNode.children.length; i++) {
      var packageDocNode = packagesDocNode.children[i];
      var iconUrl = TreeUtil.getIconUrl(packageDocNode);
      var packageTreeNode = new qx.ui.tree.TreeFolder(packageDocNode.attributes.name, iconUrl);
      packageTreeNode.docNode = packageDocNode;
      treeNode.add(packageTreeNode);

      this._fillPackageNode(packageTreeNode, packageDocNode);

      // Open the package node if it has child packages
      if (TreeUtil.getChild(packageDocNode, "packages")) {
        packageTreeNode.open();
      }
    }
  }

  var classesDocNode = TreeUtil.getChild(docNode, "classes");
  if (classesDocNode && classesDocNode.children) {
    for (var i = 0; i < classesDocNode.children.length; i++) {
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
}


/**
 * Creates the tree node for a class containing class nodes for all its child
 * classes.
 *
 * @param classDocNode {Map} the documentation node of the class.
 * @param docTree {Map} the documentation tree.
 */
qx.Proto._createInheritanceNode = function(parentTreeNode, classDocNode, docTree) {
  var ApiViewer = api.ApiViewer;
  var TreeUtil = api.TreeUtil;

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
  if (childClassNameCsv) {
    var childClassNameArr = childClassNameCsv.split(",");
    for (var i = 0; i < childClassNameArr.length; i++) {
      var childClassDocNode = TreeUtil.getClassDocNode(docTree, childClassNameArr[i]);
      this._createInheritanceNode(classTreeNode, childClassDocNode, docTree);
    }
  }
}


/**
 * Event handler. Called when the tree selection has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onTreeSelectionChange = function(evt) {
  var treeNode = evt.getData()[0];
  if (treeNode && treeNode.docNode && treeNode.docNode.type == "class") {
    var newTitle = this._titlePrefix + " - class " + treeNode.docNode.attributes.fullName;
//    qx.client.History.addToHistory(treeNode.docNode.attributes.fullName, newTitle);

    this._currentTreeType = treeNode.treeType;

    this._detailViewer.showClass(treeNode.docNode);
    this._detailViewer.setVisibility(true);

    window.location.hash = "#" + treeNode.docNode.attributes.fullName;
  } else {
    document.title = this._titlePrefix;
    this._detailViewer.setVisibility(false);

    if (treeNode && treeNode.docNode && treeNode.docNode.attributes) {
      // Other than classes are not support for bookmarkable-urls currently
      window.location.hash = "#" + treeNode.docNode.attributes.fullName;
    }
  }
}


qx.Proto._onHistoryRequest = function(evt) {
  this.showClass(evt.getData());
}


/**
 * Selects an item (class, property, method or constant).
 *
 * @param fullItemName {string} the full name of the item to select.
 *        (e.g. "qx.mypackage.MyClass" or "qx.mypackage.MyClass#myProperty")
 */
qx.Proto.selectItem = function(fullItemName) {
  var className = fullItemName;
  var itemName = null;
  var hashPos = fullItemName.indexOf("#");
  if (hashPos != -1) {
    className = fullItemName.substring(0, hashPos);
    itemName = fullItemName.substring(hashPos + 1);

    var parenPos = itemName.indexOf("(");
    if (parenPos != -1) {
      itemName = qx.lang.String.trim(itemName.substring(0, parenPos));
    }
  }

  this.showClass(className);
  if (itemName) {
    this._detailViewer.showItem(itemName);
  }
}


/**
 * Shows a certain class.
 *
 * @param className {string} the name of the class to show.
 */
qx.Proto.showClass = function(className) {
  /*
  this.debug("Showing class: " + className);
  this.debug("traverse bug:"+(this._tree.getItems()[0] == this._tree));
  this.debug("child 1: " + this._tree.getChildren()[1]);
  this.debug("items:"+this._tree.getItems().length);
  this.debug("item 0:"+this._tree.getItems()[0]);

  var item1 = this._tree.getItems()[1];
  this.debug("item 1:"+item1);
  this.debug("item 1 label:"+item1.getLabel());
  this.debug("item 1 items:"+item1.getItems().length);
  this.debug("item 1 items:"+item1.getItems()[0].getLabel());

  var splits = className.split(".");
  var treeNode = this._tree.getItems()[0].getItems()[0];
  for (var i = 0; i < splits.length; i++) {
    if (treeNode) {
      this.debug("Searching " + splits[i] + " in " + treeNode);
      var childNodes = treeNode.getItems();
      nextChild = null;
      for (var j = 0; j < childNodes.length; j++) {
        if (childNodes[j].getLabel() == splits[i]) {
          nextChild = childNodes[j];
          break;
        }
      }
      this.debug("Found: " + nextChild);
      treeNode = nextChild;
    }
  }
  */

  var treeNode = this._classTreeNodeHash[this._currentTreeType][className];

  if (treeNode) {
    treeNode.setSelected(true);

    // Open the parents
    /*
    // Grrrrrrrrr: Tree navigation doesn't work!
    var parent = treeNode.getParent();
    while (parent && parent.open) {
      parent.open();
      parent = parent.getParent();
    }
    */
  } else if (this.getDocTree() == null) {
    // The doc tree has not been loaded yet
    // -> Remeber the wanted class and show when loading is done
    this._wantedClassName = className;
  } else {
    alert("Unknown class: " + className);
  }
}


qx.Class.PACKAGE_TREE = 1;
qx.Class.INHERITENCE_TREE = 2;
