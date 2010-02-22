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
    },
    
    
    tearDown : function() {
      qx.Part.$$instance = null;
    },

    
    "test: if the number of pakeages is != 1 an exception should be thrown" : function()
    {      
      this.assertException(function() {
        var part = new qx.io.part.ClosurePart("juhu", [], {});
      }, TypeError);

      this.assertException(function() {
        var part = new qx.io.part.ClosurePart("juhu", [
          new qx.test.io.part.MockPackage("a"),
          new qx.test.io.part.MockPackage("b")          
        ], {});
      }, TypeError);
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
    
    
    "test: load part with an already loading package" : function() 
    {
      var loader = new qx.Part(this.__dummyLoader);
      qx.Part.$$instance = loader;
  
      var pkg1 = new qx.test.io.part.MockPackage("file1-closure", null, null, null, true);
      var part = new qx.io.part.ClosurePart("juhu", [pkg1], loader);
      
      pkg1.load(loader.notifyPackageResult, loader);
      
      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertJsonEquals(
          ["file1-closure"],
          qx.test.Part.LOAD_ORDER
        );
      })});
      
      this.wait();      
    },
    
    
    "test: load part with an error in the package" : function()
    {
      var loader = new qx.Part(this.__dummyLoader);
      qx.Part.$$instance = loader;
       
      var pkg1 = new qx.test.io.part.MockPackage("file21-closure", null, true, null, true);
      var part = new qx.io.part.ClosurePart("juhu", [pkg1], loader);
      
      var self = this;
      part.load(function(readyState) { self.resume(function()
      {
        self.assertEquals("error", readyState);
        self.assertJsonEquals([], qx.test.Part.LOAD_ORDER);
      })});
      
      this.wait();      
    }
  }
});