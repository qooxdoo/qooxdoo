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

qx.Class.define("qx.test.lang.Type",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testIsString : function()
    {
      var Type = qx.lang.Type;
      
      this.assertTrue(Type.isString(""));
      this.assertTrue(Type.isString("Juhu"));
      this.assertTrue(Type.isString(new String("Juhu")));
      this.assertTrue(Type.isString(new qx.locale.LocalizedString("Juhu")));
      this.assertTrue(Type.isString(new qx.type.BaseString("juhu")));
      
      this.assertFalse(Type.isString());
      this.assertFalse(Type.isString(null));
      this.assertFalse(Type.isString(2));
      this.assertFalse(Type.isString({}));
      this.assertFalse(Type.isString([]));
      this.assertFalse(Type.isString(/juhu/));
    },
    
    
    testIsArray : function()
    {
      var Type = qx.lang.Type;
      
      this.assertTrue(Type.isArray([]));
      this.assertTrue(Type.isArray(new Array()));
      this.assertTrue(Type.isArray(new qx.type.BaseArray()));
      this.assertTrue(Type.isArray(new qx.bom.Collection()));
      
      this.assertFalse(Type.isArray());
      this.assertFalse(Type.isArray(""));
      this.assertFalse(Type.isArray(null));
      this.assertFalse(Type.isArray(2));
      this.assertFalse(Type.isArray({}));
      this.assertFalse(Type.isArray(/juhu/));
    },
    
    
    testIsObject : function()
    {
      var Type = qx.lang.Type;
      
      this.assertTrue(Type.isObject({}));
      this.assertTrue(Type.isObject(new Object()));
      this.assertTrue(Type.isObject(new qx.core.Object()));
      
      this.assertFalse(Type.isObject());
      this.assertFalse(Type.isObject(""));
      this.assertFalse(Type.isObject(null));
      this.assertFalse(Type.isObject(2));
      this.assertFalse(Type.isObject([]));    
      this.assertFalse(Type.isObject(/juhu/));    
    }
  }
});