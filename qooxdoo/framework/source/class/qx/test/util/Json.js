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

qx.Class.define("qx.test.util.Json",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testStringifyJson : function() {
      this.assertEquals('{"test":123}', qx.util.Json.stringify({ test : 123 }, false));
    },


    testStringifyDate : function()
    {
      var data = {
        start: new Date(0)
      }
      this.assertEquals('{"start":new Date(Date.UTC(1970,0,1,0,0,0,0))}', qx.util.Json.stringify(data, false));
    },


    testCustomDateSerializer : function()
    {
      var start = new Date(0);
      start.toJSON = function(key) {
        return this.getTime();
      }
      this.assertEquals('0', qx.util.Json.stringify(start, false));
    },


    testToJson : function()
    {
      var custom = {
        toJSON : function(key) {
          return "#" + key + "#";
        }
      }
      this.assertEquals('"##"', qx.util.Json.stringify(custom, false));
      this.assertEquals('{"juhu":"#juhu#"}', qx.util.Json.stringify({ juhu : custom }, false));
    }
  }
});
