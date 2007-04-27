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
     * Thomas Herchenroeder (thron7)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(qxunit)
#resource(css:css)
#resource(image:image)

************************************************************************ */

qx.Class.define("qxunit.runner.TestHandler",
{
  extend : qx.core.Object,

  construct : function(testRep)
  {
    this.base(arguments);
    this.tmap  = eval(testRep); //[{classname:myClass,tests:['test1','test2']}, {...}]
    this.ttree = this.__readTestRep(testRep);
  },

  members : {

      __readTestRep : function (testRep)
      {
        var tmap = eval(testRep); // Json -> JS
        var root = new qxunit.runner.Tree("All");
        for (var i in tmap)
        {
          root.add(this.readTree(tmap[i]));
        }

        return root;
      },


      __readTestRep1 : function (testRep)
      {
        var tmap = eval(testRep); // Json -> JS
        
        function insert (root, el)
        {
          var mclass = el.classname;
          var path   = mclass.split(".");
          var dirname = path.slice(0,path.length-1);
          var basename= path[path.length-1];

          function createPath (node, path)
          {
            if (path == [])
            {
              return null;
            }
            var head     = path[0];

            if (node.label == head)
            {
              var pathrest = path.slice(1,path.length);
              if (! pathrest.length) // end of match
              {
                return node;
              } else {
                // check children
                var children = node.getChildren();
                var target = null;
                for (var i in children)
                {
                  target = createPath(children[i], pathrest);
                }
                // create new
                if (target == null)
                {
                  var neu = new qxunit.runner.Tree(pathrest[0]);
                  node.add(neu);
                  target = createPath(neu, pathrest);
                }
                return target;
              }
            } else  // match failed
            {
              return null;
            }
          } //createPath()

          var target = createPath(root, dirname);
          if (!target) { throw new Exception("No target to insert tests"); }
          target.add(that.readTree(el));
          target.label = basename; // correct target name
        } //insert()

        var root = new qxunit.runner.Tree("qxunit");
        var that = this;
        for (var i in tmap)
        {
          insert(root,tmap[i]);
        }

        return root;
      },


      // recursive struct reader
      readTree : function (struct,node) // struct has single root node! 
      {
        // current node
        var tree = arguments[1] || new qxunit.runner.Tree(struct.classname);
        // current test leafs
        for (var j in struct.tests) 
        {
          tree.add(new qxunit.runner.Tree(struct.tests[j]));
        }
        // current children
        for (var j in struct.children)
        {
          tree.add(readTree(struct.children[j]));
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

      /**
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
        if (node == "All") {
          return true;
        } else {
          for (var i in this.tmap) {
            if (this.tmap[i].classname == node) {
              return true;
            }
          }
          return false;
        }
      },

      classFromTest : function (node) {
        var classname = "";
        var tests = [];
        classloop:  for (var i in this.tmap) {
          for (var j in this.tmap[i].tests) {
            if (this.tmap[i].tests[j] == node) {
              classname = this.tmap[i].classname;
              break classloop;
            }
          };
        };
        return classname;
      },

      testCount : function (node) { //node is a string
        if (this.isClass(node)) {
          var num = 0;
          var children = this.getChildren(node);
          for (var i in children) {
            if (this.isClass(children[i])){
              num += this.testCount(children[i]);
            } else {
              num++;
            }
          }
          return num;
        } else {
          return 1;
        }
      }

  }
});

