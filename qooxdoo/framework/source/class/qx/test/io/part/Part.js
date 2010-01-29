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

qx.Class.define("qx.test.io.part.Part",
{
  extend : qx.dev.unit.TestCase,
  include : qx.test.io.MRemoteTest,

  members :
  {
    setUp : function() {
      qx.test.io.part.MockPackage.LOAD_ORDER = [];
    },
  
    "test: load part with one package" : function()
    {
      var pkg = new qx.test.io.part.MockPackage();
      var part = new qx.io.part.Part("1", [pkg]);
      this.assertEquals("initialized", part.getReadyState());

      part.load(function(readyState) { this.resume(function()
      {
        this.assertEquals("complete", readyState);      
        this.assertEquals("complete", part.getReadyState());      
        part.dispose();
      }, this)}, this);
      
      this.assertEquals("loading", part.getReadyState());      
      this.wait();
    },
    
    
    "test: load part with several packages" : function()
    {
      var packages = [
        new qx.test.io.part.MockPackage("a"),
        new qx.test.io.part.MockPackage("b"),
        new qx.test.io.part.MockPackage("c")
      ];
      
      var part = new qx.io.part.Part("1", packages);
      part.load(function() { 
      this.resume(function()
      {
        this.assertJsonEquals(
          ["a", "b", "c"],
          qx.test.io.part.MockPackage.LOAD_ORDER
        );
        part.dispose();
      }, this)}, this);
        
      this.wait();      
    },
    
    
    "test: delay loading of second package should preserve order" : function()
    {
      var packages = [
        new qx.test.io.part.MockPackage("a"),
        new qx.test.io.part.MockPackage("b").set({delay: 100}),
        new qx.test.io.part.MockPackage("c")
      ];
      
      var part = new qx.io.part.Part("1", packages);
      part.load(function() { 
      this.resume(function()
      {
        this.assertJsonEquals(
          ["a", "b", "c"],
          qx.test.io.part.MockPackage.LOAD_ORDER
        );
        part.dispose();
      }, this)}, this);
        
      this.wait();        
    },

    
    "test: one already loaded package should not be loaded again and preserve order" : function()
    {
      var packages = [
        new qx.test.io.part.MockPackage("a").set({readyState: "complete"}),
        new qx.test.io.part.MockPackage("b"),
        new qx.test.io.part.MockPackage("c")
      ];
     
      // fail if it is loaded again
      var self = this;
      packages[0].load = function() {
        self.fail();
      }
      
      var part = new qx.io.part.Part("1", packages);
      part.load(function() { 
        this.resume(function()
        {
          this.assertJsonEquals(
            ["b", "c"], // a is already loaded
            qx.test.io.part.MockPackage.LOAD_ORDER
          );
          part.dispose();
      }, this)}, this);
      
      this.wait();        
    },
    
    
    "test: a currently loading package should not be loaded again and should preserve order" : function()
    {
      var packages = [
        new qx.test.io.part.MockPackage("a").set({readyState: "complete"}),
        new qx.test.io.part.MockPackage("b"),
        new qx.test.io.part.MockPackage("c")
      ];
      
      packages[1].load(); // now in loading state

      // fail if it is loaded again
      var self = this;
      packages[0].load = function() {
        self.fail();
      }
      
      var part = new qx.io.part.Part("1", packages);
      part.load(function() { 
      this.resume(function()
      {
        this.assertJsonEquals(
          ["b", "c"], // a has already been loaded
          qx.test.io.part.MockPackage.LOAD_ORDER
        );
        part.dispose();
      }, this)}, this);
        
      this.wait();        
    },
    
    
    
    "test: error loading second package should fire error event" : function()
    {
      var packages = [
        new qx.test.io.part.MockPackage("a"),
        new qx.test.io.part.MockPackage("b").set({error: true}),
        new qx.test.io.part.MockPackage("c")
      ];
      
      var part = new qx.io.part.Part("1", packages);
      part.load();
      
      part.addListener("load", function() { 
        this.fail();
      }, this);
        
      part.addListener("error", function() { 
      this.resume(function()
      {
        this.assertEquals("error", part.getReadyState());
        part.dispose();
      }, this)}, this);
        
      this.wait();      
    },
    
    
    "test: error loading second package should set 'error' status on callback" : function()
    {
      var packages = [
        new qx.test.io.part.MockPackage("a"),
        new qx.test.io.part.MockPackage("b").set({error: true}),
        new qx.test.io.part.MockPackage("c")
      ];
      
      var part = new qx.io.part.Part("1", packages);
      part.load();
      
      part.load(function(readyState) { this.resume(function()
      {
        this.assertEquals("error", readyState);
        this.assertJsonEquals(
          ["a"],
          qx.test.io.part.MockPackage.LOAD_ORDER
        );
        part.dispose();
      }, this)}, this);
        
      this.wait();      
    },
    
    
    "test: loading a loaded part again should not reload the packages" : function()
    {
      var packages = [
        new qx.test.io.part.MockPackage("a"),
        new qx.test.io.part.MockPackage("b"),
        new qx.test.io.part.MockPackage("c")
      ];
      
      
      var part = new qx.io.part.Part("1", packages);
      part.load(function()
      {
        var self = this;
        for (var i=0; i<packages.length; i++)
        {
          // fail if it is loaded again
          packages[i].load = function() {
            self.fail();
          }
        }
        part.load(function(readyState) { this.resume( function() {
          this.assertEquals("complete", readyState);
        }, this)}, this);
      }, this);
        
      this.wait();              
    },
    
    
    "test: loading an error part again should not reload the packages" : function()
    {
      var packages = [
        new qx.test.io.part.MockPackage("a"),
        new qx.test.io.part.MockPackage("b").set({error: true}),
        new qx.test.io.part.MockPackage("c")
      ];
      
      
      var part = new qx.io.part.Part("1", packages);
      part.load(function()
      {
        var self = this;
        for (var i=0; i<packages.length; i++)
        {
          // fail if it is loaded again
          packages[i].load = function() {
            self.fail();
          }
        }
        part.load(function(readyState) { this.resume( function() {
          this.assertEquals("error", readyState);
        }, this)}, this);
      }, this);
      
      this.wait();              
    }
  }
});