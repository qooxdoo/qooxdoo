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

************************************************************************ */

qx.Class.define("qx.test.io.part.ClosurePart",
{
  extend : qx.dev.unit.TestCase,
  include : qx.test.io.MRemoteTest,

  members :
  {
    __dummyLoader : null,
    
    setUp : function()
    {
      qx.test.PART_FILES = [];
      qx.test.Part.LOAD_ORDER = [];
      this.__dummyLoader = {uris: []};
      
      this.__loader = new qx.Part(this.__dummyLoader);
      qx.Part.$$instance = this.__loader;
    },
    
    
    tearDown : function() {
      qx.Part.$$instance = null;
    },

    
    "test: load part with one package" : function()
    {
      var pkg = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file1-closure.js")], "file1-closure"
      );
      var part = new qx.io.part.ClosurePart("juhu", [pkg], this.__loader);
      
      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertJsonEquals(
          ["file1-closure"],
          qx.test.PART_FILES
        );
      })});
      
      this.wait();
    },
    
    
    "test: load part with two packages" : function() 
    {
      var pkg1 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file1-closure.js")], "file1-closure"
      );
      var pkg2 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file2-closure.js")], "file2-closure"
      );
      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2], this.__loader);
      
      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertJsonEquals(
          ["file1-closure", "file2-closure"],
          qx.test.PART_FILES
        );
      })});
      
      this.wait();      
    },
    
    
    "test: load part with two packages and one already loading" : function() 
    {
      var pkg1 = new qx.test.io.part.MockPackage("file1-closure", null, null, null, true); 
      var pkg2 = new qx.test.io.part.MockPackage("file2-closure", null, null, null, true); 
      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2], this.__loader);
      
      pkg2.load(this.__loader.notifyPackageResult, this.__loader);
      
      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertJsonEquals(
          ["file1-closure", "file2-closure"],
          qx.test.Part.LOAD_ORDER
        );
      })});
      
      this.wait();      
    },
    
    
    "test: load part with two packages and both already loading" : function() 
    {
      var pkg1 = new qx.test.io.part.MockPackage("file1-closure", null, null, null, true); 
      var pkg2 = new qx.test.io.part.MockPackage("file2-closure", null, null, null, true); 

      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2], this.__loader);
      
      pkg1.load(this.__loader.notifyPackageResult, this.__loader);
      pkg2.load(this.__loader.notifyPackageResult, this.__loader);
      
      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertJsonEquals(
          ["file1-closure", "file2-closure"],
          qx.test.Part.LOAD_ORDER
        );
      })});
      
      this.wait();      
    },
    
    
    "test: load part with three packages and delay" : function() 
    {
      var pkg1 = new qx.test.io.part.MockPackage("file1-closure", 200, null, null, true); 
      var pkg2 = new qx.test.io.part.MockPackage("file2-closure", null, null, null, true); 
      var pkg3 = new qx.test.io.part.MockPackage("file3-closure", 100, null, null, true); 
      
      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2, pkg3], this.__loader);
      
      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertJsonEquals(
          ["file1-closure", "file2-closure", "file3-closure"],
          qx.test.Part.LOAD_ORDER
        );
      })});
      
      this.wait();      
    },
    
    
    
    "test: load part with two packages and delay first part" : function() 
    {
      var pkg1 = new qx.test.io.part.MockPackage("file1-closure", 100, null, null, true); 
      var pkg2 = new qx.test.io.part.MockPackage("file2-closure", null, null, null, true); 
      
      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2], this.__loader);
      
      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertJsonEquals(
          ["file1-closure", "file2-closure"],
          qx.test.Part.LOAD_ORDER
        );
      })});
      
      this.wait();      
    },
    
    
    "test: load part with two packages with an error in the first part" : function() 
    {
      var pkg1 = new qx.test.io.part.MockPackage("file211-closure", null, true, null, true); 
      var pkg2 = new qx.test.io.part.MockPackage("file2-closure", null, null, null, true); 

      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2], this.__loader);
      
      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertEquals("error", readyState);
        self.assertJsonEquals([], qx.test.Part.LOAD_ORDER);
      })});
      
      this.wait();      
    },
    
    
    "test: load part with a loaded package should not reload the package again" : function()
    {
      var pkg1 = new qx.test.io.part.MockPackage("file1-closure", null, null, "complete", true); 
      var part = new qx.io.part.ClosurePart("juhu", [pkg1], this.__loader);
      
      var self = this;
      
      pkg1.load = function() {
        self.resume(function() {
          self.fail();
        });
      };
      
      part.load(function(readyState) { self.resume(function() {
        self.assertEquals("complete", readyState);
      })});
      
      this.wait();       
    }
  }
});