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
    "test: loader structure parsing" : function()
    {
      var loader = {
        parts : {
          "juhu" : [0, 1],
          "kinners" : [0, 2]
        },
        uris : [
          ["1.js"],
          ["2.js"],
          ["3.1.js", "3.2.js"]
        ],
        closureParts : {"juhu": true},
        packageHashes : {"0":"0","1":"1","2":"2"},
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
      var pkg2 = packages[1];
      this.assertJsonEquals(
        ["3.1.js", "3.2.js"],
        pkg2.getUrls()
      );
    },
    
    
    "test: preload a part should load the packages but not eval them" : function()
    {
      qx.test.PART_FILES = [];
      
      var loader = {
        parts : {
          "juhu" : [1]
        },
        uris : [
          ["boot.js"], [this.getUrl("qx/test/part/file1-closure.js")]
        ],
        closureParts : {"juhu": true},
        packageHashes : {"1": "file1-closure"}
      };
      
      var partLoader = new qx.Part(loader);
      qx.Part.$$instance = partLoader;
      
      var self = this;
      partLoader.onpart = function(part) {
        self.resume(function() {
          self.assertEquals("complete", part.getPackages()[0].getReadyState());
          self.assertEquals("cached", part.getReadyState());
          self.assertEquals(0, qx.test.PART_FILES.length);
          var closures = partLoader.getClosures();
          self.assertEquals(1, qx.lang.Object.getLength(closures));
          self.assertFunction(closures["file1-closure"]);
          
          // execute closure to check if it is the correct one
          closures["file1-closure"]();
          self.assertJsonEquals(["file1-closure"], qx.test.PART_FILES);          
        });
      }
      
      partLoader.preload("juhu");
      this.wait();
    }
  }
});