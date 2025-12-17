// Test fixture for class name replacement
// This compile.js file contains old v7 class references that should be migrated

/**
 * Example configuration that references old CLI classes.
 * In v7, these classes were under qx.tool.cli.commands
 * In v8, they moved to qx.tool.compiler.cli.commands
 */

// Store references to commands for later use
// Old v7 pattern: qx.tool.cli.commands.Package
// Old v7 pattern: qx.tool.cli.ConfigDb
// Old v7 pattern: qx.tool.cli.commands.Test

module.exports = {
  /**
   * @type {qx.tool.cli.commands.Package}
   */
  packageCommand: "qx.tool.cli.commands.Package",

  /**
   * @type {qx.tool.cli.ConfigDb}
   */
  configDb: "qx.tool.cli.ConfigDb"
};
