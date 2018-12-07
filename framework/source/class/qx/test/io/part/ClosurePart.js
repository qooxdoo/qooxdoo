/* ************************************************************************

qooxdoo - the new era of web development

http://qooxdoo.org

Copyright:
  2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

License:
     MIT: https://opensource.org/licenses/MIT
  See the LICENSE file in the project's top-level directory for details.

Authors:
  * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************


************************************************************************ */
/**
 * @ignore(qx.test.PART_FILES)
 *
 * @asset(qx/test/*)
 */

qx.Class.define("qx.test.io.part.ClosurePart",
{
  extend : qx.dev.unit.TestCase,
  include : qx.test.io.MRemoteTest,

  members :
  {
    __dummyLoader : null,
    __timeout : null,
    __loader : null,

    setUp : function()
    {
      qx.test.PART_FILES = [];
      qx.test.Part.LOAD_ORDER = [];
      this.__dummyLoader = new qx.test.io.part.MockLoader();

      this.__loader = new qx.Part(this.__dummyLoader);
      qx.Part.$$instance = this.__loader;
      this.__timeout = qx.Part.TIMEOUT;
      qx.Part.TIMEOUT = 3000;
    },


    tearDown : function() {
      qx.Part.$$instance = undefined;
      qx.Part.TIMEOUT = this.__timeout;
    },


    loadPackage : function(part, pkg)
    {
      pkg.loadClosure(this.__loader.notifyPackageResult, this.__loader);
    },


    "test: load part with one package" : function()
    {
      var pkg = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file1-closure.js")], "p1"
      );
      var part = new qx.io.part.ClosurePart("juhu", [pkg], this.__loader);

      this.__loader.addToPackage(pkg);

      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertEquals("complete", readyState);
        self.assertJsonEquals(
          ["file1-closure"],
          qx.test.PART_FILES
        );
      });});

      this.wait();
    },


    "test: load part with two packages" : function()
    {
      var pkg1 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file1-closure.js")], "p1"
      );
      var pkg2 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file2-closure.js")], "p2"
      );
      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2], this.__loader);

      this.__loader.addToPackage(pkg1);
      this.__loader.addToPackage(pkg2);

      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertJsonEquals(
          ["file1-closure", "file2-closure"],
          qx.test.PART_FILES
        );
      });});

      this.wait();
    },


    "test: load part with two packages and one already loading" : function()
    {
      var pkg1 = new qx.test.io.part.MockPackage("p1", null, null, null, true);
      var pkg2 = new qx.test.io.part.MockPackage("p2", null, null, null, true);
      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2], this.__loader);

      this.__loader.addToPackage(pkg1);
      this.__loader.addToPackage(pkg2);

      this.loadPackage(part, pkg2);

      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertJsonEquals(
          ["p1", "p2"],
          qx.test.Part.LOAD_ORDER
        );
      });});

      this.wait();
    },


    "test: load part with two packages and both already loading" : function()
    {
      var pkg1 = new qx.test.io.part.MockPackage("p1", null, null, null, true);
      var pkg2 = new qx.test.io.part.MockPackage("p2", null, null, null, true);

      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2], this.__loader);

      this.__loader.addToPackage(pkg1);
      this.__loader.addToPackage(pkg2);

      this.loadPackage(part, pkg1);
      this.loadPackage(part, pkg2);

      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertJsonEquals(
          ["p1", "p2"],
          qx.test.Part.LOAD_ORDER
        );
      });});

      this.wait();
    },


    "test: load part with three packages and delay" : function()
    {
      var pkg1 = new qx.test.io.part.MockPackage("p1", 200, null, null, true);
      var pkg2 = new qx.test.io.part.MockPackage("p2", null, null, null, true);
      var pkg3 = new qx.test.io.part.MockPackage("p3", 100, null, null, true);

      this.__loader.addToPackage(pkg1);
      this.__loader.addToPackage(pkg2);
      this.__loader.addToPackage(pkg3);

      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2, pkg3], this.__loader);

      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertJsonEquals(
          ["p1", "p2", "p3"],
          qx.test.Part.LOAD_ORDER
        );
      });});

      this.wait();
    },



    "test: load part with two packages and delay first part" : function()
    {
      if (this.isLocal()) {
        this.needsPHPWarning();
        return;
      }
      var pkg1 = new qx.test.io.part.MockPackage("p1", 100, null, null, true);
      var pkg2 = new qx.test.io.part.MockPackage("p2", null, null, null, true);

      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2], this.__loader);

      this.__loader.addToPackage(pkg1);
      this.__loader.addToPackage(pkg2);

      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertJsonEquals(
          ["p1", "p2"],
          qx.test.Part.LOAD_ORDER
        );
      });});

      this.wait();
    },


    "test: load part with an error package" : function()
    {
      var pkg1 = new qx.test.io.part.MockPackage("file211-closure", null, true, null, true);

      var part = new qx.io.part.ClosurePart("juhu", [pkg1], this.__loader);

      this.__loader.addToPackage(pkg1);

      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertEquals("error", readyState);
        self.assertJsonEquals([], qx.test.Part.LOAD_ORDER);
      });});

      this.wait();
    },


    "test: load part with a loaded package should not reload the package again" : function()
    {
      var pkg1 = new qx.test.io.part.MockPackage("p1", null, null, "complete", true);
      var part = new qx.io.part.ClosurePart("juhu", [pkg1], this.__loader);

      var self = this;

      pkg1.load = function() {
        self.resume(function() {
          self.fail();
        });
      };

      part.load(function(readyState) { self.resume(function() {
        self.assertEquals("complete", readyState);
      });});
      this.wait();
    },


    "test: load a part with preloaded package" : function()
    {
      var pkg = new qx.test.io.part.MockPackage("p1", null, null, null, true);
      var part = new qx.io.part.ClosurePart("juhu", [pkg], this.__loader);

      this.__loader.addToPackage(pkg);

      var self = this;

      setTimeout(function()
      {
        part.load(function(readyState) { self.resume(function()
        {
          self.assertEquals("complete", readyState);
          self.assertJsonEquals(
            ["p1"],
            qx.test.Part.LOAD_ORDER
          );
        });});
      }, 100);

      part.preload();

      pkg.loadClosure = function() {
        self.resume(function() {
          self.fail("load called twice!");
        });
      };

      this.wait();
    }
  }
});
