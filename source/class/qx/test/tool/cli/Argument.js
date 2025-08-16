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

qx.Class.define("qx.test.tool.cli.Argument", {
  extend: qx.dev.unit.TestCase,

  members: {
    testBasicArgumentCreation() {
      let arg = new qx.tool.cli.Argument("input");
      this.assertEquals("input", arg.getName());
      this.assertEquals("string", arg.getType()); // default type
      this.assertFalse(arg.isArray());
      this.assertFalse(arg.isRequired());
      this.assertNull(arg.getValue());
    },

    testArgumentProperties() {
      let arg = new qx.tool.cli.Argument("input-file");
      arg.set({
        type: "string",
        description: "Input file path",
        required: true
      });
      
      this.assertEquals("inputFile", arg.getName()); // transformed to camelCase
      this.assertEquals("string", arg.getType());
      this.assertEquals("Input file path", arg.getDescription());
      this.assertTrue(arg.isRequired());
    },

    testStringArgument() {
      let arg = new qx.tool.cli.Argument("filename").set({
        type: "string"
      });
      
      function fnGetMore() {
        return null; // No additional arguments
      }
      
      arg.parse("test.txt", fnGetMore);
      this.assertEquals("test.txt", arg.getValue());
    },

    testStringArgumentWithEquals() {
      let arg = new qx.tool.cli.Argument("filename").set({
        type: "string"
      });
      
      function fnGetMore() {
        return null;
      }
      
      arg.parse("filename=test.txt", fnGetMore);
      this.assertEquals("test.txt", arg.getValue());
    },

    testBooleanArgument() {
      let arg = new qx.tool.cli.Argument("enable").set({
        type: "boolean"
      });
      
      function fnGetMore() {
        return null;
      }
      
      // Test various boolean values
      arg.parse("true", fnGetMore);
      this.assertTrue(arg.getValue());
      
      arg.setValue(null); // reset
      arg.parse("yes", fnGetMore);
      this.assertTrue(arg.getValue());
      
      arg.setValue(null); // reset
      arg.parse("1", fnGetMore);
      this.assertTrue(arg.getValue());
      
      arg.setValue(null); // reset
      arg.parse("false", fnGetMore);
      this.assertFalse(arg.getValue());
      
      arg.setValue(null); // reset
      arg.parse("no", fnGetMore);
      this.assertFalse(arg.getValue());
      
      arg.setValue(null); // reset
      arg.parse("0", fnGetMore);
      this.assertFalse(arg.getValue());
    },

    testBooleanArgumentInvalid() {
      let arg = new qx.tool.cli.Argument("enable").set({
        type: "boolean"
      });
      
      function fnGetMore() {
        return null;
      }
      
      this.assertException(() => {
        arg.parse("invalid", fnGetMore);
      }, Error, /Invalid value.*expected nothing.*or the words true or false/);
    },

    testIntegerArgument() {
      let arg = new qx.tool.cli.Argument("count").set({
        type: "integer"
      });
      
      function fnGetMore() {
        return null;
      }
      
      arg.parse("42", fnGetMore);
      this.assertEquals(42, arg.getValue());
      this.assertEquals("number", typeof arg.getValue());
    },

    testIntegerArgumentInvalid() {
      let arg = new qx.tool.cli.Argument("count").set({
        type: "integer"
      });
      
      function fnGetMore() {
        return null;
      }
      
      this.assertException(() => {
        arg.parse("invalid", fnGetMore);
      }, Error, /Invalid value.*expected an integer/);
    },

    testFloatArgument() {
      let arg = new qx.tool.cli.Argument("ratio").set({
        type: "float"
      });
      
      function fnGetMore() {
        return null;
      }
      
      arg.parse("3.14", fnGetMore);
      this.assertEquals(3.14, arg.getValue());
      this.assertEquals("number", typeof arg.getValue());
    },

    testFloatArgumentInvalid() {
      let arg = new qx.tool.cli.Argument("ratio").set({
        type: "float"
      });
      
      function fnGetMore() {
        return null;
      }
      
      this.assertException(() => {
        arg.parse("invalid", fnGetMore);
      }, Error, /Invalid value.*expected a number/);
    },

    testArrayArgument() {
      let arg = new qx.tool.cli.Argument("files").set({
        type: "string",
        array: true
      });
      
      let argIndex = 0;
      let args = ["file1.txt", "file2.txt", "file3.txt"];
      function fnGetMore(index, rebase) {
        if (rebase) {
          argIndex += index;
          return null;
        }
        return args[argIndex + index] || null;
      }
      
      arg.parse("initial.txt", fnGetMore);
      let values = arg.getValue();
      
      this.assertTrue(qx.lang.Type.isArray(values));
      this.assertEquals(4, values.length);
      this.assertEquals("initial.txt", values[0]);
      this.assertEquals("file1.txt", values[1]);
      this.assertEquals("file2.txt", values[2]);
      this.assertEquals("file3.txt", values[3]);
    },

    testArrayArgumentSingleValue() {
      let arg = new qx.tool.cli.Argument("files").set({
        type: "string",
        array: true
      });
      
      function fnGetMore(index, rebase) {
        if (rebase) {return null;}
        return null; // No additional arguments
      }
      
      arg.parse("single.txt", fnGetMore);
      let values = arg.getValue();
      
      this.assertTrue(qx.lang.Type.isArray(values));
      this.assertEquals(1, values.length);
      this.assertEquals("single.txt", values[0]);
    },

    testArrayArgumentEmpty() {
      let arg = new qx.tool.cli.Argument("files").set({
        type: "string",
        array: true
      });
      
      function fnGetMore() {
        return null;
      }
      
      this.assertException(() => {
        arg.parse(null, fnGetMore);
      }, Error, /Invalid value.*expected at least one value/);
    },

    testArgumentMatching() {
      let arg = new qx.tool.cli.Argument("input-file");
      
      this.assertTrue(arg.is("--input-file"));
      this.assertTrue(arg.is("--inputFile")); // camelCase
      this.assertFalse(arg.is("--other"));
    },

    testArgumentMatchingWithEquals() {
      let arg = new qx.tool.cli.Argument("output");
      
      this.assertTrue(arg.is("--output=file.txt"));
      this.assertFalse(arg.is("--other=value"));
    },

    testUsageGeneration() {
      let arg = new qx.tool.cli.Argument("input").set({
        type: "string",
        description: "Input file path"
      });
      
      let usage = arg.usage();
      
      this.assertMatch(usage, /input/);
      this.assertMatch(usage, /Input file path/);
      // String type should appear in usage since all types are shown
      this.assertTrue(/String/.test(usage));
    },

    testUsageGenerationNonStringType() {
      let arg = new qx.tool.cli.Argument("count").set({
        type: "integer",
        description: "Number of items"
      });
      
      let usage = arg.usage();
      
      this.assertMatch(usage, /count/);
      this.assertMatch(usage, /\(Integer\)/);
      this.assertMatch(usage, /Number of items/);
    },

    testUsageGenerationArray() {
      let arg = new qx.tool.cli.Argument("files").set({
        type: "string",
        array: true,
        description: "Input files"
      });
      
      let usage = arg.usage();
      
      this.assertMatch(usage, /files\.\.\./); // Array indicator
      this.assertMatch(usage, /Input files/);
    },

    testUsageGenerationArrayNonString() {
      let arg = new qx.tool.cli.Argument("numbers").set({
        type: "integer",
        array: true,
        description: "List of numbers"
      });
      
      let usage = arg.usage();
      
      this.assertMatch(usage, /numbers\.\.\./);
      this.assertMatch(usage, /\(Integers\)/); // Plural form
      this.assertMatch(usage, /List of numbers/);
    },

    testUsageNoName() {
      let arg = new qx.tool.cli.Argument().set({
        type: "string",
        description: "Unnamed argument"
      });
      
      let usage = arg.usage();
      
      this.assertMatch(usage, /Unnamed argument/);
      // The usage should contain the type and description
      this.assertTrue(usage.includes("String"));
      this.assertTrue(usage.includes("Unnamed argument"));
    },

    testHyphenatedName() {
      let arg = new qx.tool.cli.Argument("inputFile");
      this.assertEquals("input-file", arg.getHyphenatedName());
    },

    testToString() {
      let arg = new qx.tool.cli.Argument("input");
      arg.setDescription("Input file");
      this.assertEquals("input", arg.toString());
      
      let argNoName = new qx.tool.cli.Argument();
      argNoName.setDescription("Test description");
      this.assertEquals("Test description", argNoName.toString());
    },

    testParseWithMockGetMore() {
      let arg = new qx.tool.cli.Argument("files").set({
        type: "string",
        array: true
      });
      
      let argIndex = 0;
      let args = ["file2.txt", "file3.txt", null]; // null to stop iteration
      function mockGetMore(index, rebase) {
        if (rebase) {
          argIndex += index;
          return null;
        }
        return args[index] || null;
      }
      
      arg.parse("file1.txt", mockGetMore);
      let result = arg.getValue();
      
      this.assertTrue(qx.lang.Type.isArray(result));
      this.assertEquals(3, result.length);
      this.assertEquals("file1.txt", result[0]);
      this.assertEquals("file2.txt", result[1]);
      this.assertEquals("file3.txt", result[2]);
    },

    testParseWithIntegerArray() {
      let arg = new qx.tool.cli.Argument("numbers").set({
        type: "integer",
        array: true
      });
      
      let args = ["2", "3", "invalid"]; // invalid should stop parsing
      function mockGetMore(index, rebase) {
        if (rebase) {return null;}
        return args[index] || null;
      }
      
      arg.parse("1", mockGetMore);
      let result = arg.getValue();
      
      this.assertTrue(qx.lang.Type.isArray(result));
      this.assertEquals(3, result.length);
      this.assertEquals(1, result[0]);
      this.assertEquals(2, result[1]);
      this.assertEquals(3, result[2]);
      // "invalid" should not be included as it can't be parsed as integer
    }
  }
});