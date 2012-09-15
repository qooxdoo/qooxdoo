/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

************************************************************************ */


qx.Class.define("qx.test.util.Validate",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testNumber : function()
    {
      //The number is valid if an error isn't raised
      qx.util.Validate.number()(2);

      //ValidationError raised if not a number
      this.assertException(function() {
        qx.util.Validate.number()("not a number");
      }, qx.core.ValidationError);

      // ValidationError raised with a custom message
      this.assertException(function() {
        qx.util.Validate.number("Custom Error Message")("not a number");
      }, qx.core.ValidationError, "Custom Error Message");
    },

    testEmail : function()
    {
      //The email is valid if an error isn't raised
      qx.util.Validate.email()("an@email.ro");

      //ValidationError raised if not an email
      this.assertException(function() {
        qx.util.Validate.email()("not an email");
      }, qx.core.ValidationError);

      // ValidationError raised with a custom message
      this.assertException(function() {
        qx.util.Validate.email("Custom Error Message")("not an email");
      }, qx.core.ValidationError, "Custom Error Message");
    },

    testString : function()
    {
      //The string is valid if an error isn't raised
      qx.util.Validate.string()("I'm a string");

      //ValidationError raised if not a string
      this.assertException(function() {
        qx.util.Validate.string()(1);
      }, qx.core.ValidationError);

      // ValidationError raised with a custom message
      this.assertException(function() {
        qx.util.Validate.string("Custom Error Message")(1);
      }, qx.core.ValidationError, "Custom Error Message");
    },

    testUrl : function()
    {
      //The url is valid if an error isn't raised
      qx.util.Validate.url()("http://anurl.ro");

      //ValidationError raised if not an url
      this.assertException(function() {
        qx.util.Validate.url()("not an url");
      }, qx.core.ValidationError);

      // ValidationError raised with a custom message
      this.assertException(function() {
        qx.util.Validate.url("Custom Error Message")("not an url");
      }, qx.core.ValidationError, "Custom Error Message");
    },

    testColor : function()
    {
      //The color value is valid if an error isn't raised
      qx.util.Validate.color()("#667788");

      //ValidationError raised if not a color value
      this.assertException(function() {
        qx.util.Validate.color()("not a color value");
      }, qx.core.ValidationError);

      // ValidationError raised with a custom message
      this.assertException(function() {
        qx.util.Validate.color("Custom Error Message")("not a color value");
      }, qx.core.ValidationError, "Custom Error Message");
    },

    testRange : function()
    {
      //The value is valid if it's in the range
      qx.util.Validate.range(2,4)(3);

      //ValidationError raised if the value isn't in the range
      this.assertException(function() {
        qx.util.Validate.range(2,4)(5);
      }, qx.core.ValidationError);

      // ValidationError raised with a custom message
      this.assertException(function() {
        qx.util.Validate.range(2,4,"Custom Error Message")(5);
      }, qx.core.ValidationError, "Custom Error Message");
    },

    testInArray : function()
    {
      //The value is valid if it's in the range
      qx.util.Validate.inArray([2,3])(3);

      //ValidationError raised if the value isn't in array
      this.assertException(function() {
        qx.util.Validate.inArray([2,3])(4);
      }, qx.core.ValidationError);

      // ValidationError raised with a custom message
      this.assertException(function() {
        qx.util.Validate.inArray([2,3],"Custom Error Message")(4);
      }, qx.core.ValidationError, "Custom Error Message");
    },

    testRegex : function()
    {
      var validator = qx.util.Validate.regExp(/^\dand\d$/);
      validator("1and1");

      //ValidationError raised if the value isn't in array
      this.assertException(function() {
        validator("oneandone");
      }, qx.core.ValidationError, /oneandone/g);

      //ValidationError raised if the value isn't in array
      this.assertException(function() {
        validator("xyz");
      }, qx.core.ValidationError, /xyz/g);

      // ValidationError raised with a custom message
      this.assertException(function() {
        qx.util.Validate.regExp(/^\dand\d$/,"Custom Error Message")("oneandone");
      }, qx.core.ValidationError, "Custom Error Message");
    }
  }
});

