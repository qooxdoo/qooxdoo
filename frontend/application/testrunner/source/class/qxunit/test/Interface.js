/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qxunit.test.Interface", {
  extend: qxunit.TestCase,

  members : {

    testInterface: function() {
      qx.Interface.define("qxunit.ICar", {
            members: {
                startEngine: function() { return true; }
            },
        properties: {
          color: {}
        }
        });

        this.assertExceptionDebugOn(function() {
          var i = new qxunit.ICar();
      }, Error);

      // test correct implementations
        qx.Class.define("qxunit.Audi", {
            extend: Object,
            construct: function() {},

            implement: [qxunit.ICar],

            members: {
                startEngine: function() { return "start"}
            },
        statics: {
          honk: function() { return "honk"; }
        },
        properties: {
          color: { _legacy: true }
        }
        });

        var audi = new qxunit.Audi("audi");

      // nothing defined
      this.assertExceptionDebugOn(function() {
            qx.Class.define("qxunit.Audi1", {
                extend: Object,
                construct: function() {},
                implement: [qxunit.ICar]
            });
        }, Error, new RegExp('Implementation of method .* is missing'));

      // members not defined
      this.assertExceptionDebugOn(function() {
          qx.Class.define("qxunit.Audi2", {
              extend: Object,
              construct: function() {},
              implement: [qxunit.ICar],
          statics: {
            honk: function() { return "honk"; }
          },
          properties: {
            color: { _legacy: true }
          }
          });
        }, Error, 'Implementation of method "startEngine" is missing');

      // property not defined
      this.assertExceptionDebugOn(function() {
          qx.Class.define("qxunit.Audi4", {
              extend: Object,
              construct: function() {},
              implement: [qxunit.ICar],
          members: {
                  startEngine: function() { return "start"}
              },
          statics: {
            honk: function() { return "honk"; }
          }
          })
        }, Error, new RegExp("property .* not supported"));
    },

    testAssertions: function() {
      qx.Interface.define("qxunit.IComplex", {
        members: {
          add: function(a) {
            return (
              arguments.length == 1 &&
              qx.Class.implementsInterface(a.constructor, qxunit.IComplex)
            );
          },
          setReal: function(r) {
            return arguments.length == 1 && typeof(r) == "number";
          },
          abs: function() {
            return arguments[0] == undefined;
          }
        }
      });

      qx.Class.define("qxunit.Complex", {
        extend: Object,
        implement: qxunit.IComplex,
        construct: function(real, imag) {
          this._real = real;
          this._imag = imag;
        },
        members: {
          add: function(a) {
            this._real += a._real;
            this._imag += a._imag;
          },
          setReal: function(r) {
            this._real = r;
          },
          abs: function() {
            return Math.sqrt((this._real * this._real) + (this._imag + this._imag));
          },
          toString: function() {
            return this._real + "+" + this._imag+"i";
          }
        }
      });

      var a = new qxunit.Complex(1,1);
      var b = new qxunit.Complex(2, -3.4);

      // valid usage
      a.add(b);
      a.setReal(20);
      a.abs();

      // invalid usage
      this.assertExceptionDebugOn(function() {
        a.add(b,b);
      }, Error, "Pre condition of method", "a");

      this.assertExceptionDebugOn(function() {
        a.setReal()
      }, Error, "Pre condition of method", "b");

      this.assertExceptionDebugOn(function() {
        a.setReal(1,2)
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

    testIncludes: function() {
      qx.Interface.define("qxunit.IMember", {
        members: {
          sayJuhu: function() { return true; }
        }
      });

      qx.Interface.define("qxunit.IProperties", {
        properties: {"color": {}, "name": {} }
      });

      qx.Interface.define("qxunit.IAll", {
        extend: [qxunit.IMember, qxunit.IProperties]
      });

      qx.Interface.define("qxunit.IOther", {
        members: {
          bar: function() {return true;}
        }
      });

      var classDef = {
        extend: Object,
        implement: qxunit.IAll,
        members: {
          sayJuhu: function() {}
        },
        statics: {
          sayHello: function() { return true; }
        },
        properties: {"color": { _legacy: true }, "name": { _legacy: true} }
      }

      // all implemented
      var def = qx.lang.Object.copy(classDef);
      qx.Class.define("qxunit.Implement1", def)

      this.assertTrue(qx.Class.implementsInterface(qxunit.Implement1, qxunit.IAll), "implements IAll");
      this.assertTrue(qx.Class.implementsInterface(qxunit.Implement1, qxunit.IMember), "implements IMember");
      this.assertTrue(qx.Class.implementsInterface(qxunit.Implement1, qxunit.IProperties), "implements IProperties");

      this.assertFalse(qx.Class.implementsInterface(qxunit.Implement1, qxunit.IOther), "not implements IOther");

      // no members
      var def = qx.lang.Object.copy(classDef);
      delete(def.members);
      this.assertExceptionDebugOn(function() {
        qx.Class.define("qxunit.Implement2", def)
      }, Error, "Implementation of method", "No members defined.");

      // no properties
      var def = qx.lang.Object.copy(classDef);
      delete(def.properties);
      this.assertExceptionDebugOn(function() {
        qx.Class.define("qxunit.Implement4", def)
      }, Error, new RegExp("property .* is not supported"), "No properties defined.");

    }
  }
});