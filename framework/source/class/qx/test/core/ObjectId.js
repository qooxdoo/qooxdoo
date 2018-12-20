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
          _createObjectImpl: function(id) {
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
      var txt = obj.getObject("txt");
      this.assertTrue(txt === obj.getObject("txt"));
      this.assertTrue(txt.getQxObjectId() === "txt");
      this.assertTrue(Id.getObject("test") === obj);
      this.assertTrue(Id.getObject("test/txt") === txt);
      
      obj.removeOwnedObject(txt);
      var txt2 = obj.getObject("txt");
      this.assertTrue(txt !== txt2);
      this.assertTrue(txt2 === obj.getObject("txt"));
      
      txt.setQxObjectId("txt-orig");
      obj.addOwnedObject(txt);
      this.assertTrue(txt === obj.getObject("txt-orig"));

      var obj2 = new demo.MyClass();
      obj2.addOwnedObject(txt);
      this.assertTrue(obj.getObject("txt-orig") === undefined);
      this.assertTrue(obj2.getObject("txt-orig") === txt);
      
      Id.unregister("test");
      this.assertTrue(!Id.getObject("test"));
    }
  }
});
