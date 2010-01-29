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

qx.Class.define("qx.test.io.part.Package",
{
  extend : qx.dev.unit.TestCase,
  include : qx.test.io.MRemoteTest,

  members :
  {
    setUp : function() {
      qx.test.io.ScriptLoader.FILES = [];
    },
  
    
    "test: load a package with one JS file" : function()
    {
      var urls = [
        this.getUrl("qx/test/part/file1.js")
      ]
      var pkg = new qx.test.io.part.TestingPackage(urls, "1", false);
      this.assertEquals("initialized", pkg.getReadyState());

      pkg.load();      
      this.assertEquals("loading", pkg.getReadyState());
      
      pkg.addListener("load", function(e) { this.resume(function() {
        this.assertEquals("complete", pkg.getReadyState());
        this.assertEquals("file1", qx.test.io.ScriptLoader.FILES[0]);
        
        pkg.dispose();
      }, this)}, this);
      
      this.wait();
    },
    
    
    "test: load several files" : function()
    {
      var urls = [
        this.getUrl("qx/test/part/file1.js"),
        this.getUrl("qx/test/part/file2.js"),
        this.getUrl("qx/test/part/file3.js")
      ];

      var pkg = new qx.test.io.part.TestingPackage(urls, "1", false);
      pkg.load();      
      
      pkg.addListener("load", function(e) { this.resume(function() {
        this.assertJsonEquals(
          ["file1", "file2", "file3"],
          qx.test.io.ScriptLoader.FILES
        );
        pkg.dispose();
      }, this)}, this);
      
      this.wait();
    },
    
    
    "test: delay the first file - test load order" : function()
    {
      if (this.isLocal()) {
        this.needsPHPWarning();
        return;
      }
      
      var urls = [
        this.getUrl("qx/test/part/delay.php") + "?sleep=0.3&file=file1.js",
        this.getUrl("qx/test/part/file2.js"),
        this.getUrl("qx/test/part/file3.js")
      ];

      var pkg = new qx.test.io.part.TestingPackage(urls, "1", false);
      pkg.load();
      
      pkg.addListener("load", function(e) { this.resume(function() {
        this.assertJsonEquals(
          ["file1", "file2", "file3"],
          qx.test.io.ScriptLoader.FILES
        );
        pkg.dispose();
      }, this)}, this);
      
      this.wait();
    },
    
    
    "test: if one of the files fails to load, no load event should be fired" : function()
    {
      if (this.isLocal()) {
        this.needsPHPWarning();
        return;
      }
      
      var urls = [
        this.getUrl("qx/test/part/file1.js"),
        this.getUrl("qx/test/xmlhttp/404.php"),
        this.getUrl("qx/test/part/file3.js")
      ];

      var pkg = new qx.test.io.part.TestingPackage(urls, "1", false);
      pkg.load();      
      
      pkg.addListener("load", function(e) { this.resume(function() {
        this.fail();
      }, this)}, this);

      pkg.addListener("error", function(e) { this.resume(function() {
        this.assertEquals("error", pkg.getReadyState());
        this.assertJsonEquals(
          [],
          qx.test.io.ScriptLoader.FILES
        );
        pkg.dispose();
      }, this)}, this);

      this.wait();      
    }  
  }
});