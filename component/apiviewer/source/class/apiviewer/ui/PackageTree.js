/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * The package tree.
 */
qx.Class.define("apiviewer.ui.PackageTree",
{
  extend : qx.ui.tree.Tree,


  construct : function()
  {
    this.base(arguments, "Documentation");
    
    this.setDecorator(null);
    
    this.__root = new qx.ui.tree.TreeFolder("Packages");
    this.__root.setOpen(true);
    this.setRoot(this.__root);
    this.select(this.__root);

    // TODO: Is this workaround still needed?
    // Workaround: Since navigating in qx.ui.tree.Tree doesn't work, we've to
    //             maintain a hash that keeps the tree nodes for class names
    this._classTreeNodeHash = {};
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
     * @param docTree {apiviewer.dao.Package} the documentation tree to use for updating.
     * @return {void}
     */
    setTreeData : function(docTree)
    {
      this._docTree = docTree;

      // Fill the packages tree
      this.__fillPackageNode(this.__root, docTree, 0);

      if (this._wantedClassName)
      {
        this.selectTreeNodeByClassName(this._wantedClassName);
        this._wantedClassName = null;
      }
    },


    /**
     * Selects a certain class.
     *
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
          this._classTreeNodeHash[packageName];

        if (!treeNode){
          return false;
        }

        if (!treeNode.loaded) {
          treeNode.setOpen(true);
        }
        i++;
        packageName += "." + nameParts[i];
      } while (i<nameParts.length);

      this.select(treeNode);
      this.scrollChildIntoView(treeNode);

      return true;
    },


    /**
     * Create a callback which loads the child nodes of a tree folder
     *
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
          packageTreeNode.setOpenSymbolMode("always");
        }
      }
    },


    /**
     * Fills a package tree node with tree nodes for the sub packages and classes.
     *
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
        var packageTreeNode = new qx.ui.tree.TreeFolder(packageDoc.getName());
        packageTreeNode.setIcon(iconUrl);
        packageTreeNode.setOpenSymbolMode("always");
        packageTreeNode.setUserData("nodeName", packageDoc.getFullName());
        treeNode.add(packageTreeNode);

        // defer adding of child nodes
        packageTreeNode.addListener("changeOpen", this.__getPackageNodeOpener(packageTreeNode, packageDoc, depth + 1), this);

        // Open the package node if it has child packages
        if (depth < qx.core.Setting.get("apiviewer.initialTreeDepth") && packageDoc.getPackages().length > 0) {
          packageTreeNode.setOpen(true);
        }

        // Register the tree node
        this._classTreeNodeHash[packageDoc.getFullName()] = packageTreeNode;
      }

      var classesDoc = docNode.getClasses();
      for (var i=0; i<classesDoc.length; i++)
      {
        var classDoc = classesDoc[i];
        var iconUrl = apiviewer.TreeUtil.getIconUrl(classDoc);
        var classTreeNode = new qx.ui.tree.TreeFolder(classDoc.getName());
        classTreeNode.setIcon(iconUrl);
        classTreeNode.setUserData("nodeName", classDoc.getFullName());
        classTreeNode.treeType = PackageTree.PACKAGE_TREE;
        treeNode.add(classTreeNode);

        // Register the tree node
        this._classTreeNodeHash[classDoc.getFullName()] = classTreeNode;
      }
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
