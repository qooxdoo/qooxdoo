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

qx.Class.define("qx.test.type.BaseString",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testStringExtend : function()
    {
      qx.Class.define("qx.String",
      {
        extend : qx.type.BaseString,

        members :
        {
          bold : function() {
            //console.log("bold", this);
            return "<b>" + this.toString() + "</b>";
          },

          setText : function(txt) {
            this.setValue(txt);
          }
        }
      });

      var s = new qx.String("Juhu");
      this.assertEquals("<b>Juhu</b>", s.bold());
      this.assertEquals("JUHU", s.toUpperCase());
      this.assertEquals(1, s.indexOf("u"));
      this.assertEquals("__Juhu__", ["__", s + "__"].join(""));
      this.assertEquals(4, s.length);


      s.setText("Kinners");
      this.assertEquals("Kinners", s);
    }


/*
 TODO: Add test for these functions:
   toString ( )
   valueOf ( )
   charAt (pos)
   charCodeAt (pos)
   concat ( [ string1 [ , string2 [ , … ] ] ] )
   indexOf (searchString, position)
   lastIndexOf (searchString, position)
   localeCompare (that)
   replace (searchValue, replaceValue)
   search (regexp)
   substring (start, end)
   toLowerCase ( )
   toLocaleLowerCase ( )
   toUpperCase ( )
   toLocaleUpperCase ( )

  TODO: Add test for this property:
    length

*/




  }
});
