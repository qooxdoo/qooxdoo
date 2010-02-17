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
    }
  }
});