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
  extend : qx.dev.unit.TestCase,

  members :
  {
    testInterface : function()
    {
      qx.Interface.define("testrunner.ICar",
      {
        members :
        {
          startEngine : function() {
            return true;
          }
        },

        properties : { color : {} }
      });

      // test correct implementations
      qx.Class.define("testrunner.Audi",
      {
        extend : Object,
        construct : function() {},
        implement : [ testrunner.ICar ],

        members :
        {
          startEngine : function() {
            return "start";
          }
        },

        statics :
        {
          honk : function() {
            return "honk";
          }
        },

        properties : { color : { } }
      });

      var audi = new testrunner.Audi("audi");

      if (this.isDebugOn())
      {
        this.assertException(function() {
          var i = new testrunner.ICar();
        }, Error);


        // nothing defined
        this.assertException(function()
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
        this.assertException(function()
        {
          qx.Class.define("testrunner.Audi2",
          {
            extend : Object,
            construct : function() {},
            implement : [ testrunner.ICar ],

            statics :
            {
              honk : function() {
                return "honk";
              }
            },

            properties : { color : { } }
          });
        },
        Error, 'Implementation of method "startEngine" is missing');

        // property not defined
        this.assertException(function()
        {
          qx.Class.define("testrunner.Audi4",
          {
            extend : Object,
            construct : function() {},
            implement : [ testrunner.ICar ],

            members :
            {
              startEngine : function() {
                return "start";
              }
            },

            statics :
            {
              honk : function() {
                return "honk";
              }
            }
          });
        },
        Error, new RegExp("property .* not supported"));
      }
    },


    testAssertions : function()
    {
      qx.Interface.define("testrunner.IComplex",
      {
        members :
        {
          add : function(a) {
            this.assertArgumentsCount(arguments, 1, 1);
            this.assertInterface(a.constructor, testrunner.IComplex);
          },

          setReal : function(r) {
            this.assertArgumentsCount(arguments, 1, 1);
            this.assertType(r, "number");
          },

          abs : function() {
            this.assert(arguments[0] == undefined);
          }
        }
      });

      qx.Class.define("testrunner.Complex",
      {
        extend : qx.core.Object,
        implement : testrunner.IComplex,

        construct : function(real, imag)
        {
          this._real = real;
          this._imag = imag;
        },

        members :
        {
          add : function(a)
          {
            this._real += a._real;
            this._imag += a._imag;
          },


          setReal : function(r) {
            this._real = r;
          },


           abs : function() {
            return Math.sqrt((this._real * this._real) + (this._imag + this._imag));
          },


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
      if (this.isDebugOn())
      {
        this.assertException(function() {
          a.add(b, b);
        }, qx.dev.unit.AssertionError, null, "a");

        this.assertException(function() {
          a.setReal();
        }, qx.dev.unit.AssertionError, null, "b");

        this.assertException(function() {
          a.setReal(1, 2);
        }, qx.dev.unit.AssertionError, null, "c");

        this.assertException(function() {
          a.setReal("Juhu");
        }, qx.dev.unit.AssertionError, null, "d");

        this.assertException(function() {
          a.abs({});
        }, qx.dev.unit.AssertionError, null, "e");

        this.assertException(function() {
          a.add("Juhu");
        }, qx.dev.unit.AssertionError, null, "f");
      };
    },


    testProperties : function()
    {
      qx.Interface.define("testrunner.IProperties1", {
        properties : {
          value : {}
        }
      });

      qx.Class.define("testrunner.Properties1",
      {
        extend : qx.core.Object,
        implement : [testrunner.IProperties1],

        properties :
        {
          value : { check : "Integer"}
        }
      });

      if (this.isDebugOn())
      {
        this.assertException(function() {
          qx.Class.define("testrunner.Properties2",
          {
            extend : qx.core.Object,
            implement : [testrunner.IProperties1],

            members :
            {
              getValue : function() {},
              setValue : function(value) {}
            }
          });
        });
      };


      qx.Interface.define("testrunner.IProperties2",
      {
        members :
        {
          getValue : function() {},
          setValue : function(value) {}
        }
      });

      qx.Class.define("testrunner.Properties3",
      {
        extend : qx.core.Object,
        implement : [testrunner.IProperties2],

        properties :
        {
          value : { check : "Integer"}
        }
      });

      qx.Class.define("testrunner.Properties4",
      {
        extend : qx.core.Object,
        implement : [testrunner.IProperties2],

        members :
        {
          getValue : function() {},
          setValue : function(value) {}
        }
      })
    },


    testEvents : function()
    {
      qx.Interface.define("testrunner.IEvents1",
      {
        events : {
          "change" : "qx.event.type.Event"
        }
      });


      qx.Class.define("testrunner.Event1",
      {
        extend : qx.core.Object,
        implement : [testrunner.IEvents1],

        events : {
          change : "qx.event.type.Event"
        }
      })


      if (this.isDebugOn())
      {
        this.assertException(function() {
          qx.Class.define("testrunner.Event2",
          {
            extend : qx.core.Object,
            implement : [testrunner.IEvents1]
          })
        });
      };
    },


    testIncludes : function()
    {
      qx.Interface.define("testrunner.IMember",
      {
        members :
        {
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
          sayJuhu : function() {}
        },

        statics :
        {
          sayHello : function() {
            return true;
          }
        },

        properties :
        {
          "color" : { },
          "name"  : { }
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

      if (this.isDebugOn())
      {
        this.assertException(function() {
          qx.Class.define("testrunner.Implement2", def);
        }, Error, "Implementation of method", "No members defined.");
      };

      // no properties
      var def = qx.lang.Object.copy(classDef);
      delete (def.properties);

      if (this.isDebugOn())
      {
        this.assertException(function() {
          qx.Class.define("testrunner.Implement4", def);
        }, Error, new RegExp("property .* is not supported"), "No properties defined.");
      };
    },


    /**
     * abstract classes may define an interface and implement it only partially
     * sub classes must implement the missing methods
     */
    testAbstractClass : function()
    {

      qx.Interface.define("testrunner.IJuhu",
      {
        members :
        {
          sayJuhu : function() {},
          sayKinners : function() {}
        }
      });


      // should not raise an exception
      qx.Class.define("testrunner.AbstractJuhu1", {
        extend : qx.core.Object,
        implement : testrunner.IJuhu,
        type : "abstract"
      });


      // should not raise an exception
      qx.Class.define("testrunner.AbstractJuhu2", {
        extend : qx.core.Object,
        implement : testrunner.IJuhu,
        type : "abstract",

        members :
        {
          sayJuhu : function() { return "Juhu"; }
        }
      });

      // should raise an exception
      if (this.isDebugOn())
      {
        this.assertException(function() {
          qx.Class.define("testrunner.Juhu1", {
            extend : testrunner.AbstractJuhu1,

            members :
            {
              sayJuhu : function() { return "Juhu"; }
            }
          });
        }, Error, '.*Implementation of method "sayKinners" is missing in class "testrunner.Juhu1" required by interface "testrunner.IJuhu"');
      };


      qx.Class.define("testrunner.Juhu1", {
        extend : testrunner.AbstractJuhu2,
        members :
        {
          sayKinners : function() { return "Kinners"; }
        }
      });

    }
  }
});
