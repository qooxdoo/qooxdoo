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

qx.Class.define("qx.test.tool.cli.Flag", {
  extend: qx.dev.unit.TestCase,

  members: {
    testBasicFlagCreation() {
      let flag = new qx.tool.cli.Flag("verbose");
      this.assertEquals("verbose", flag.getName());
      this.assertNull(flag.getShortCode());
      this.assertNull(flag.getDescription());
      this.assertNull(flag.getValue());
    },

    testFlagProperties() {
      let flag = new qx.tool.cli.Flag("output-file");
      flag.set({
        type: "string",
        shortCode: "o",
        description: "Output file path",
        value: "default.txt"
      });
      
      this.assertEquals("outputFile", flag.getName()); // transformed to camelCase
      this.assertEquals("string", flag.getType());
      this.assertEquals("o", flag.getShortCode());
      this.assertEquals("Output file path", flag.getDescription());
      this.assertEquals("default.txt", flag.getValue());
    },

    testBooleanFlag() {
      let flag = new qx.tool.cli.Flag("verbose").set({
        type: "boolean"
      });
      
      // Test parsing boolean flag without value (should default to true)
      flag.parse("--verbose", () => null);
      this.assertTrue(flag.getValue());
    },

    testBooleanFlagWithValue() {
      let flag = new qx.tool.cli.Flag("debug").set({
        type: "boolean"
      });
      
      // Test parsing boolean flag with explicit true value
      flag.parse("--debug=true", () => null);
      this.assertTrue(flag.getValue());
      
      // Test parsing boolean flag with explicit false value
      flag.setValue(null); // reset
      flag.parse("--debug=false", () => null);
      this.assertFalse(flag.getValue());
      
      // Test parsing boolean flag with "yes" value
      flag.setValue(null); // reset
      flag.parse("--debug=yes", () => null);
      this.assertTrue(flag.getValue());
      
      // Test parsing boolean flag with "no" value
      flag.setValue(null); // reset
      flag.parse("--debug=no", () => null);
      this.assertFalse(flag.getValue());
    },

    testBooleanFlagInvalidValue() {
      let flag = new qx.tool.cli.Flag("debug").set({
        type: "boolean"
      });
      
      this.assertException(() => {
        flag.parse("--debug=invalid", () => null);
      }, Error, /Invalid value.*expected nothing.*or the words true or false/);
    },

    testStringFlag() {
      let flag = new qx.tool.cli.Flag("output").set({
        type: "string"
      });
      
      let argIndex = 0;
      let args = ["file.txt"];
      function fnGetMore(index) {
        return args[index] || null;
      }
      
      flag.parse("--output", fnGetMore);
      this.assertEquals("file.txt", flag.getValue());
    },

    testStringFlagWithEquals() {
      let flag = new qx.tool.cli.Flag("output").set({
        type: "string"
      });
      
      flag.parse("--output=filename.txt", () => null);
      this.assertEquals("filename.txt", flag.getValue());
    },

    testIntegerFlag() {
      let flag = new qx.tool.cli.Flag("count").set({
        type: "integer"
      });
      
      let args = ["42"];
      function fnGetMore(index) {
        return args[index] || null;
      }
      
      flag.parse("--count", fnGetMore);
      this.assertEquals(42, flag.getValue());
      this.assertEquals("number", typeof flag.getValue());
    },

    testIntegerFlagWithEquals() {
      let flag = new qx.tool.cli.Flag("port").set({
        type: "integer"
      });
      
      flag.parse("--port=8080", () => null);
      this.assertEquals(8080, flag.getValue());
    },

    testIntegerFlagInvalid() {
      let flag = new qx.tool.cli.Flag("count").set({
        type: "integer"
      });
      
      this.assertException(() => {
        flag.parse("--count=invalid", () => null);
      }, Error, /Invalid value.*expected an integer/);
    },

    testFloatFlag() {
      let flag = new qx.tool.cli.Flag("ratio").set({
        type: "float"
      });
      
      let args = ["3.14"];
      function fnGetMore(index) {
        return args[index] || null;
      }
      
      flag.parse("--ratio", fnGetMore);
      this.assertEquals(3.14, flag.getValue());
      this.assertEquals("number", typeof flag.getValue());
    },

    testFloatFlagInvalid() {
      let flag = new qx.tool.cli.Flag("ratio").set({
        type: "float"
      });
      
      this.assertException(() => {
        flag.parse("--ratio=invalid", () => null);
      }, Error, /Invalid value.*expected a number/);
    },

    testArrayFlag() {
      let flag = new qx.tool.cli.Flag("include").set({
        type: "string",
        array: true
      });
      
      let argIndex = 0;
      let args = ["path1", "path2", "path3"];
      function fnGetMore(index, rebase) {
        if (rebase) {
          argIndex += index;
          return null;
        }
        return args[argIndex + index] || null;
      }
      
      flag.parse("--include", fnGetMore);
      let values = flag.getValue();
      
      this.assertTrue(qx.lang.Type.isArray(values));
      this.assertEquals(3, values.length);
      this.assertEquals("path1", values[0]);
      this.assertEquals("path2", values[1]);
      this.assertEquals("path3", values[2]);
    },

    testArrayFlagSingleValue() {
      let flag = new qx.tool.cli.Flag("exclude").set({
        type: "string",
        array: true
      });
      
      let argIndex = 0;
      let args = ["single"];
      function fnGetMore(index, rebase) {
        if (rebase) {
          argIndex += index;
          return null;
        }
        return args[argIndex + index] || null;
      }
      
      flag.parse("--exclude", fnGetMore);
      let values = flag.getValue();
      
      this.assertTrue(qx.lang.Type.isArray(values));
      this.assertEquals(1, values.length);
      this.assertEquals("single", values[0]);
    },

    testArrayFlagEmpty() {
      let flag = new qx.tool.cli.Flag("tags").set({
        type: "string",
        array: true
      });
      
      this.assertException(() => {
        flag.parse("--tags", () => null);
      }, Error, /Invalid value.*expected at least one value/);
    },

    testFlagMatching() {
      let flag = new qx.tool.cli.Flag("verbose-output").set({
        shortCode: "v"
      });
      
      this.assertTrue(flag.is("--verbose-output"));
      this.assertTrue(flag.is("--verboseOutput")); // camelCase
      this.assertTrue(flag.is("-v"));
      this.assertFalse(flag.is("--other"));
      this.assertFalse(flag.is("-x"));
    },

    testFlagMatchingWithEquals() {
      let flag = new qx.tool.cli.Flag("output");
      
      this.assertTrue(flag.is("--output=file.txt"));
      this.assertFalse(flag.is("--other=value"));
    },

    testUsageGeneration() {
      let flag = new qx.tool.cli.Flag("verbose").set({
        type: "boolean",
        shortCode: "v",
        description: "Enable verbose output",
        value: false
      });
      
      let usage = flag.usage();
      
      this.assertMatch(usage, /--verbose\|-v/);
      this.assertMatch(usage, /Boolean/);
      this.assertMatch(usage, /\[default: false\]/);
      this.assertMatch(usage, /Enable verbose output/);
    },

    testUsageGenerationString() {
      let flag = new qx.tool.cli.Flag("output").set({
        type: "string",
        shortCode: "o",
        description: "Output file path"
      });
      
      let usage = flag.usage();
      
      this.assertMatch(usage, /--output\|-o/);
      this.assertMatch(usage, /\(String\)/);
      this.assertMatch(usage, /-/); // No default value indicator
      this.assertMatch(usage, /Output file path/);
    },

    testUsageGenerationArray() {
      let flag = new qx.tool.cli.Flag("include").set({
        type: "string",
        array: true,
        description: "Include paths"
      });
      
      let usage = flag.usage();
      
      this.assertMatch(usage, /--include/);
      this.assertMatch(usage, /\[String\]/); // Array notation
      this.assertMatch(usage, /Include paths/);
    },

    testUsageGenerationEnum() {
      let flag = new qx.tool.cli.Flag("level").set({
        type: ["debug", "info", "warn", "error"],
        description: "Log level"
      });
      
      let usage = flag.usage();
      
      this.assertMatch(usage, /--level/);
      this.assertMatch(usage, /\[debug,info,warn,error\]/);
      this.assertMatch(usage, /Log level/);
    },

    testEnumFlagValueSelection() {
      let flag = new qx.tool.cli.Flag("level").set({
        type: ["debug", "info", "warn", "error"],
        description: "Log level"
      });
      
      // Test valid values
      flag.parse("--level=debug", () => null);
      this.assertEquals("debug", flag.getValue());
      
      flag.setValue(null);
      flag.parse("--level=info", () => null);
      this.assertEquals("info", flag.getValue());
      
      flag.setValue(null);
      flag.parse("--level=warn", () => null);
      this.assertEquals("warn", flag.getValue());
      
      flag.setValue(null);
      flag.parse("--level=error", () => null);
      this.assertEquals("error", flag.getValue());
      
      // Test invalid value should throw error
      this.assertException(() => {
        flag.parse("--level=invalid", () => null);
      }, Error);
    },

    testHyphenatedName() {
      let flag = new qx.tool.cli.Flag("outputFile");
      this.assertEquals("output-file", flag.getHyphenatedName());
    },

    testToString() {
      let flag = new qx.tool.cli.Flag("verbose");
      flag.setDescription("Enable verbose output");
      this.assertEquals("verbose", flag.toString());
      
      let flagNoName = new qx.tool.cli.Flag();
      flagNoName.setDescription("Test description");
      this.assertEquals("Test description", flagNoName.toString());
    },

    testParseWithMockGetMore() {
      let flag = new qx.tool.cli.Flag("files").set({
        type: "string",
        array: true
      });
      
      let consumed = 0;
      function mockGetMore(index, rebase) {
        let values = ["file1.txt", "file2.txt", "--other-flag"];
        if (rebase) {
          consumed = index;
          return null;
        }
        let value = values[index];
        // Stop at next flag
        if (value && value.startsWith("-")) {
          return null;
        }
        return value || null;
      }
      
      flag.parse("--files", mockGetMore);
      let result = flag.getValue();
      
      this.assertTrue(qx.lang.Type.isArray(result));
      this.assertEquals(2, result.length);
      this.assertEquals("file1.txt", result[0]);
      this.assertEquals("file2.txt", result[1]);
      this.assertEquals(2, consumed); // Verify correct number of arguments were consumed
    },

    testArrayFlagWithCommaSeparatedValues() {
      let flag = new qx.tool.cli.Flag("array").set({
        type: "string",
        array: true
      });
      
      let consumed = 0;
      function mockGetMore(index, rebase) {
        let values = ["additional-arg"];
        if (rebase) {
          consumed = index;
          return null;
        }
        return values[index] || null;
      }
      
      flag.parse("--array=test,test2", mockGetMore);
      let values = flag.getValue();
      
      this.assertTrue(qx.lang.Type.isArray(values));
      this.assertEquals(2, values.length);
      this.assertEquals("test", values[0]);
      this.assertEquals("test2", values[1]);
      this.assertEquals(0, consumed); // Verify no additional arguments were consumed
    }
  }
});