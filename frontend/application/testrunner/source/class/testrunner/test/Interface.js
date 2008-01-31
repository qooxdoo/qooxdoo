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

qx.Class.define("testrunner.test.Interface",
{
  extend : testrunner.TestCase,

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    testInterface : function()
    {
      qx.Interface.define("testrunner.ICar",
      {
        members :
        {
          /**
           * TODOC
           *
           * @type member
           * @return {boolean} TODOC
           */
          startEngine : function() {
            return true;
          }
        },

        properties : { color : {} }
      });

      this.assertExceptionDebugOn(function() {
        var i = new testrunner.ICar();
      }, Error);

      // test correct implementations
      qx.Class.define("testrunner.Audi",
      {
        extend : Object,
        construct : function() {},
        implement : [ testrunner.ICar ],

        members :
        {
          /**
           * TODOC
           *
           * @type member
           * @return {string} TODOC
           */
          startEngine : function() {
            return "start";
          }
        },

        statics :
        {
          /**
           * TODOC
           *
           * @type static
           * @return {string} TODOC
           */
          honk : function() {
            return "honk";
          }
        },

        properties : { color : { _legacy : true } }
      });

      var audi = new testrunner.Audi("audi");

      // nothing defined
      this.assertExceptionDebugOn(function()
      {
        qx.Class.define("testrunner.Audi1",
        {
          extend    : Object,
          construct : function() {},
          implement : [ testrunner.ICar ]
        });
      },
      Error, new RegExp('Implementation of method .* is missing'));

      // members not defined
      this.assertExceptionDebugOn(function()
      {
        qx.Class.define("testrunner.Audi2",
        {
          extend : Object,
          construct : function() {},
          implement : [ testrunner.ICar ],

          statics :
          {
            /**
             * TODOC
             *
             * @type static
             * @return {string} TODOC
             */
            honk : function() {
              return "honk";
            }
          },

          properties : { color : { _legacy : true } }
        });
      },
      Error, 'Implementation of method "startEngine" is missing');

      // property not defined
      this.assertExceptionDebugOn(function()
      {
        qx.Class.define("testrunner.Audi4",
        {
          extend : Object,
          construct : function() {},
          implement : [ testrunner.ICar ],

          members :
          {
            /**
             * TODOC
             *
             * @type member
             * @return {string} TODOC
             */
            startEngine : function() {
              return "start";
            }
          },

          statics :
          {
            /**
             * TODOC
             *
             * @type static
             * @return {string} TODOC
             */
            honk : function() {
              return "honk";
            }
          }
        });
      },
      Error, new RegExp("property .* not supported"));
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    testAssertions : function()
    {
      qx.Interface.define("testrunner.IComplex",
      {
        members :
        {
          /**
           * TODOC
           *
           * @type member
           * @param a {Array} TODOC
           * @return {var} TODOC
           */
          add : function(a) {
            return (arguments.length == 1 && qx.Class.implementsInterface(a.constructor, testrunner.IComplex));
          },


          /**
           * TODOC
           *
           * @type member
           * @param r {var} TODOC
           * @return {var} TODOC
           */
          setReal : function(r) {
            return arguments.length == 1 && typeof (r) == "number";
          },


          /**
           * TODOC
           *
           * @type member
           * @return {var} TODOC
           */
          abs : function() {
            return arguments[0] == undefined;
          }
        }
      });

      qx.Class.define("testrunner.Complex",
      {
        extend : Object,
        implement : testrunner.IComplex,

        construct : function(real, imag)
        {
          this._real = real;
          this._imag = imag;
        },

        members :
        {
          /**
           * TODOC
           *
           * @type member
           * @param a {Array} TODOC
           * @return {void}
           */
          add : function(a)
          {
            this._real += a._real;
            this._imag += a._imag;
          },


          /**
           * TODOC
           *
           * @type member
           * @param r {var} TODOC
           * @return {void}
           */
          setReal : function(r) {
            this._real = r;
          },


          /**
           * TODOC
           *
           * @type member
           * @return {var} TODOC
           */
          abs : function() {
            return Math.sqrt((this._real * this._real) + (this._imag + this._imag));
          },


          /**
           * TODOC
           *
           * @type member
           * @return {var} TODOC
           */
          toString : function() {
            return this._real + "+" + this._imag + "i";
          }
        }
      });

      var a = new testrunner.Complex(1, 1);
      var b = new testrunner.Complex(2, -3.4);

      // valid usage
      a.add(b);
      a.setReal(20);
      a.abs();

      // invalid usage
      this.assertExceptionDebugOn(function() {
        a.add(b, b);
      }, Error, "Pre condition of method", "a");

      this.assertExceptionDebugOn(function() {
        a.setReal();
      }, Error, "Pre condition of method", "b");

      this.assertExceptionDebugOn(function() {
        a.setReal(1, 2);
      }, Error, "Pre condition of method", "c");

      this.assertExceptionDebugOn(function() {
        a.setReal("Juhu");
      }, Error, "Pre condition of method", "d");

      this.assertExceptionDebugOn(function() {
        a.abs({});
      }, Error, "Pre condition of method", "e");

      this.assertExceptionDebugOn(function() {
        a.add("Juhu");
      }, Error, "Pre condition of method", "f");
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    testIncludes : function()
    {
      qx.Interface.define("testrunner.IMember",
      {
        members :
        {
          /**
           * TODOC
           *
           * @type member
           * @return {boolean} TODOC
           */
          sayJuhu : function() {
            return true;
          }
        }
      });

      qx.Interface.define("testrunner.IProperties",
      {
        properties :
        {
          "color" : {},
          "name"  : {}
        }
      });

      qx.Interface.define("testrunner.IAll", { extend : [ testrunner.IMember, testrunner.IProperties ] });

      qx.Interface.define("testrunner.IOther",
      {
        members :
        {
          /**
           * TODOC
           *
           * @type member
           * @return {boolean} TODOC
           */
          bar : function() {
            return true;
          }
        }
      });

      var classDef =
      {
        extend : Object,
        implement : testrunner.IAll,

        members :
        {
          /**
           * TODOC
           *
           * @type member
           * @return {void}
           */
          sayJuhu : function() {}
        },

        statics :
        {
          /**
           * TODOC
           *
           * @type static
           * @return {boolean} TODOC
           */
          sayHello : function() {
            return true;
          }
        },

        properties :
        {
          "color" : { _legacy : true },
          "name"  : { _legacy : true }
        }
      };

      // all implemented
      var def = qx.lang.Object.copy(classDef);
      qx.Class.define("testrunner.Implement1", def);

      this.assertTrue(qx.Class.implementsInterface(testrunner.Implement1, testrunner.IAll), "implements IAll");
      this.assertTrue(qx.Class.implementsInterface(testrunner.Implement1, testrunner.IMember), "implements IMember");
      this.assertTrue(qx.Class.implementsInterface(testrunner.Implement1, testrunner.IProperties), "implements IProperties");

      this.assertFalse(qx.Class.implementsInterface(testrunner.Implement1, testrunner.IOther), "not implements IOther");

      // no members
      var def = qx.lang.Object.copy(classDef);
      delete (def.members);

      this.assertExceptionDebugOn(function() {
        qx.Class.define("testrunner.Implement2", def);
      }, Error, "Implementation of method", "No members defined.");

      // no properties
      var def = qx.lang.Object.copy(classDef);
      delete (def.properties);

      this.assertExceptionDebugOn(function() {
        qx.Class.define("testrunner.Implement4", def);
      }, Error, new RegExp("property .* is not supported"), "No properties defined.");
    }
  }
});
