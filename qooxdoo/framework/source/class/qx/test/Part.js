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

qx.Class.define("qx.test.Part",
{
  extend : qx.dev.unit.TestCase,
  include : qx.test.io.MRemoteTest,

  members :
  {
    setUp : function()
    {
      qx.test.PART_FILES = [];
      qx.test.Part.LOAD_ORDER = [];
      this.__loader = new qx.Part();
    },
    
    
    tearDown : function()
    {
      this.__loader = null;
    },
  
    
    "test: load a package with one JS file" : function()
    {
      var urls = [
        this.getUrl("qx/test/part/file1.js")
      ]
      var pkg = this.__loader.createPackage(urls, "1", false);
      this.assertEquals("initialized", pkg.readyState);

      this.__loader.loadPackage(pkg);      
      this.assertEquals("loading", pkg.readyState);
      
      var self = this;
      this.__loader.addPackageListener(pkg, function() { self.resume(function() {
        self.assertEquals("complete", pkg.readyState);
        self.assertEquals("file1", qx.test.PART_FILES[0]);
      })});
      
      this.wait();
    },
    
    
    "test: load several files" : function()
    {
      var urls = [
        this.getUrl("qx/test/part/file1.js"),
        this.getUrl("qx/test/part/file2.js"),
        this.getUrl("qx/test/part/file3.js")
      ];

      var pkg = this.__loader.createPackage(urls, "1", false);
      this.__loader.loadPackage(pkg);      
      
      var self = this;
      this.__loader.addPackageListener(pkg, function() { self.resume(function()
      {
        self.assertJsonEquals(
          ["file1", "file2", "file3"],
          qx.test.PART_FILES
        );
      })});
      
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

      var pkg = this.__loader.createPackage(urls, "1", false);
      this.__loader.loadPackage(pkg);
      
      var self = this;
      this.__loader.addPackageListener(pkg, function() { self.resume(function()
      {
        self.assertJsonEquals(
          ["file1", "file2", "file3"],
          qx.test.PART_FILES
        );
      })});
      
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

      var pkg = this.__loader.createPackage(urls, "1", false);
      this.__loader.loadPackage(pkg);      
      
      var self = this;
      this.__loader.addPackageListener(pkg, function(status) { self.resume(function() {
        self.assertEquals("error", status);
      })});

      this.wait();      
    },
    
    
    mockPackageLoading : function()
    {
      this.__loader.loadPackage = function(pkg)
      {
        var self = this;
        pkg.readyState = "loading";
        setTimeout(function()
        {
          if (pkg.error) {
            pkg.readyState = "error";            
          } else {
            qx.test.Part.LOAD_ORDER.push(pkg.id);
            pkg.readyState = "complete";
          }
          self._notifyPackageResult(pkg);
        }, pkg.delay);
      } 
    },
    
    
    createMockPackage : function(id, delay, error, readyState) {
      return {
        id: id,
        delay: delay || 0,
        error: !!error,
        readyState: readyState || "initialized"
      };
    },
    
    
    "test: load part with one package" : function()
    {
      this.mockPackageLoading();
      
      var pkg = this.createMockPackage("1");
      var part = this.__loader.createPart("1", [pkg]);
      this.assertEquals("initialized", part.readyState);

      var self = this;
      this.__loader.loadPart(part, function(readyState) { self.resume(function()
      {
        self.assertEquals("complete", readyState);      
        self.assertEquals("complete", part.readyState);      
      })});
      
      this.assertEquals("loading", part.readyState);      
      this.wait();
    },
    
    
    "test: load part with several packages" : function()
    {
      this.mockPackageLoading();
      
      var packages = [
        this.createMockPackage("a"),
        this.createMockPackage("b"),
        this.createMockPackage("c")
      ];
      
      var part = this.__loader.createPart("1", packages);
      var self = this;
      this.__loader.loadPart(part, function(readyState) { self.resume(function()
      {
        self.assertJsonEquals(
          ["a", "b", "c"],
          qx.test.Part.LOAD_ORDER
        );
      })});
        
      this.wait();      
    },
    
    
    "test: delay loading of second package should preserve order" : function()
    {
      this.mockPackageLoading();
      
      var packages = [
        this.createMockPackage("a"),
        this.createMockPackage("b", 100),
        this.createMockPackage("c")
      ];
      
      var part = this.__loader.createPart("1", packages);
      var self = this;
      this.__loader.loadPart(part, function(readyState) { self.resume(function()
      {
        self.assertJsonEquals(
          ["a", "b", "c"],
          qx.test.Part.LOAD_ORDER
        );
      })});
        
      this.wait();        
    },

    
    "test: one already loaded package should not be loaded again and preserve order" : function()
    {
      this.mockPackageLoading();
      
      var packages = [
        this.createMockPackage("a", 0, false, "complete"),
        this.createMockPackage("b"),
        this.createMockPackage("c")
      ];
     
      // fail if it is loaded again
      var self = this;
      var oldLoadPackage = this.__loader.loadPackage;
      this.__loader.loadPackage = function(pkg) 
      {
        if (pkg == packages[0]) {
          self.fail();
        } else {
          oldLoadPackage.call(this, pkg);
        }
      }
      
      var part = this.__loader.createPart("1", packages);
      var self = this;
      this.__loader.loadPart(part, function(readyState) { self.resume(function()
        {
          self.assertJsonEquals(
            ["b", "c"], // a is already loaded
            qx.test.Part.LOAD_ORDER
          );
      })});
      
      this.wait();        
    },
    
    
    "test: a currently loading package should not be loaded again and should preserve order" : function()
    {
      this.mockPackageLoading();
      
      var packages = [
        this.createMockPackage("a", 0, false, "complete"),
        this.createMockPackage("b"),
        this.createMockPackage("c")
      ];
      
      this.__loader.loadPackage(packages[1]); // now in loading state
     
      var part = this.__loader.createPart("1", packages);
      var self = this;
      this.__loader.loadPart(part, function(readyState) { self.resume(function()
      {
        self.assertJsonEquals(
          ["b", "c"], // a has already been loaded
          qx.test.Part.LOAD_ORDER
        );
      })});
        
      this.wait();        
    },
    
    
    
    "test: error loading second package should set 'error' status on callback" : function()
    {
      this.mockPackageLoading();
      
      var packages = [
        this.createMockPackage("a"),
        this.createMockPackage("b", 0, true),
        this.createMockPackage("c")
      ];
      
      var part = this.__loader.createPart("1", packages);
      
      var self = this;
      this.__loader.loadPart(part, function(readyState) { self.resume(function() {
        this.assertEquals("error", readyState);        
        this.assertEquals("error", part.readyState);        
      })}); 
        
      this.wait();      
    },
    
    
    "test: loading a loaded part again should not reload the packages" : function()
    {
      this.mockPackageLoading();
      
      var packages = [
        this.createMockPackage("a"),
        this.createMockPackage("b"),
        this.createMockPackage("c")
      ];
      
      
      var part = this.__loader.createPart("1", packages);

      var self = this;
      this.__loader.loadPart(part, function(readyState)
      {
        self.__loader.loadPackage = function() {
          self.fail();
        }
        
        self.__loader.loadPart(part, function(readyState) { self.resume( function() {
          this.assertEquals("complete", readyState);
        })});
      });
        
      this.wait();              
    },
    
    
    "test: loading an error part again should not reload the packages" : function()
    {
      this.mockPackageLoading();
      
      var packages = [
        this.createMockPackage("a"),
        this.createMockPackage("b", 0, true),
        this.createMockPackage("c")
      ];
      
      
      var part = this.__loader.createPart("1", packages);
      
      var self = this;
      this.__loader.loadPart(part, function(readyState)
      {
        self.__loader.loadPackage = function() {
          self.fail();
        }

        self.__loader.loadPart(part, function(readyState) { self.resume( function() {
          self.assertEquals("error", readyState);
        })});
      });
      
      this.wait();              
    }    
  }
});