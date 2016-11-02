/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 Zenesis Limited (http://www.zenesis.com)

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com)

************************************************************************ */

qx.Class.define("qx.test.Annotation", {
  extend: qx.dev.unit.TestCase,
  
  members: {
    testBasic: function() {
      var clazzTop = qx.Class.define(null, {
          "@": [ "class-a-anno" ],
          extend: qx.core.Object,
          
          "@construct": [ "construct-a-anno" ],
          "@destruct": [ "destruct-a-anno" ],
          
          properties: {
            alpha: {
              init: null,
              nullable: true,
              "@": [ "property-alpha-anno" ]
            }
          },
          
          members: {
            "@methodA": [ "method-a-anno" ],
            methodA: function() {
              
            }
          },
          
          statics : {
            "@staticA": [ "static-a-anno" ],
            staticA: function() {
              return true;
            }
          }
        });
      
      var clazzMiddle = qx.Class.define(null, {
        extend: clazzTop,
        
        properties: {
          bravo: {
            init: null,
            nullable: true,
            "@": [ "property-bravo-anno" ]
          }
        },
        
        members: {
          "@methodB": [ "method-b-anno" ],
          methodB: function() {
            
          }
        }
      });
      
      var clazzBottom = qx.Class.define(null, {
        extend: clazzMiddle,
        "@": [ "class-c-anno" ],
        "@construct": [ "construct-c-anno" ],
        "@destruct": [ "destruct-c-anno" ],
        
        properties: {
          bravo: {
            refine: true,
            "@": [ "refined-bravo-anno" ]
          }
        },
        
        members: {
          "@methodB": [ "refined-method-b-anno" ]
        }
      });

      
      this.assertArrayEquals([ "class-a-anno" ], qx.Annotation.getOwnClass(clazzTop));
      this.assertArrayEquals([ "class-a-anno" ], qx.Annotation.getClass(clazzTop));
      this.assertArrayEquals([ "construct-a-anno" ], qx.Annotation.getConstructor(clazzTop));
      this.assertArrayEquals([ "destruct-a-anno" ], qx.Annotation.getDestructor(clazzTop));
      this.assertArrayEquals([ "method-a-anno" ], qx.Annotation.getOwnMember(clazzTop, "methodA"));
      this.assertArrayEquals([ "static-a-anno" ], qx.Annotation.getStatic(clazzTop, "staticA"));
      this.assertArrayEquals([ "property-alpha-anno" ], qx.Annotation.getProperty(clazzTop, "alpha"));
      
      this.assertArrayEquals([ ], qx.Annotation.getOwnClass(clazzMiddle));
      this.assertArrayEquals([ "class-a-anno" ], qx.Annotation.getClass(clazzMiddle));
      this.assertArrayEquals([ ], qx.Annotation.getOwnConstructor(clazzMiddle));
      this.assertArrayEquals([ "construct-a-anno" ], qx.Annotation.getConstructor(clazzMiddle));
      this.assertArrayEquals([ ], qx.Annotation.getOwnDestructor(clazzMiddle));
      this.assertArrayEquals([ "destruct-a-anno" ], qx.Annotation.getDestructor(clazzMiddle));
      
      this.assertArrayEquals([ ], qx.Annotation.getOwnMember(clazzMiddle, "methodA"));
      this.assertArrayEquals([ "method-a-anno" ], qx.Annotation.getMember(clazzMiddle, "methodA"));
      this.assertArrayEquals([ "method-b-anno" ], qx.Annotation.getMember(clazzMiddle, "methodB"));
      this.assertArrayEquals([ ], qx.Annotation.getStatic(clazzMiddle, "staticA"));
      this.assertArrayEquals([ "property-alpha-anno" ], qx.Annotation.getProperty(clazzMiddle, "alpha"));
      this.assertArrayEquals([ "property-bravo-anno" ], qx.Annotation.getProperty(clazzMiddle, "bravo"));
      this.assertArrayEquals([ "bravo" ], qx.Annotation.getPropertiesByAnnotation(clazzBottom, "property-bravo-anno"));
      
      this.assertArrayEquals([ "class-c-anno" ], qx.Annotation.getOwnClass(clazzBottom));
      this.assertArrayEquals([ "class-c-anno", "class-a-anno" ], qx.Annotation.getClass(clazzBottom));
      this.assertArrayEquals([ "construct-c-anno" ], qx.Annotation.getOwnConstructor(clazzBottom));
      this.assertArrayEquals([ "construct-c-anno", "construct-a-anno" ], qx.Annotation.getConstructor(clazzBottom));
      this.assertArrayEquals([ "destruct-c-anno" ], qx.Annotation.getOwnDestructor(clazzBottom));
      this.assertArrayEquals([ "destruct-c-anno", "destruct-a-anno" ], qx.Annotation.getDestructor(clazzBottom));
      
      this.assertArrayEquals([ ], qx.Annotation.getOwnMember(clazzBottom, "methodA"));
      this.assertArrayEquals([ "method-a-anno" ], qx.Annotation.getMember(clazzBottom, "methodA"));
      this.assertArrayEquals([ "refined-method-b-anno", "method-b-anno" ], qx.Annotation.getMember(clazzBottom, "methodB"));
      this.assertArrayEquals([ "property-alpha-anno" ], qx.Annotation.getProperty(clazzBottom, "alpha"));
      this.assertArrayEquals([ "refined-bravo-anno", "property-bravo-anno" ], qx.Annotation.getProperty(clazzBottom, "bravo"));
      this.assertArrayEquals([ "refined-bravo-anno" ], qx.Annotation.getOwnProperty(clazzBottom, "bravo"));
      
    },
    
    testByType: function() {
      var MyAnno = qx.Class.define(null, {
        extend: qx.core.Object,
        
        construct: function(value) {
          this.base(arguments);
          if (value)
            this.setValue(value);
        },
        
        properties: {
          value: {
            init: 0
          }
        }
      });
      
      var clazz = qx.Class.define(null, {
        extend: qx.core.Object,
        
        "@construct": [ "construct-a-anno" ],
        "@destruct": [ "destruct-a-anno" ],
        
        properties: {
          alpha: {
            init: null,
            nullable: true,
            "@": [ "property-alpha-anno", new MyAnno(2) ]
          }
        },
        
        members: {
          "@methodA": [ "method-a-anno", new MyAnno(3) ],
          methodA: function() {
            
          }
        },
        
        statics : {
          "@staticA": [ "static-a-anno", new MyAnno(4) ],
          staticA: function() {
            return true;
          }
        }
      });
      
      var match = qx.Annotation.getProperty(clazz, "alpha", MyAnno);
      this.assertEquals(1, match.length);
      this.assertTrue(match[0] instanceof MyAnno);
      
      var match = qx.Annotation.getOwnProperty(clazz, "alpha", MyAnno);
      this.assertEquals(1, match.length);
      this.assertTrue(match[0] instanceof MyAnno);
      
      var match = qx.Annotation.getMember(clazz, "methodA", MyAnno);
      this.assertEquals(1, match.length);
      this.assertTrue(match[0] instanceof MyAnno);
    }
  }
});
