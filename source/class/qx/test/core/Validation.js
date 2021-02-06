/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @ignore(qx.Model)
 */

qx.Class.define("qx.test.core.Validation",
{
  extend : qx.dev.unit.TestCase,


  construct : function()
  {
    this.base(arguments);

    qx.Class.define("qx.Model",
    {
      extend : qx.core.Object,

      properties :
      {
          custom : {
              init:  "Some String",
              check: "String",
              validate: "__validateCustom"
          },

          number : {
              init:  18,
              validate: qx.util.Validate.number()
          },

          range : {
              init: 1.80,
              validate: qx.util.Validate.range(1, 2)
          },

          array : {
              init: "male",
              validate: qx.util.Validate.inArray(["male", "female"])
          },

          email : {
            init: "martin.wittemann@1und1.de",
            validate: qx.util.Validate.email()
          },

          string : {
            init: "Some String!",
            validate: qx.util.Validate.string()
          },

          url : {
            init: "http://www.1und1.de",
            validate: qx.util.Validate.url()
          },

          color : {
            init : "black",
            validate: qx.util.Validate.color()
          },

          regExp : {
            init : "test",
            validate: qx.util.Validate.regExp(/^abc/)
          }
      },

      members : {
        __validateCustom : function(value) {
            // if the length is lower than 4
            if (value.length < 4) {
                throw new qx.core.ValidationError("Validation Error: String must be longer than three characters. (" + value + ")");
            }
        }
      }

    });

    this.__model = new qx.Model();

  },

  members :
  {

    testNumber : function()
    {
      var model = this.__model;
      // test for some false inputs
      this.assertException(function() {model.setNumber("test");}, qx.core.ValidationError, null, "A String is no number.");
      this.assertException(function() {model.setNumber(new Date());}, qx.core.ValidationError, null, "A Date is no number.");
      this.assertException(function() {model.setNumber(this);}, qx.core.ValidationError, null, "this is no number.");

      // test an positive integer
      model.setNumber(12);
      this.assertEquals(12, model.getNumber());
      // test an negative integer
      model.setNumber(-20);
      this.assertEquals(-20, model.getNumber());
      // test an float
      model.setNumber(12.15);
      this.assertEquals(12.15, model.getNumber());
    },


    testEmail : function()
    {
      var model = this.__model;

      // test some wrong addresses
      this.assertException(function() {model.setEmail("test");}, qx.core.ValidationError, null, "test is a mailadress?");
      this.assertException(function() {model.setEmail("@affe.de");}, qx.core.ValidationError, null, "@affe.de is never a mailadress!");
      this.assertException(function() {model.setEmail("hans@@wurst.de");}, qx.core.ValidationError, null, "Are two @ allowed?");
      this.assertException(function() {model.setEmail("m@a.d");}, qx.core.ValidationError, null, "m@a.d?");

      // test some working addresses
      model.setEmail("affe@zoo.de");
      this.assertEquals("affe@zoo.de", model.getEmail(), "affe@zoo.de should work!");
      model.setEmail("mensch@db.info");
      this.assertEquals("mensch@db.info", model.getEmail(), "mensch@db.info should work!");
      model.setEmail("ichbineinelangemailadresse@undhabeinelangedomainnochdazu.de");
      this.assertEquals("ichbineinelangemailadresse@undhabeinelangedomainnochdazu.de", model.getEmail(), "ichbineinelangemailadresse@undhabeinelangedomainnochdazu.de should work!");
    },


    testString : function()
    {
      var model = this.__model;

      // test some wrong inputs
      this.assertException(function() {model.setString(1);}, qx.core.ValidationError, null, "A number is not a string!");
      this.assertException(function() {model.setString(this);}, qx.core.ValidationError, null, "This test is not a string!");
      this.assertException(function() {model.setString(true);}, qx.core.ValidationError, null, "A boolean is not a string!");
      this.assertException(function() {model.setString(new Date());}, qx.core.ValidationError, null, "A Date-Object is not a string!");

      // Test some working inputs
      model.setString("affe@zoo.de");
      this.assertEquals("affe@zoo.de", model.getString(), "affe@zoo.de as string should work!");
      model.setString("");
      this.assertEquals("", model.getString(), "An empty string should work!");
    },

    testUrl : function() {
      var model = this.__model;

      // test some wrong inputs
      this.assertException(function() {model.setUrl(1);}, qx.core.ValidationError, null, "A number is not an url!");
      this.assertException(function() {model.setUrl(false);}, qx.core.ValidationError, null, "A boolean is not an url!");
      this.assertException(function() {model.setUrl("i am an url");}, qx.core.ValidationError, null, "'i am an url' as a string is not an url!");
      this.assertException(function() {model.setUrl("http:/iamaurl");}, qx.core.ValidationError, null, "'http://iamaurl' is not an url!");

      // Test some working inputs
      model.setUrl("http://www.1und1.de");
      this.assertEquals("http://www.1und1.de", model.getUrl(), "http://www.1und1.de as string should work!");
      model.setUrl("http://web.de");
      this.assertEquals("http://web.de", model.getUrl(), "http://web.de as string should work!");
      model.setUrl("http://www.apple.com/de/");
      this.assertEquals("http://www.apple.com/de/", model.getUrl(), "http://www.apple.com/de/ as string should work!");
      model.setUrl("http://www.fake.url:8080/de/1546");
      this.assertEquals("http://www.fake.url:8080/de/1546", model.getUrl(), "http://www.fake.url:8080/de/1546 as string should work!");
    },

    testColor : function()
    {
      var model = this.__model;

      // test some wrong inputs
      this.assertException(function() {model.setColor(1);}, qx.core.ValidationError, null, "A number is not a color!");
      this.assertException(function() {model.setColor("");}, qx.core.ValidationError, null, "A empty string is not a color!");
      this.assertException(function() {model.setColor("FFFFFF");}, qx.core.ValidationError, null, "FFFFFF (missing #) is not a color!");
      this.assertException(function() {model.setColor("bluecolor");}, qx.core.ValidationError, null, "'bluecolor' is not a color!");
      this.assertException(function() {model.setColor("#FFFFGG");}, qx.core.ValidationError, null, "#FFFFGG is not a color!");

      // Test some working inputs
      model.setColor("black");
      this.assertEquals("black", model.getColor(), "black is a css color");
      model.setColor("#000000");
      this.assertEquals("#000000", model.getColor(), "#000000 is a RGB color");
      model.setColor("#FFFFFF");
      this.assertEquals("#FFFFFF", model.getColor(), "#FFFFFF is a css color");
    },


    testRange : function()
    {
      var model = this.__model;

      // test some wrong inputs (Rage defined from 1 to 2 including both)
      this.assertException(function() {model.setRange(0.999999999);}, qx.core.ValidationError, null, "A 0.999999999 is not between 1 and 2.");
      this.assertException(function() {model.setRange(2.000000001);}, qx.core.ValidationError, null, "A 2.000000001 is not between 1 and 2.");

      // Test some working inputs
      model.setRange(1);
      this.assertEquals(1, model.getRange(), "1 is in the range of 1 and 2.");
      model.setRange(2);
      this.assertEquals(2, model.getRange(), "2 is in the range of 1 and 2.");
      model.setRange(1.5);
      this.assertEquals(1.5, model.getRange(), "1.5 is in the range of 1 and 2.");
    },


    testInArray : function()
    {
      var model = this.__model;

      // test some wrong inputs (allowed are male and female)
      this.assertException(function() {model.setArray(0.999999999);}, qx.core.ValidationError, null, "A 0.999999999 is not in ['male', 'female']");
      this.assertException(function() {model.setArray("malle");}, qx.core.ValidationError, null, "'malle' is not in ['male', 'female']");
      this.assertException(function() {model.setArray("");}, qx.core.ValidationError, null, "A empty string is not in ['male', 'female']");

      // Test some working inputs
      model.setArray("male");
      this.assertEquals("male", model.getArray(), "male is in!");
      model.setArray("female");
      this.assertEquals("female", model.getArray(), "female is in!");
    },

    testCustom : function()
    {
      var model = this.__model;

      // test some wrong inputs (String must be longer than 3)
      this.assertException(function() {model.setCustom("");}, qx.core.ValidationError, null, "'' is too short");
      this.assertException(function() {model.setCustom("1");}, qx.core.ValidationError, null, "'1' is too short");
      this.assertException(function() {model.setCustom("12");}, qx.core.ValidationError, null, "'12' is too short");
      this.assertException(function() {model.setCustom("123");}, qx.core.ValidationError, null, "'123' is too short");

      // Test some working inputs
      model.setCustom("male");
      this.assertEquals("male", model.getCustom(), "male is long enough!");
    },



    testRegExp : function()
    {
      var model = this.__model;

      // test some wrong inputs (Only digits)
      this.assertException(function() {model.setRegExp("AFFE!");}, qx.core.ValidationError, null, "'AFFE!' does not fit /[0-9]*/.");
      this.assertException(function() {model.setRegExp("_dfds_");}, qx.core.ValidationError, null, "_dfds_ does not fit /[0-9]*/.");
      this.assertException(function() {model.setRegExp("$%&!&/%");}, qx.core.ValidationError, null, "$%&!&/% does not fit /[0-9]*/.");

      // Test some working inputs
      model.setRegExp("abc");
      this.assertEquals("abc", model.getRegExp(), "abc fits!");
      model.setRegExp("abcdefg");
      this.assertEquals("abcdefg", model.getRegExp(), "abcdefg fits!");
    }
  }
});
