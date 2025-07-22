/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Patryk Malinowski (patryk-m-malinowski)

************************************************************************ */
/**
 * Test-Class for testing the single value binding
 *
 * @ignore(qx.test.data.MultiBinding)
 */
qx.Class.define("qx.test.data.singlevalue.Async", {
  extend: qx.dev.unit.TestCase,
  include: [qx.dev.unit.MMock],

  members: {
    __a: null,
    __b1: null,
    __b2: null,

    setUp() {
      qx.Class.undefine("qx.test.data.singlevalue.async.Test");
      const Clazz = qx.Class.define("qx.test.data.singlevalue.async.Test", {
        extend: qx.core.Object,
        properties: {
          /**
           * The async input
           */
          ai: {
            async: true,
            nullable: true,
            init: null
          },
          /**
           * The async output
           */
          ao: {
            async: true,
            nullable: true,
            init: null
          },
          /**
           * Syncronous input
           */
          si: {
            nullable: true,
            init: null
          },
          /**
           * Syncronous output
           */
          so: {
            nullable: true,
            init: null
          }
        }
      });
      this.__a = new Clazz();
      this.__b = new Clazz();
      this.__c = new Clazz();
    },

    tearDown() {
      this.__a.dispose();
      this.__b.dispose();
      this.__c.dispose();
    },

    testSingleAsyncTarget() {
      const doit = async () => {
        this.__a.setAi(this.__a);
        this.__a.setSi("123");

        let out = "";
        this.__a.addListenerOnce("changeAo", evt => {
          this.assertEquals("123", evt.getData());
          return new Promise(resolve => {
            setTimeout(() => {
              out += "event";
              resolve();
            }, 200);
          });
        });

        await this.__a.bindAsync("ai.si", this.__a, "ao");
        this.assertEquals("event", out, "event handler should be called");
        this.assertEquals("123", this.__a.ai.si);
        this.assertEquals("123", this.__a.ao);
        await this.__a.setAiAsync(null);
        this.assertEquals(null, this.__a.ao);
      };

      doit().finally(() => {
        this.resume();
      });
      this.wait(1000);
    },

    testDeepAsyncTarget() {
      const doit = async () => {
        this.__a.setAiAsync(this.__a);
        this.__a.setSi("123");
        await this.__a.setAoAsync(this.__a);
        await this.__a.bindAsync("ai.si", this.__a, "ao.so");
        this.assertEquals("123", this.__a.ao.so);
        this.__b.setSo("77");
        await this.__a.setAoAsync(this.__b);
        this.assertEquals("123", this.__b.so);
      };

      doit().finally(() => {
        this.resume();
      });
      this.wait(1000);
    },

    testChangeSourceAndTarget() {
      const doit = async () => {
        this.__a.setAi(this.__a);
        this.__a.setSi("123");
        let binding = new qx.data.binding.Binding("ai.si", "ao", null, null);
        await binding.setTarget(this.__a);
        await binding.setSource(this.__a);
        await binding;
        this.assertEquals("123", this.__a.ao);
        await binding.setTarget(this.__b);
        this.assertEquals("123", this.__b.ao);

        this.__c.setAi(this.__c);
        this.__c.setSi("456");
        await binding.setSource(this.__c);
        this.assertEquals("456", this.__b.ao);
      };

      doit().finally(() => {
        this.resume();
      });
      this.wait(1000);
    },

    testArrays() {
      const doit = async () => {
        this.__a.setAi(new qx.data.Array([1, 2, 3]));
        await this.__a.bindAsync("ai[0]", this.__a, "ao[0]");
        this.__a.setAo(new qx.data.Array());
        this.assertEquals(1, this.__a.getAo().getItem(0));
        this.__a.getAi().unshift(4);
        this.assertEquals(4, this.__a.getAo().getItem(0));
      };

      doit().finally(() => {
        this.resume();
      });
      this.wait(1000);
    }
  }
});
