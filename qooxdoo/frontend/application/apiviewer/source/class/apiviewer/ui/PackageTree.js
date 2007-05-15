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

************************************************************************ */

/**
 * The package tree.
 */
qx.Class.define("apiviewer.ui.PackageTree",
{
  extend : qx.ui.tree.Tree,


  construct : function()
  {
    //this.base(arguments, "API Documentation");
    this.base(arguments, "Packages");

    this.set({
      backgroundColor : "white",
      overflow        : "scroll",
      width           : "100%",
      height          : "100%",
      paddingLeft     : 5,
      paddingTop      : 3
    });

    this._currentTreeType = apiviewer.ui.PackageTree.PACKAGE_TREE;

    // Workaround: Since navigating in qx.ui.tree.Tree doesn't work, we've to
    //             maintain a hash that keeps the tree nodes for class names
    this._classTreeNodeHash = {};
    this._classTreeNodeHash[apiviewer.ui.PackageTree.PACKAGE_TREE] = {};
    this._classTreeNodeHash[apiviewer.ui.PackageTree.INHERITENCE_TREE] = {};

    this.getManager().addEventListener("changeSelection", function(e) {
      var treeNode = e.getData()[0];
      if (treeNode && treeNode.docNode) {
        this._currentTreeType = treeNode.treeType;
      }
    }, this);

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
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /**
     * Updates the tree on the left.
     *
     * @type member
     * @param docTree {apiviewer.dao.Package} the documentation tree to use for updating.
     * @return {void}
     */
    setTreeData : function(docTree)
    {
      this._docTree = docTree;
      //var inheritenceNode = new qx.ui.tree.TreeFolder("Inheritence hierarchy");
      //var packagesNode = new qx.ui.tree.TreeFolder("Packages");

      this.removeAll();
      //this.add(inheritenceNode, packagesNode);
      //this.add(packagesNode);

      // Fill the packages tree
      //this.__fillPackageNode(packagesNode, docTree, 0);
      this.__fillPackageNode(this, docTree, 0);

      /*
      var start = new Date();
      // fill the _topLevelClassNodeArr
      this._topLevelClassNodeArr = apiviewer.dao.Class.getAllTopLevelClasses();

      // Sort the _topLevelClassNodeArr
      this._topLevelClassNodeArr.sort(function(node1, node2) {
        return (node1.getFullName() < node2.getFullName()) ? -1 : 1;
      });

      // Fill the inheritence tree
      for (var i=0; i<this._topLevelClassNodeArr.length; i++) {
        this.__createInheritanceNode(inheritenceNode, this._topLevelClassNodeArr[i]);
      }
      var end = new Date();
      this.debug("Time to fill the inheritence tree: " + (end.getTime() - start.getTime()) + "ms");
      */

      //packagesNode.open();
      this.open();

      if (this._wantedClassName)
      {
        this.selectTreeNodeByClassName(this._wantedClassName);
        this._wantedClassName = null;
      }
    },


    /**
     * Selects a certain class.
     *
     * @type member
     * @param className {String} the name of the class to show.
     * @return {Boolean} Whether the class name was valid and could be selected.
     */
    selectTreeNodeByClassName : function(className)
    {
      if (this._docTree == null)
      {
        // The doc tree has not been loaded yet
        // -> Remeber the wanted class and show when loading is done
        this._wantedClassName = className;
        return true;
      }
      var nameParts = className.split(".");
      var packageName = nameParts[0];
      var i = 0;
      do {
        var treeNode =
          this._classTreeNodeHash[this._currentTreeType || apiviewer.ui.PackageTree.PACKAGE_TREE][packageName];

        if (!treeNode){
          return false;
        }

        if (!treeNode.loaded) {
          treeNode.setOpen(true);
        }
        i++;
        packageName += "." + nameParts[i];
      } while (i<nameParts.length);

      treeNode.setSelected(true);
      return true;
    },


    /**
     * Create a callback which loads the child nodes of a tree folder
     *
     * @type member
     * @param packageTreeNode {qx.ui.tree.TreeFolder} the package tree folder.
     * @param packageDoc {apiviewer.dao.Package} the documentation node of the package.
     * @param depth {var} current depth in the tree
     * @return {Function} the opener callback function
     */
    __getPackageNodeOpener : function (packageTreeNode, packageDoc, depth) {
      var self = this;
      return function() {
        if (!packageTreeNode.loaded)
        {
          self.__fillPackageNode(packageTreeNode, packageDoc, depth + 1);
          packageTreeNode.setAlwaysShowPlusMinusSymbol(false);
        }
      }
    },


    /**
     * Fills a package tree node with tree nodes for the sub packages and classes.
     *
     * @type member
     * @param treeNode {qx.ui.tree.TreeFolder} the package tree node.
     * @param docNode {apiviewer.dao.Package} the documentation node of the package.
     * @param depth {var} current depth in the tree
     */
    __fillPackageNode : function(treeNode, docNode, depth)
    {
      treeNode.loaded = true;
      var PackageTree = apiviewer.ui.PackageTree;

      var packagesDoc = docNode.getPackages();
      for (var i=0; i<packagesDoc.length; i++)
      {
        var packageDoc = packagesDoc[i];
        var iconUrl = apiviewer.TreeUtil.getIconUrl(packageDoc);
        var packageTreeNode = new qx.ui.tree.TreeFolder(packageDoc.getName(), iconUrl);
        packageTreeNode.setAlwaysShowPlusMinusSymbol(true);
        packageTreeNode.docNode = packageDoc;
        treeNode.add(packageTreeNode);

        // defer adding of child nodes
        packageTreeNode.addEventListener("changeOpen", this.__getPackageNodeOpener(packageTreeNode, packageDoc, depth + 1), this);

        // Open the package node if it has child packages
        if (depth < qx.core.Setting.get("apiviewer.initialTreeDepth") && packageDoc.getPackages().length > 0) {
          packageTreeNode.open();
        }

        // Register the tree node
        this._classTreeNodeHash[PackageTree.PACKAGE_TREE][packageDoc.getFullName()] = packageTreeNode;
      }

      var classesDoc = docNode.getClasses();
      for (var i=0; i<classesDoc.length; i++)
      {
        var classDoc = classesDoc[i];
        var iconUrl = apiviewer.TreeUtil.getIconUrl(classDoc);
        var classTreeNode = new qx.ui.tree.TreeFolder(classDoc.getName(), iconUrl);
        classTreeNode.docNode = classDoc;
        classTreeNode.treeType = PackageTree.PACKAGE_TREE;
        treeNode.add(classTreeNode);

        // Register the tree node
        this._classTreeNodeHash[PackageTree.PACKAGE_TREE][classDoc.getFullName()] = classTreeNode;
      }
    },


    /**
     * Creates the tree node for a class containing class nodes for all its child
     * classes.
     *
     * @type member
     * @param parentTreeNode {qx.ui.tree.TreeFolder} the parent tree node of the current sub tree
     * @param classDocNode {apiviewer.dao.Package} the documentation node of the class.
     */
    __createInheritanceNode : function(parentTreeNode, classDocNode)
    {
      var PackageTree = apiviewer.ui.PackageTree;

      // Create the tree node
      var iconUrl = apiviewer.TreeUtil.getIconUrl(classDocNode);
      var classTreeNode = new qx.ui.tree.TreeFolder(classDocNode.getFullName(), iconUrl);
      classTreeNode.docNode = classDocNode;
      classTreeNode.treeType = PackageTree.INHERITENCE_TREE;
      parentTreeNode.add(classTreeNode);

      // Register the tree node
      this._classTreeNodeHash[PackageTree.INHERITENCE_TREE][classDocNode.getFullName()] = classTreeNode;

      var childClassNameArr = classDocNode.getChildClasses();
      if (childClassNameArr.length < 0) {
        return;
      }

      classTreeNode.setAlwaysShowPlusMinusSymbol(true);

      // defer adding of child nodes
      classTreeNode.addEventListener("changeOpen", function() {
        if (!classTreeNode.loaded)
        {
          for (var i=0; i<childClassNameArr.length; i++)
          {
            var childClassDocNode = apiviewer.dao.Class.getClassByName(childClassNameArr[i]);
            this.__createInheritanceNode(classTreeNode, childClassDocNode);
          }
          classTreeNode.setAlwaysShowPlusMinusSymbol(false);
          classTreeNode.loaded = true;
        }
      }, this);
    }
  },
  
  
  
  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields("_docTree", "_classTreeNodeHash");
  }
});