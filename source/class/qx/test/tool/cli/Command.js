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

qx.Class.define("qx.test.tool.cli.Command", {
  extend: qx.dev.unit.TestCase,

  members: {
    testBasicCommandCreation() {
      let cmd = new qx.tool.cli.Command("test");
      this.assertEquals("test", cmd.getName());
      this.assertNull(cmd.getParent());
      this.assertNull(cmd.getDescription());
      this.assertNull(cmd.getRun());
    },

    testCommandProperties() {
      let cmd = new qx.tool.cli.Command("test-cmd");
      cmd.set({
        description: "Test command description",
        shortCode: "t"
      });
      
      this.assertEquals("testCmd", cmd.getName()); // transformed to camelCase
      this.assertEquals("Test command description", cmd.getDescription());
      this.assertEquals("t", cmd.getShortCode());
    },

    testAddFlag() {
      let cmd = new qx.tool.cli.Command("test");
      let flag = new qx.tool.cli.Flag("verbose").set({
        type: "boolean",
        description: "Enable verbose output"
      });
      
      cmd.addFlag(flag);
      
      this.assertEquals(flag, cmd.getFlag("verbose"));
      this.assertEquals(flag, cmd.getFlag("verbose")); // camelCase conversion
    },

    testAddFlagDuplicate() {
      let cmd = new qx.tool.cli.Command("test");
      let flag1 = new qx.tool.cli.Flag("verbose").set({type: "boolean"});
      let flag2 = new qx.tool.cli.Flag("verbose").set({type: "boolean"});
      
      cmd.addFlag(flag1);
      
      this.assertException(() => {
        cmd.addFlag(flag2);
      }, Error, "double flag: verbose");
    },

    testRemoveFlag() {
      let cmd = new qx.tool.cli.Command("test");
      let flag = new qx.tool.cli.Flag("verbose").set({type: "boolean"});
      
      cmd.addFlag(flag);
      this.assertEquals(flag, cmd.getFlag("verbose"));
      
      cmd.removeFlag("verbose");
      this.assertNull(cmd.getFlag("verbose"));
    },

    testAddArgument() {
      let cmd = new qx.tool.cli.Command("test");
      let arg = new qx.tool.cli.Argument("input").set({
        type: "string",
        required: true,
        description: "Input file"
      });
      
      cmd.addArgument(arg);
      
      this.assertEquals(arg, cmd.getArgument("input"));
      this.assertEquals(arg, cmd.getArgument(0)); // by index
    },

    testGetArgumentByIndex() {
      let cmd = new qx.tool.cli.Command("test");
      let arg1 = new qx.tool.cli.Argument("first").set({type: "string"});
      let arg2 = new qx.tool.cli.Argument("second").set({type: "string"});
      
      cmd.addArgument(arg1);
      cmd.addArgument(arg2);
      
      this.assertEquals(arg1, cmd.getArgument(0));
      this.assertEquals(arg2, cmd.getArgument(1));
      this.assertNull(cmd.getArgument(2));
    },

    testAddSubcommand() {
      let rootCmd = new qx.tool.cli.Command("root");
      let subCmd = new qx.tool.cli.Command("sub");
      
      rootCmd.addSubcommand(subCmd);
      
      this.assertEquals(rootCmd, subCmd.getParent());
    },

    testCommandMatching() {
      let cmd = new qx.tool.cli.Command("test-command");
      cmd.setShortCode("t");
      
      this.assertTrue(cmd.is("testCommand")); // camelCase name
      this.assertTrue(cmd.is("t")); // short code
      this.assertFalse(cmd.is("other"));
    },

    testParseSimpleFlags() {
      let cmd = new qx.tool.cli.Command("test");
      cmd.addFlag(new qx.tool.cli.Flag("verbose").set({type: "boolean"}));
      cmd.addFlag(new qx.tool.cli.Flag("output").set({type: "string"}));
      
      let result = cmd.parseRoot(["test", "--verbose", "--output", "file.txt"]);
      
      this.assertEquals(cmd, result);
      this.assertTrue(cmd.getFlag("verbose").getValue());
      this.assertEquals("file.txt", cmd.getFlag("output").getValue());
    },

    testParseArguments() {
      let cmd = new qx.tool.cli.Command("test");
      cmd.addArgument(new qx.tool.cli.Argument("input").set({type: "string"}));
      cmd.addArgument(new qx.tool.cli.Argument("output").set({type: "string"}));
      
      let result = cmd.parseRoot(["test", "input.txt", "output.txt"]);
      
      this.assertEquals(cmd, result);
      this.assertEquals("input.txt", cmd.getArgument("input").getValue());
      this.assertEquals("output.txt", cmd.getArgument("output").getValue());
    },

    testParseFlagsAndArguments() {
      let cmd = new qx.tool.cli.Command("test");
      cmd.addFlag(new qx.tool.cli.Flag("verbose").set({type: "boolean"}));
      cmd.addArgument(new qx.tool.cli.Argument("input").set({type: "string"}));
      
      let result = cmd.parseRoot(["test", "--verbose", "input.txt"]);
      
      this.assertEquals(cmd, result);
      this.assertTrue(cmd.getFlag("verbose").getValue());
      this.assertEquals("input.txt", cmd.getArgument("input").getValue());
    },

    testParseSubcommand() {
      let rootCmd = new qx.tool.cli.Command("root");
      let subCmd = new qx.tool.cli.Command("sub");
      subCmd.addFlag(new qx.tool.cli.Flag("flag").set({type: "boolean"}));
      
      rootCmd.addSubcommand(subCmd);
      
      let result = rootCmd.parseRoot(["root", "sub", "--flag"]);
      
      this.assertEquals(subCmd, result);
      this.assertTrue(subCmd.getFlag("flag").getValue());
    },

    testParseWithHelpFlag() {
      let cmd = new qx.tool.cli.Command("test");
      cmd.addArgument(new qx.tool.cli.Argument("required").set({
        type: "string", 
        required: true
      }));
      
      // Help flag should bypass required argument validation
      let result = cmd.parseRoot(["test", "--help"]);
      
      this.assertEquals(cmd, result);
      this.assertTrue(cmd.getFlag("help").getValue());
      this.assertNull(cmd.getErrors()); // No errors despite missing required arg
    },

    testParseMissingRequiredArgument() {
      let cmd = new qx.tool.cli.Command("test");
      cmd.addArgument(new qx.tool.cli.Argument("required").set({
        type: "string",
        required: true
      }));
      
      let result = cmd.parseRoot(["test"]);
      
      this.assertEquals(cmd, result);
      this.assertNotNull(cmd.getErrors());
      this.assertTrue(cmd.getErrors().length > 0);
      this.assertMatch(cmd.getErrors()[0], /Not enough positional arguments/);
    },

    testParseUnrecognizedFlag() {
      let cmd = new qx.tool.cli.Command("test");
      
      let result = cmd.parseRoot(["test", "--unknown"]);
      
      this.assertEquals(cmd, result);
      this.assertNotNull(cmd.getErrors());
      this.assertTrue(cmd.getErrors().length > 0);
      this.assertMatch(cmd.getErrors()[0], /Unrecognised flag --unknown/);
    },

    testGetValues() {
      let cmd = new qx.tool.cli.Command("test");
      cmd.addFlag(new qx.tool.cli.Flag("verbose").set({type: "boolean"}));
      cmd.addFlag(new qx.tool.cli.Flag("output-file").set({type: "string"}));
      cmd.addArgument(new qx.tool.cli.Argument("input").set({type: "string"}));
      
      cmd.parseRoot(["test", "--verbose", "--output-file", "out.txt", "in.txt"]);
      
      let values = cmd.getValues();
      
      // Test flags
      this.assertTrue(values.flags.verbose);
      this.assertTrue(values.flags["verbose"]);
      this.assertEquals("out.txt", values.flags.outputFile);
      this.assertEquals("out.txt", values.flags["output-file"]);
      
      // Test arguments
      this.assertEquals("in.txt", values.arguments[0]);
      
      // Test argv format
      this.assertTrue(values.argv.verbose);
      this.assertEquals("out.txt", values.argv.outputFile);
      this.assertEquals("out.txt", values.argv["output-file"]);
      this.assertEquals("in.txt", values.argv.input);
    },

    testParseDoubleDash() {
      let cmd = new qx.tool.cli.Command("test");
      cmd.addFlag(new qx.tool.cli.Flag("verbose").set({type: "boolean"}));
      cmd.addArgument(new qx.tool.cli.Argument("files").set({
        type: "string",
        array: true
      }));
      
      // Everything after -- should be treated as positional arguments
      let result = cmd.parseRoot(["test", "--verbose", "--", "--not-a-flag", "file.txt"]);
      
      this.assertEquals(cmd, result);
      this.assertTrue(cmd.getFlag("verbose").getValue());
      let files = cmd.getArgument("files").getValue();
      this.assertTrue(qx.lang.Type.isArray(files));
      this.assertEquals(2, files.length);
      this.assertEquals("--not-a-flag", files[0]);
      this.assertEquals("file.txt", files[1]);
    },

    testUsageGeneration() {
      let cmd = new qx.tool.cli.Command("test");
      cmd.set({
        description: "Test command for unit testing"
      });
      cmd.addFlag(new qx.tool.cli.Flag("verbose").set({
        type: "boolean",
        shortCode: "v",
        description: "Enable verbose output"
      }));
      cmd.addArgument(new qx.tool.cli.Argument("input").set({
        type: "string",
        description: "Input file path"
      }));
      
      let usage = cmd.usage();
      
      this.assertMatch(usage, /USAGE:/);
      this.assertMatch(usage, /test.*\[FLAGS\].*\[ARGUMENTS\]/);
      this.assertMatch(usage, /Test command for unit testing/);
      this.assertMatch(usage, /FLAGS:/);
      this.assertMatch(usage, /--verbose\|-v.*Boolean.*Enable verbose output/);
      this.assertMatch(usage, /ARGUMENTS:/);
      this.assertMatch(usage, /input.*String.*Input file path/);
    },

    testToString() {
      let cmd = new qx.tool.cli.Command("test-command");
      this.assertEquals("testCommand", cmd.toString());
    },

    testParseCombinedBooleanFlags() {
      let cmd = new qx.tool.cli.Command("test");
      cmd.addFlag(new qx.tool.cli.Flag("force").set({
        type: "boolean",
        shortCode: "f"
      }));
      cmd.addFlag(new qx.tool.cli.Flag("debug").set({
        type: "boolean", 
        shortCode: "d"
      }));
      
      let result = cmd.parseRoot(["test", "-fd"]);
      
      this.assertEquals(cmd, result);
      this.assertTrue(cmd.getFlag("force").getValue());
      this.assertTrue(cmd.getFlag("debug").getValue());
    },

    testParseCombinedFlagsWithNonBoolean() {
      let cmd = new qx.tool.cli.Command("test");
      cmd.addFlag(new qx.tool.cli.Flag("verbose").set({
        type: "boolean",
        shortCode: "v"
      }));
      cmd.addFlag(new qx.tool.cli.Flag("output").set({
        type: "string",
        shortCode: "o"
      }));
      
      // Should fail because 'o' is not a boolean flag
      let result = cmd.parseRoot(["test", "-vo"]);
      
      this.assertEquals(cmd, result);
      this.assertNotNull(cmd.getErrors());
      this.assertTrue(cmd.getErrors().length > 0);
      this.assertMatch(cmd.getErrors()[0], /Unrecognised flag -vo/);
    },

    testParseCombinedFlagsInvalidShortCode() {
      let cmd = new qx.tool.cli.Command("test");
      cmd.addFlag(new qx.tool.cli.Flag("force").set({
        type: "boolean",
        shortCode: "f"
      }));
      
      // Should fail because 'x' is not a valid short code
      let result = cmd.parseRoot(["test", "-fx"]);
      
      this.assertEquals(cmd, result);
      this.assertNotNull(cmd.getErrors());
      this.assertTrue(cmd.getErrors().length > 0);
      this.assertMatch(cmd.getErrors()[0], /Unrecognised flag -fx/);
    },

    testParseCreateCommandNonInteractive() {
      let cmd = new qx.tool.cli.Command("create");
      
      cmd.addArgument(
        new qx.tool.cli.Argument("application_namespace").set({
          description: "application namespace",
          required: true,
          type: "string"
        })
      );

      // Add flags similar to qx create command
      cmd.addFlag(new qx.tool.cli.Flag("noninteractive").set({
        type: "boolean",
        shortCode: "I",
        description: "Do not prompt for missing values",
        value: false
      }));
      cmd.addFlag(new qx.tool.cli.Flag("type").set({
        type: "string",
        shortCode: "t",
        description: "Type of the application to create"
      }));
      cmd.addFlag(new qx.tool.cli.Flag("theme").set({
        type: "string",
        description: "The name of the theme to be used"
      }));
      cmd.addFlag(new qx.tool.cli.Flag("icontheme").set({
        type: "string", 
        description: "The name of the icon theme to be used"
      }));
      
      let result = cmd.parseRoot(["create", "TestApp", "--noninteractive", "--type=desktop", "--theme=indigo", "--icontheme=Tango"]);
      
      this.assertEquals(cmd, result);
      this.assertEquals("TestApp", cmd.getArgument("applicationNamespace").getValue());
      this.assertTrue(cmd.getFlag("noninteractive").getValue());
      this.assertEquals("desktop", cmd.getFlag("type").getValue());
      this.assertEquals("indigo", cmd.getFlag("theme").getValue());
      this.assertEquals("Tango", cmd.getFlag("icontheme").getValue());
    }
  }
});