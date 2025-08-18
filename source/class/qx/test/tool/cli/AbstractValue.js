/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2025 Henner Kollmann

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Henner Kollmann (Henner.Kollmann@gmx.de, @hkollmann)

************************************************************************ */

qx.Class.define("qx.test.tool.cli.AbstractValue", {
  extend: qx.dev.unit.TestCase,

  members: {
    // Test concrete implementation using Flag since AbstractValue is abstract
    testBasicProperties() {
      let value = new qx.tool.cli.Flag("test-name");
      value.set({
        description: "Test description",
        type: "string",
        required: true,
        array: false
      });
      
      this.assertEquals("testName", value.getName()); // transformed to camelCase
      this.assertEquals("Test description", value.getDescription());
      this.assertEquals("string", value.getType());
      this.assertTrue(value.isRequired());
      this.assertFalse(value.isArray());
    },

    testNameTransformation() {
      let value = new qx.tool.cli.Flag("kebab-case-name");
      this.assertEquals("kebabCaseName", value.getName());
      
      let value2 = new qx.tool.cli.Flag("snake_case_name");
      this.assertEquals("snakeCaseName", value2.getName());
      
      let value3 = new qx.tool.cli.Flag("camelCaseName");
      this.assertEquals("camelCaseName", value3.getName());
    },

    testTypeValidation() {
      let value = new qx.tool.cli.Flag("test");
      
      // Valid types
      value.setType("string");
      this.assertEquals("string", value.getType());
      
      value.setType("boolean");
      this.assertEquals("boolean", value.getType());
      
      value.setType("integer");
      this.assertEquals("integer", value.getType());
      
      value.setType("float");
      this.assertEquals("float", value.getType());
      
      value.setType(null);
      this.assertNull(value.getType());
    },

    testTypeValidationArray() {
      let value = new qx.tool.cli.Flag("test");
      
      // Array types should be valid
      value.setType(["option1", "option2", "option3"]);
      this.assertTrue(qx.lang.Type.isArray(value.getType()));
      this.assertEquals(3, value.getType().length);
    },

    testCheckFunction() {
      let value = new qx.tool.cli.Flag("test");
      
      // Custom check function
      value.setCheck(val => val !== "forbidden");
      
      // Valid value should work
      value.setValue("allowed");
      this.assertEquals("allowed", value.getValue());
      
      // Invalid value should be rejected
      this.assertException(() => {
        value.setValue("forbidden");
      });
    },

    testValueProperty() {
      let value = new qx.tool.cli.Flag("test");
      
      value.setValue("test-value");
      this.assertEquals("test-value", value.getValue());
      
      value.setValue(null);
      this.assertNull(value.getValue());
      
      value.setValue(42);
      this.assertEquals(42, value.getValue());
    },

    testHyphenatedName() {
      let value = new qx.tool.cli.Flag("camelCaseName");
      this.assertEquals("camel-case-name", value.getHyphenatedName());
      
      let value2 = new qx.tool.cli.Flag("simple");
      this.assertEquals("simple", value2.getHyphenatedName());
      
      let value3 = new qx.tool.cli.Flag("multiWordTestName");
      this.assertEquals("multi-word-test-name", value3.getHyphenatedName());
    },

    testIsMethod() {
      let value = new qx.tool.cli.Flag("outputFile");
      value.setShortCode("o");
      
      // Test long form matching
      this.assertTrue(value.is("--output-file"));
      this.assertTrue(value.is("--outputFile")); // camelCase should work too
      
      // Test short form matching
      this.assertTrue(value.is("-o"));
      
      // Test with equals
      this.assertTrue(value.is("--output-file=value"));
      this.assertTrue(value.is("-o=value"));
      
      // Test non-matching
      this.assertFalse(value.is("--other"));
      this.assertFalse(value.is("-x"));
      this.assertFalse(value.is("plain-text"));
    },

    testIsMethodWithoutShortCode() {
      let value = new qx.tool.cli.Flag("verbose");
      // No short code set
      
      this.assertTrue(value.is("--verbose"));
      this.assertFalse(value.is("-v")); // No short code
      this.assertFalse(value.is("--other"));
    },

    testToString() {
      let value = new qx.tool.cli.Flag("testName");
      this.assertEquals("testName", value.toString());
      
      // With description but no name
      let value2 = new qx.tool.cli.Flag();
      value2.setDescription("Test description");
      this.assertEquals("Test description", value2.toString());
      
      // No name or description should fall back to classname
      let value3 = new qx.tool.cli.Flag();
      this.assertEquals("qx.tool.cli.Flag", value3.toString());
    },

    testErrorHandling() {
      let value = new qx.tool.cli.Flag("test");
      
      // Initially no errors
      this.assertNull(value.getErrors());
      
      // Add error messages
      value._error("First error");
      value._error("Second error");
      
      let errors = value.getErrors();
      this.assertNotNull(errors);
      this.assertEquals(2, errors.length);
      this.assertEquals("First error", errors[0]);
      this.assertEquals("Second error", errors[1]);
    },

    testConstructorWithName() {
      let value = new qx.tool.cli.Flag("initial-name");
      this.assertEquals("initialName", value.getName());
    },

    testConstructorWithoutName() {
      let value = new qx.tool.cli.Flag();
      this.assertNull(value.getName());
    },

    testParseMethodAbstract() {
      // AbstractValue should not be instantiable since it's abstract
      this.assertException(() => {
        new qx.tool.cli.AbstractValue("test");
      }, Error, /abstract.*instantiate/);
    },

    testTypeValidationInDebugMode() {
      // This test assumes qx.debug is enabled
      if (!qx.core.Environment.get("qx.debug")) {
        this.skip("Debug mode not enabled");
        return;
      }
      
      let value = new qx.tool.cli.Flag("test");
      
      // Should throw assertion error for invalid type in debug mode
      this.assertException(() => {
        value.setType("invalid-type");
      });
    },

    testRequiredProperty() {
      let value = new qx.tool.cli.Flag("test");
      
      this.assertFalse(value.isRequired()); // default
      
      value.setRequired(true);
      this.assertTrue(value.isRequired());
      
      value.setRequired(false);
      this.assertFalse(value.isRequired());
    },

    testArrayProperty() {
      let value = new qx.tool.cli.Flag("test");
      
      this.assertFalse(value.isArray()); // default
      
      value.setArray(true);
      this.assertTrue(value.isArray());
      
      value.setArray(false);
      this.assertFalse(value.isArray());
    },

    testInitialValueProperty() {
      let value = new qx.tool.cli.Flag("test");
      
      // Default value should be null
      this.assertNull(value.getValue());
    },

    testValueValidationWithCheck() {
      let value = new qx.tool.cli.Flag("test");
      
      // Custom validator that only allows positive numbers
      value.setCheck(val => val === null || (typeof val === "number" && val > 0));
      
      // Valid values
      value.setValue(null);
      this.assertNull(value.getValue());
      
      value.setValue(5);
      this.assertEquals(5, value.getValue());
      
      value.setValue(0.1);
      this.assertEquals(0.1, value.getValue());
      
      // Invalid values should throw
      this.assertException(() => {
        value.setValue(-1);
      });
      
      this.assertException(() => {
        value.setValue(0);
      });
      
      this.assertException(() => {
        value.setValue("string");
      });
    }
  }
});