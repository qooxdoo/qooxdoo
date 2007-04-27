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
    this.__readTestRep(testRep);
  },

  members : {

      __readTestRep : function (testRep)
      {
        var tmap = eval(testRep); // Json -> JS
        this.ttree = new qxunit.runner.Tree("All");
        for (var i in tmap) // array of maps
        {
          
        }
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

