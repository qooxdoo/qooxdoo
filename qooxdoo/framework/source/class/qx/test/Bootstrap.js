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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("qx.test.Bootstrap",
{
  extend : qx.dev.unit.TestCase,

  members :
  {    
    testDefineShadowedMembers : function()
    {
      qx.Bootstrap.define("qx.test.Construct",
      {
        extend: Object,
        members : {
          "isPrototypeOf" : 10,
          "hasOwnProperty" : 11,
          "toLocaleString" : 12,
          "toString" : 13,
          "valueOf" : 14
        }
      });
      
      var obj = new qx.test.Construct();
      this.assertEquals(10, obj.isPrototypeOf);
      this.assertEquals(11, obj.hasOwnProperty);
      this.assertEquals(12, obj.toLocaleString);
      this.assertEquals(13, obj.toString);
      this.assertEquals(14, obj.valueOf);
    },
    
    
    testDefineShadowedStatics : function()
    {
      qx.Bootstrap.define("qx.test.Construct",
      {
        extend: Object,
        statics : {
          "isPrototypeOf" : 10,
          "toLocaleString" : 12,
          "toString" : 13,
          "valueOf" : 14
        }
      });
      
      this.assertEquals(10, qx.test.Construct.isPrototypeOf);
      this.assertEquals(12, qx.test.Construct.toLocaleString);
      this.assertEquals(13, qx.test.Construct.toString);
      this.assertEquals(14, qx.test.Construct.valueOf);
    }
  }
});
