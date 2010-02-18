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
    
    setUp : function() {
      qx.test.PART_FILES = [];
      this.__dummyLoader = {uris: []};
    },
    
    
    tearDown : function() {
      qx.Part.$$instance = null;
    },
  
    
    "test: load part with one package" : function()
    {
      var loader = new qx.Part(this.__dummyLoader);
      qx.Part.$$instance = loader;
  
      var pkg = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file1-closure.js")], "file1-closure"
      );
      var part = new qx.io.part.ClosurePart("juhu", [pkg], loader);
      
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
      var loader = new qx.Part(this.__dummyLoader);
      qx.Part.$$instance = loader;
  
      var pkg1 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file1-closure.js")], "file1-closure"
      );
      var pkg2 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file2-closure.js")], "file2-closure"
      );
      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2], loader);
      
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
    
    
    "test: load part with two packages and one already loaded" : function() 
    {
      var loader = new qx.Part(this.__dummyLoader);
      qx.Part.$$instance = loader;
  
      var pkg1 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file1-closure.js")], "file1-closure"
      );
      var pkg2 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file2-closure.js")], "file2-closure"
      );
      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2], loader);
      
      pkg2.load(loader.notifyPackageResult, loader);
      
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
    
    
    "test: load part with two packages and all already loaded" : function() 
    {
      var loader = new qx.Part(this.__dummyLoader);
      qx.Part.$$instance = loader;
  
      var pkg1 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file1-closure.js")], "file1-closure"
      );
      var pkg2 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file2-closure.js")], "file2-closure"
      );
      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2], loader);
      
      pkg1.load(loader.notifyPackageResult, loader);
      pkg2.load(loader.notifyPackageResult, loader);
      
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
    
    
    "test: load part with three packages and delay" : function() 
    {
      var loader = new qx.Part(this.__dummyLoader);
      qx.Part.$$instance = loader;
  
      var pkg1 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/delay.php") + "?sleep=0.3&file=file1-closure.js"], 
        "file1-closure"
      );
      var pkg2 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file2-closure.js")], "file2-closure"
      );
      var pkg3 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/delay.php") + "?sleep=0.2&file=file3-closure.js"], 
        "file3-closure"
      );
      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2, pkg3], loader);
      
      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertJsonEquals(
          ["file1-closure", "file2-closure", "file3-closure"],
          qx.test.PART_FILES
        );
      })});
      
      this.wait();      
    },
    
    
    
    "test: load part with two packages and delay first part" : function() 
    {
      if (this.isLocal()) {
        this.needsPHPWarning();
        return;
      }
      
      var loader = new qx.Part(this.__dummyLoader);
      qx.Part.$$instance = loader;
  
      var pkg1 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/delay.php") + "?sleep=0.3&file=file1-closure.js"], 
        "file1-closure"
      );
      var pkg2 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file2-closure.js")], "file2-closure"
      );
      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2], loader);
      
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
    
    
    "test: load part with two packages with an error in the first part" : function() {
      var loader = new qx.Part(this.__dummyLoader);
      qx.Part.$$instance = loader;
  
      var pkg1 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file211-closure.js")], "file2-closure"
      );
      var pkg2 = new qx.io.part.Package(
        [this.getUrl("qx/test/part/file2-closure.js")], "file2-closure"
      );
      var part = new qx.io.part.ClosurePart("juhu", [pkg1, pkg2], loader);
      
      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertEquals("error", readyState);
        self.assertJsonEquals([], qx.test.PART_FILES);
      })});
      
      this.wait();      
    }
  }
});