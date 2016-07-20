/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.performance.data.Marshaling",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMeasure,

  members :
  {
    CREATE_ITERATIONS : 100000,
    __objects : null,
    __marshaler : null,

    setUp : function() {
      this.__marshaler = new qx.data.marshal.Json();
    },

    tearDown : function() {
      this.__marshaler.dispose();
      this.__marshaler = null;
    },

    testJsonSimpleToClass : function()
    {
      var data = {a: 10};

      var self = this;
      this.measure(
        "simple json class creation",
        function() {
          for (var i=0; i<self.CREATE_ITERATIONS; i++) {
            self.__marshaler.toClass(data);
          }
        },
        function() {
          qx.Class.undefine("qx.data.model.a");
        },
        this.CREATE_ITERATIONS
      );
    },

    testJsonSimpleToClassWithBubble : function()
    {
      var data = {a: 10};

      var self = this;
      this.measure(
        "simple json class creation with bubble events",
        function() {
          for (var i=0; i<self.CREATE_ITERATIONS; i++) {
            self.__marshaler.toClass(data, true);
          }
        },
        function() {
          qx.Class.undefine("qx.data.model.a");
        },
        this.CREATE_ITERATIONS
      );
    },

    testJsonSimpleToModel : function()
    {
      var data = {a: 10};
      this.__marshaler.toClass(data);

      var self = this;
      this.__objects = [];
      this.measure(
        "simple json object creation",
        function() {
          for (var i=0; i<self.CREATE_ITERATIONS; i++) {
            self.__objects.push(self.__marshaler.toModel(data));
          }
        },
        function() {
          for (var i=0; i < self.__objects.length; i++) {
            self.__objects[i].dispose();
          }
          qx.Class.undefine("qx.data.model.a");
        },
        this.CREATE_ITERATIONS
      );
    }
  }
});
