/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(demobrowser)

************************************************************************ */

qx.Class.define("demobrowser.TreeDataHandler",
{
  extend : qx.core.Object,

  construct : function(testRep)
  {
    this.base(arguments);
    testRep    = demobrowser.TreeDataHandler.testRep;
    this.tmap  = eval(testRep); //[{classname:myClass,tests:['test1','test2']}, {...}]
    this.ttree = this.__readTestRep(testRep);
  },


  members : {

      __readTestRep : function (testRep)
      {
        var tmap = eval(testRep); // Json -> JS

        function insert (root, el)
        {
          var mclass = el.classname;
          var path   = mclass.split(".");
          var dirname = path.slice(0,path.length-1);
          var basename= path[path.length-1];

          /**
           * create a new tree path from path, under parent node
           */
          function createPath (parent, path)
          {
            if (! path.length) // never do "path == []"
            {
              return parent;
            } else
            {
              var head     = path[0];
              var pathrest = path.slice(1,path.length);
              var target   = null;
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
                nextRoot = new demobrowser.Tree(head);
                parent.add(nextRoot);
              }
              // and recurse with the new root and the rest of path
              target = createPath(nextRoot, pathrest);
              return target;
            }
          } //createPath()

          var target = createPath(root, path);
          if (!target) { throw new Exception("No target to insert tests"); }
          that.readTree(el,target);
        } //insert()

        var root = new demobrowser.Tree("All");
        var that = this;
        for (var i=0; i<tmap.length; i++)
        {
          insert(root,tmap[i]);
        }

        return root;
      },


      // recursive struct reader
      readTree : function (struct,node) // struct has single root node!
      {
        // current node
        var tree = arguments[1] || new demobrowser.Tree(struct.classname);
        var node;
        // current test leafs
        for (var j=0; j<struct.tests.length; j++)
        {
          node = new demobrowser.Tree(struct.tests[j]);
          node.type = "test";  // tests are leaf nodes
          tree.add(node);
        }
        // current children
        if (struct.children && struct.children.length)
        {
          for (var j=0; j<struct.children.length; j++)
          {
            tree.add(readTree(struct.children[j]));
          }
        }
        return tree;
      },


      getRoot : function () {
        if (! this.Root) {
          var root = {classname: "", tests: []};
          var tmap = this.tmap;
          for (var i=0;i<this.tmap.length;i++){
            if (root.classname.length > tmap[i].classname.length){
              root = tmap[i];
            }
          }
          this.Root = root;
        }
        return this.Root.classname;
      },


      getChilds : function (node){
        var cldList = [];
        var tmap    = this.tmap;
        var nodep   = "^" + node + "\\.[^\\.]+$";
        var pat     = new RegExp(nodep);
        for (var i=0;i<tmap.length;i++) {
          if (tmap[i].classname.match(pat)) {
            cldList.push(tmap[i]);
          }
        }
        return cldList;
      },


      /*
       * get the tests directly contained in a class
       */
      getTests : function (node) { // node is a string
        var tmap = this.tmap;
        for (var i=0;i<tmap.length;i++) {
          if (tmap[i].classname == node) {
            return tmap[i].tests;
          }
        }
        return [];
      },


      getPath : function (node) { // node is a modelNode
        var path   = node.pwd();
        path.shift(); // remove leading 'All'
        //var tclass = path.join(".")+"."+node.label;
        if(this.isClass(node))
        {
          path = path.concat(node.label);
        }
        return path;
      },


      /**
       * TODO: still uses string-based class spec!!
       *
       * @param node {String} a class or test name
       * @returns nodeList {List} list of tests or direct subclasses
       */
      getChildren : function (node) {
        if (node == "All") {
          var tmap = this.tmap;
          var classes = [];
          for (var i=0;i<tmap.length;i++) {
            classes.push(tmap[i].classname);
          }
          return classes;
        } else if (this.isClass(node)) {
          return this.getTests(node);
        } else {
          return [];
        }
      },


      isClass : function (node) {
        if (node.type && node.type == "test") {
          return false;
        } else {
          return true;
        }
      },


      hasTests : function (node)
      {
        if (! this.isClass(node))
          return false;
        else
        {
          var children = node.getChildren();
          for (var i=0; i<children.length; i++)
          {
            if (children[i].type && children[i].type == "test")
              return true;
          }
          return false;
        }
      },


      classFromTest : function (node) {
        var classname = "";
        var tests = [];
        classloop:
        for (var i=0; i<this.tmap.length; i++) {
          for (var j=0; j<this.tmap[i].tests.length; j++) {
            if (this.tmap[i].tests[j] == node) {
              classname = this.tmap[i].classname;
              break classloop;
            }
          };
        };
        return classname;
      },


      /**
       * return the full name of a test from its model node
       *
       * @param node {Tree} a model node
       * @return fullName {String} like "demobrowser.test.Class.testEmptyClass"
       */
      getFullName : function (node)  // node is a tree node
      {
        var path = this.getPath(node);
        if (node.type && node.type == "test")
        {
          path = path.concat(node.label);
        }
        return path.join(".");
      },


      testCount : function (node) { //node is a tree node
        if (node.type && node.type=="test") {
          return 1;
        } else { // enumerate recursively
          var num = 0;
          var iter = node.getIterator("depth");
          var curr;
          while(curr = iter())
          {
            if (curr.type && curr.type == "test")
            {
              num++;
            }
          }
          return num;
        }
      }


  },

  statics: 
  {
    testRep : [{classname: "examples", tests:["ListView_2.html","Atom_3.html","ColorPopup_1.html","RepeatButton_1.html","ComboBox_1.html","ColorSelector_2.html","Command_2.html","Flash_1.html","Command_1.html","Fsm_1.html","CheckBox_1.html","Window_1.html","ListView_1.html","SplitPane_1.html","GroupBox_1.html","ToolTip_3.html","Gallery_1.html","Inline_1.html","Drag_1.html","GalleryList_1.html","ListView_3.html","TreeVirtual_5.html","TreeVirtual_2.html","Menu_1.html","ToolBar_3.html","ComboBoxEx_1.html","ToolBar_4.html","TreeFullControl_3.html","Atom_1.html","Iframe_1.html","ButtonView_1.html","TreeFullControl_2.html","Table_1.html","ListView_4.html","Atom_2.html","List_1.html","RadioButton_1.html","ButtonView_2.html","GroupBox_3.html","Fields_1.html","RpcTreeFullControl_1.html","NativeWindow_1.html","ToolBar_2.html","TreeVirtual_1.html","Table_2.html","ToolBar_1.html","TreeFullControl_1.html","Table_3.html","Button_1.html","GroupBox_2.html","Spinner_1.html","TabView_2.html","TreeVirtual_3.html","TreeFullControl_4.html","SplitPane_2.html","ToolTip_1.html","DateChooser_1.html","ColorSelector_1.html","RadioView_1.html","Tree_1.html","TabView_1.html","Resizer_1.html","TreeVirtual_4.html"]}]
  }

});

