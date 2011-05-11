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
  * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/test/*)
#ignore(qx.test.PART_FILES)

************************************************************************ */

qx.Class.define("qx.test.Part",
{
  extend : qx.dev.unit.TestCase,
  include : qx.test.io.MRemoteTest,

  members :
  {
    testLoaderStructureParsing : function()
    {
      var loader = {
        parts : {
          "juhu" : [0, 1],
          "kinners" : [0, 2]
        },
        packages : {
          0 : {uris : ["1.js"]},
          1 : {uris : ["2.js"]},
          2 : {uris : ["3.1.js", "3.2.js"]}
        },
        closureParts : {"juhu": true},
        boot: "juhu"
      };

      var partLoader = new qx.Part(loader);

      // get the parts
      var parts = partLoader.getParts();
      this.assertEquals(2, qx.lang.Object.getKeys(parts).length);
      var juhu = parts["juhu"];
      var kinners = parts["kinners"];

      // check part instances
      this.assertInstance(juhu, qx.io.part.ClosurePart);
      this.assertInstance(kinners, qx.io.part.Part);

      // confirm part packages
      var packages = kinners.getPackages();
      this.assertEquals(2, packages.length);

      this.assertEquals("0", packages[0].getId());
      this.assertEquals("2", packages[1].getId());

      // check package uris
      var pkg2     = packages[1];
      var pkg2Urls = pkg2.getUrls();
      var refUrls  = loader.packages[2].uris;
      for (var s=0; s<refUrls.length; s++){
        this.assertMatch(pkg2Urls[s], new RegExp(refUrls[s] + ".*")); // matches "?nocache=..." if present
      }
    },


    testPreload : function()
    {
      qx.test.PART_FILES = [];

      var loader = {
        parts : {
          "juhu" : ["p1"],
          "affe" : ["p0"]
        },
        packages : {
          p0 : { uris : ["boot.js"]},
          p1 : { uris : [this.getUrl("qx/test/part/file1-closure.js")]}
        },
        closureParts : {"juhu": true},
        boot: "affe"
      };

      var partLoader = new qx.Part(loader);
      qx.Part.$$instance = partLoader;

      var self = this;
      var part = partLoader.getParts()["juhu"];
      window.setTimeout(function() {
        self.resume(function() {
          self.assertEquals(0, qx.test.PART_FILES.length);
          self.assertJsonEquals([], qx.test.PART_FILES);

          self.assertEquals("initialized", part.getReadyState());
          self.assertEquals("cached", part.getPackages()[0].getReadyState());

          // execute closure to check if it is the correct one
          part.getPackages()[0].execute();
          self.assertJsonEquals(["file1-closure"], qx.test.PART_FILES);
        });
      }, 300);

      partLoader.preload("juhu");

      this.wait();
    },


    testPreloadCallback : function()
    {
      qx.test.PART_FILES = [];

      var loader = {
        parts : {
          "juhu" : ["p1"],
          "affe" : ["p0"]
        },
        packages : {
          p0 : { uris : ["boot.js"]},
          p1 : { uris : [this.getUrl("qx/test/part/file1-closure.js")]}
        },
        closureParts : {"juhu": true},
        boot: "affe"
      };

      var partLoader = new qx.Part(loader);
      qx.Part.$$instance = partLoader;

      var self = this;
      var preloadExecuted = false;
      partLoader.preload(["affe", "juhu"], function(states) {
        self.resume(function() {
          preloadExecuted = true;
          self.assertEquals(self, this, "context wrong");
          self.assertEquals("complete", states[0], "states wrong");
          self.assertEquals("initialized", states[1], "states wrong");
        }, self);
      }, this);

      this.wait();
    },


    testPreloadAndLoadAfterwards : function()
    {
      qx.test.PART_FILES = [];

      var loader = {
        parts : {
          "juhu" : ["p1"],
          "affe" : ["p0"]
        },
        packages : {
          p0 : { uris : ["boot.js"]},
          p1 : { uris : [this.getUrl("qx/test/part/file1-closure.js")]}
        },
        closureParts : {"juhu": true},
        boot: "affe"
      };

      var partLoader = new qx.Part(loader);
      qx.Part.$$instance = partLoader;

      partLoader.preload("juhu");

      var part = partLoader.getParts()["juhu"];

      part.getPackages()[0].loadClosure = function() {
        self.resume(function() {
          self.fail("load called twice!");
        });
      }

      partLoader.require("juhu", function() {
        this.resume(function() {
          this.assertEquals("complete", part.getPackages()[0].getReadyState());
          this.assertEquals("complete", part.getReadyState());

          this.assertEquals(1, qx.test.PART_FILES.length);
          this.assertJsonEquals(["file1-closure"], qx.test.PART_FILES);
        });
      }, this);

      this.wait();
    },


    testRequireState : function()
    {
      qx.test.PART_FILES = [];

      // create a dummy loader
      var loader = {
        parts : {
          "juhu" : ["p1"],
          "affe" : ["p0"],
          "fail" : ["p2"]
        },
        packages : {
          p0 : { uris : ["boot.js"]},
          p1 : { uris : [this.getUrl("qx/test/part/file1-closure.js")]},
          p2 : { uris : ["_fail.js"]}
        },
        closureParts : {"juhu": true, "fail" : true},
        boot: "affe"
      };

      var partLoader = new qx.Part(loader);
      qx.Part.$$instance = partLoader;

      // preload one part
      partLoader.preload("juhu");

      var timeout = qx.Part.TIMEOUT;
      qx.Part.TIMEOUT = 1000;

      // require all three parts and check the ready states
      partLoader.require(["affe", "juhu", "fail"], function(states) {
        this.resume(function() {
          qx.Part.TIMEOUT = timeout;
          this.assertEquals("complete", states[0]);
          this.assertEquals("complete", states[1]);
          this.assertEquals("error", states[2]);
        }, this);
      }, this);

      this.wait();
    }
  }
});
