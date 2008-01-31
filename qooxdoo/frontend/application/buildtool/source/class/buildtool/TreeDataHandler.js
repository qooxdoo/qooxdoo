/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(buildtool)

************************************************************************ */

qx.Class.define("buildtool.TreeDataHandler",
{
  extend : qx.core.Object,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(testRep)
  {
    this.base(arguments);
    this.tmap = testRep;
    this.ttree = this.__readTestRep(testRep);
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @param testRep {var} TODOC
     * @return {var} TODOC
     * @throws TODOC
     */
    __readTestRep : function(testRep)
    {
      var tmap = testRep;

      function insert(root, el)
      {
        var mclass = el.classname;
        var path = mclass.split(".");
        var dirname = path.slice(0, path.length - 1);
        var basename = path[path.length - 1];


        /**
         * create a new tree path from path, under parent node
         */
        function createPath(parent, path)
        {
          if (!path.length)  // never do "path == []"
          {
            return parent;
          }
          else
          {
            var head = path[0];
            var pathrest = path.slice(1, path.length);
            var target = null;
            var nextRoot = null;

            // check children
            var children = parent.getChildren();

            for (var i=0; i<children.length; i++)
            {
              if (children[i].label == head)
              {
                nextRoot = children[i];
                break;
              }
            }

            // else create new
            if (nextRoot == null)
            {
              nextRoot = new buildtool.Tree(head);
              parent.add(nextRoot);
            }

            // and recurse with the new root and the rest of path
            target = createPath(nextRoot, pathrest);
            return target;
          }
        }

        var target = createPath(root, path);

        if (!target) {
          throw new Exception("No target to insert tests");
        }

        that.readTree(el, target);
      }

      var root = new buildtool.Tree("All");
      var that = this;

      for (var i=0; i<tmap.length; i++) {
        insert(root, tmap[i]);
      }

      return root;
    },


    /**
     * recursive struct reader
     *
     * @type member
     * @param struct {var} TODOC
     * @param node {Node} TODOC
     * @return {var} TODOC
     */
    readTree : function(struct, node)  // struct has single root node!
    {
      // current node
      var tree = arguments[1] || new buildtool.Tree(struct.classname);
      var node;

      // current test leafs
      function mysort(a, b) {
        return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
      }

      struct.tests.sort(mysort);

      for (var j=0; j<struct.tests.length; j++)
      {
        node = new buildtool.Tree(struct.tests[j].name);
        node.type = "test";  // tests are leaf nodes
        node.desc = struct.tests[j].desc;
        tree.add(node);
      }

      // current children
      if (struct.children && struct.children.length)
      {
        for (var j=0; j<struct.children.length; j++) {
          tree.add(readTree(struct.children[j]));
        }
      }

      return tree;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getRoot : function()
    {
      if (!this.Root)
      {
        var root =
        {
          classname : "",
          tests     : []
        };

        var tmap = this.tmap;

        for (var i=0; i<this.tmap.length; i++)
        {
          if (root.classname.length > tmap[i].classname.length) {
            root = tmap[i];
          }
        }

        this.Root = root;
      }

      return this.Root.classname;
    },


    /**
     * TODOC
     *
     * @type member
     * @param node {Node} TODOC
     * @return {var} TODOC
     */
    getChilds : function(node)
    {
      var cldList = [];
      var tmap = this.tmap;
      var nodep = "^" + node + "\\.[^\\.]+$";
      var pat = new RegExp(nodep);

      for (var i=0; i<tmap.length; i++)
      {
        if (tmap[i].classname.match(pat)) {
          cldList.push(tmap[i]);
        }
      }

      return cldList;
    },

    /*
     * get the tests directly contained in a class
     */

    /**
     * TODOC
     *
     * @type member
     * @param node {Node} TODOC
     * @return {var | Array} TODOC
     */
    getTests : function(node)
    {  // node is a string
      var tmap = this.tmap;

      for (var i=0; i<tmap.length; i++)
      {
        if (tmap[i].classname == node) {
          return tmap[i].tests;
        }
      }

      return [];
    },


    /**
     * TODOC
     *
     * @type member
     * @param node {Node} TODOC
     * @return {var} TODOC
     */
    getPath : function(node)
    {  // node is a modelNode
      var path = node.pwd();
      path.shift();  // remove leading 'All'

      // var tclass = path.join(".")+"."+node.label;
      if (this.isClass(node)) {
        path = path.concat(node.label);
      }

      return path;
    },


    /**
     * TODO: still uses string-based class spec!!
     *
     * @type member
     * @param node {String} a class or test name
     * @return {var | Array} TODOC
     */
    getChildren : function(node)
    {
      if (node == "All")
      {
        var tmap = this.tmap;
        var classes = [];

        for (var i=0; i<tmap.length; i++) {
          classes.push(tmap[i].classname);
        }

        return classes;
      }
      else if (this.isClass(node))
      {
        return this.getTests(node);
      }
      else
      {
        return [];
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param node {Node} TODOC
     * @return {boolean} TODOC
     */
    isClass : function(node)
    {
      if (node.type && node.type == "test") {
        return false;
      } else {
        return true;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param node {Node} TODOC
     * @return {boolean} TODOC
     */
    hasTests : function(node)
    {
      if (!this.isClass(node)) return false;
      else
      {
        var children = node.getChildren();

        for (var i=0; i<children.length; i++)
        {
          if (children[i].type && children[i].type == "test") return true;
        }

        return false;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param node {Node} TODOC
     * @return {var} TODOC
     */
    classFromTest : function(node)
    {
      var classname = "";
      var tests = [];
      classloop:

      for (var i=0; i<this.tmap.length; i++)
      {
        for (var j=0; j<this.tmap[i].tests.length; j++)
        {
          if (this.tmap[i].tests[j] == node)
          {
            classname = this.tmap[i].classname;
            break classloop;
          }
        }
      }

      return classname;
    },


    /**
     * return the full name of a test from its model node
     *
     * @type member
     * @param node {Tree} a model node
     * @return {var} fullName {String} like "buildtool.test.Class.testEmptyClass"
     */
    getFullName : function(node)  // node is a tree node
    {
      var path = this.getPath(node);

      if (node.type && node.type == "test") {
        path = path.concat(node.label);
      }

      return path.join(".");
    },


    /**
     * TODOC
     *
     * @type member
     * @param node {Node} TODOC
     * @return {var} TODOC
     */
    getPreviousNode : function(node)  // node is tree node
    {
      var prevNode = node.getPrevSibling();

      if (prevNode) {
        return prevNode;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param node {Node} TODOC
     * @return {var} TODOC
     */
    getNextNode : function(node)  // node is a tree node
    {
      var nextNode = node.getNextSibling();

      if (nextNode) {
        return nextNode;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param node {Node} TODOC
     * @return {int | Number} TODOC
     */
    testCount : function(node)
    {  // node is a tree node
      if (node.type && node.type == "test") {
        return 1;
      }
      else
      {  // enumerate recursively
        var num = 0;
        var iter = node.getIterator("depth");
        var curr;

        while (curr = iter())
        {
          if (curr.type && curr.type == "test") {
            num++;
          }
        }

        return num;
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
    this._disposeFields("tmap");
    this._disposeObjects("ttree");
  }
});
