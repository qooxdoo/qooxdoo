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

qx.Class.define("qx.test.Interface",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testInterface : function()
    {
      qx.Interface.define("qx.ICar",
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
      qx.Class.define("qx.Audi",
      {
        extend : Object,
        construct : function() {},
        implement : [ qx.ICar ],

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

      var audi = new qx.Audi("audi");

      if (this.isDebugOn())
      {
        this.assertException(function() {
          var i = new qx.ICar();
        }, Error);


        // nothing defined
        this.assertException(function()
        {
          qx.Class.define("qx.Audi1",
          {
            extend    : Object,
            construct : function() {},
            implement : [ qx.ICar ]
          });
        },
        Error, new RegExp('Implementation of method .* is missing'));

        // members not defined
        this.assertException(function()
        {
          qx.Class.define("qx.Audi2",
          {
            extend : Object,
            construct : function() {},
            implement : [ qx.ICar ],

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
          qx.Class.define("qx.Audi4",
          {
            extend : Object,
            construct : function() {},
            implement : [ qx.ICar ],

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
      qx.Interface.define("qx.IComplex",
      {
        members :
        {
          add : function(a) {
            this.assertArgumentsCount(arguments, 1, 1);
            this.assertInterface(a.constructor, qx.IComplex);
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

      qx.Class.define("qx.Complex",
      {
        extend : qx.core.Object,
        implement : qx.IComplex,

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

      var a = new qx.Complex(1, 1);
      var b = new qx.Complex(2, -3.4);

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
      qx.Interface.define("qx.IProperties1", {
        properties : {
          value : {}
        }
      });

      qx.Class.define("qx.Properties1",
      {
        extend : qx.core.Object,
        implement : [qx.IProperties1],

        properties :
        {
          value : { check : "Integer"}
        }
      });

      if (this.isDebugOn())
      {
        this.assertException(function() {
          qx.Class.define("qx.Properties2",
          {
            extend : qx.core.Object,
            implement : [qx.IProperties1],

            members :
            {
              getValue : function() {},
              setValue : function(value) {}
            }
          });
        });
      };


      qx.Interface.define("qx.IProperties2",
      {
        members :
        {
          getValue : function() {},
          setValue : function(value) {}
        }
      });

      qx.Class.define("qx.Properties3",
      {
        extend : qx.core.Object,
        implement : [qx.IProperties2],

        properties :
        {
          value : { check : "Integer"}
        }
      });

      qx.Class.define("qx.Properties4",
      {
        extend : qx.core.Object,
        implement : [qx.IProperties2],

        members :
        {
          getValue : function() {},
          setValue : function(value) {}
        }
      })
    },


    testEvents : function()
    {
      qx.Interface.define("qx.IEvents1",
      {
        events : {
          "change" : "qx.event.type.Event"
        }
      });


      qx.Class.define("qx.Event1",
      {
        extend : qx.core.Object,
        implement : [qx.IEvents1],

        events : {
          change : "qx.event.type.Event"
        }
      })


      if (this.isDebugOn())
      {
        this.assertException(function() {
          qx.Class.define("qx.Event2",
          {
            extend : qx.core.Object,
            implement : [qx.IEvents1]
          })
        });
      };
    },


    testIncludes : function()
    {
      qx.Interface.define("qx.IMember",
      {
        members :
        {
          sayJuhu : function() {
            return true;
          }
        }
      });

      qx.Interface.define("qx.IProperties",
      {
        properties :
        {
          "color" : {},
          "name"  : {}
        }
      });

      qx.Interface.define("qx.IAll", { extend : [ qx.IMember, qx.IProperties ] });

      qx.Interface.define("qx.IOther",
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
        implement : qx.IAll,

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
      qx.Class.define("qx.Implement1", def);

      this.assertTrue(qx.Class.implementsInterface(qx.Implement1, qx.IAll), "implements IAll");
      this.assertTrue(qx.Class.implementsInterface(qx.Implement1, qx.IMember), "implements IMember");
      this.assertTrue(qx.Class.implementsInterface(qx.Implement1, qx.IProperties), "implements IProperties");

      this.assertFalse(qx.Class.implementsInterface(qx.Implement1, qx.IOther), "not implements IOther");

      // no members
      var def = qx.lang.Object.copy(classDef);
      delete (def.members);

      if (this.isDebugOn())
      {
        this.assertException(function() {
          qx.Class.define("qx.Implement2", def);
        }, Error, "Implementation of method", "No members defined.");
      };

      // no properties
      var def = qx.lang.Object.copy(classDef);
      delete (def.properties);

      if (this.isDebugOn())
      {
        this.assertException(function() {
          qx.Class.define("qx.Implement4", def);
        }, Error, new RegExp("property .* is not supported"), "No properties defined.");
      };
    },


    /**
     * abstract classes may define an interface and implement it only partially
     * sub classes must implement the missing methods
     */
    testAbstractClass : function()
    {

      qx.Interface.define("qx.IJuhu",
      {
        members :
        {
          sayJuhu : function() {},
          sayKinners : function() {}
        }
      });


      // should not raise an exception
      qx.Class.define("qx.AbstractJuhu1", {
        extend : qx.core.Object,
        implement : qx.IJuhu,
        type : "abstract"
      });


      // should not raise an exception
      qx.Class.define("qx.AbstractJuhu2", {
        extend : qx.core.Object,
        implement : qx.IJuhu,
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
          qx.Class.define("qx.Juhu1", {
            extend : qx.AbstractJuhu1,

            members :
            {
              sayJuhu : function() { return "Juhu"; }
            }
          });
        }, Error, '.*Implementation of method "sayKinners" is missing in class "qx.Juhu1" required by interface "qx.IJuhu"');
      };


      qx.Class.define("qx.Juhu1", {
        extend : qx.AbstractJuhu2,
        members :
        {
          sayKinners : function() { return "Kinners"; }
        }
      });

    }
  }
});
