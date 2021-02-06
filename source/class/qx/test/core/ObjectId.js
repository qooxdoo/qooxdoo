/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Zenesis Limited, http://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)

************************************************************************ */

/**
 * @ignore(demo.MyClass)
 */
qx.Class.define("qx.test.core.ObjectId", {
  extend: qx.dev.unit.TestCase,
  include: qx.dev.unit.MMock,

  members: {
    testGetObject: function() {
      var clazz = qx.Class.define("demo.MyClass", {
        extend: qx.core.Object,
        members: {
          _createQxObjectImpl: function(id) {
            switch(id) {
            case "txt":
              return new qx.ui.form.TextField();
            }
            return this.base(arguments, id);
          }
        }
      });
      
      var obj = new demo.MyClass();
      var Id = qx.core.Id.getInstance();
      Id.register(obj, "test");
      var txt = obj.getQxObject("txt");
      this.assertTrue(txt === obj.getQxObject("txt"));
      this.assertTrue(txt.getQxObjectId() === "txt");
      this.assertTrue(Id.getQxObject("test") === obj);
      this.assertTrue(Id.getQxObject("test/txt") === txt);
      
      obj.removeOwnedQxObject(txt);
      var txt2 = obj.getQxObject("txt");
      this.assertTrue(txt !== txt2);
      this.assertTrue(txt2 === obj.getQxObject("txt"));
      
      txt.setQxObjectId("txt-orig");
      obj.addOwnedQxObject(txt);
      this.assertTrue(txt === obj.getQxObject("txt-orig"));

      var obj2 = new demo.MyClass();
      obj2.addOwnedQxObject(txt);
      this.assertTrue(obj.getQxObject("txt-orig") === undefined);
      this.assertTrue(obj2.getQxObject("txt-orig") === txt);
      
      Id.unregister("test");
      this.assertTrue(!Id.getQxObject("test"));
    }
  }
});
