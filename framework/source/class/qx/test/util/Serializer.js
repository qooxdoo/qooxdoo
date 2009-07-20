/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("qx.test.util.Serializer", 
{
  extend : qx.dev.unit.TestCase,
  
  construct : function() {
    qx.Class.define("qx.test.SerializModel", {
      extend : qx.core.Object,
      properties : {
        data1 : {
          nullable: true
        },
        
        data2 : {
          nullable: true
        },
        
        data3 : {
          nullable: true
        }
      }
    });    
    
    this.__s = qx.util.Serializer;
  },

  members :
  {
    __model: null,
    __s: null,
    
    
    setUp : function() {
      this.__model = new qx.test.SerializModel();
    },
    
    tearDown : function() {
      this.__model.dispose();
    },
    
    
    testString : function() {
      this.__model.setData1("a");
      this.__model.setData2("b");
      this.__model.setData3("c");
      this.assertEquals("data1=a&data2=b&data3=c", this.__s.toURIParameter(this.__model));
      
      this.__model.setData1("A");
      this.__model.setData2("B");
      this.__model.setData3("C");
      this.assertEquals("data1=A&data2=B&data3=C", this.__s.toURIParameter(this.__model));
      
      this.__model.setData1("1");
      this.__model.setData2("11");
      this.__model.setData3("111");
      this.assertEquals("data1=1&data2=11&data3=111", this.__s.toURIParameter(this.__model));
    },
    
    testStringEncoded : function() {
      this.__model.setData1("ä");
      this.__model.setData2("ö");
      this.__model.setData3("ü");
      this.assertEquals("data1=%C3%A4&data2=%C3%B6&data3=%C3%BC", this.__s.toURIParameter(this.__model));
      
      this.__model.setData1("–");
      this.__model.setData2(" ");
      this.__model.setData3("ß");
      this.assertEquals("data1=%E2%80%93&data2=%20&data3=%C3%9F", this.__s.toURIParameter(this.__model));      
    },
    
    testBoolean : function() {
      this.__model.setData1(true);
      this.__model.setData2(false);
      this.__model.setData3(null);
      this.assertEquals("data1=true&data2=false&data3=null", this.__s.toURIParameter(this.__model));    
    },
    
    testNumber : function() {
      this.__model.setData1(10);
      this.__model.setData2(-15.3443);
      this.__model.setData3(Number.NaN);
      this.assertEquals("data1=10&data2=-15.3443&data3=NaN", this.__s.toURIParameter(this.__model));      
    },
    
    
    testKeyEncoded : function() {
      qx.Class.define("qx.test.SerializModelEnc", {
        extend: qx.core.Object,
        properties : {
          "äüö" : {
            init: "ÄÜÖ"
          }
        }
      });
      var model = new qx.test.SerializModelEnc();
      
      this.assertEquals("%C3%A4%C3%BC%C3%B6=%C3%84%C3%9C%C3%96", this.__s.toURIParameter(model));      
      
      model.dispose();
    }
  }
});
