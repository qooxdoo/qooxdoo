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
    setUp : function() {
      qx.test.PART_FILES = [];
    },
  
    
    "test: load part with one package" : function()
    {
      var loader = new qx.Part(qx.$$loader);
  
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
      var loader = new qx.Part(qx.$$loader);
  
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
    }
  }
});