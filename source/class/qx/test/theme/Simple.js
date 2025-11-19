/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2025 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Claude Code (AI Assistant)

************************************************************************ */

/**
 * Test theme that extends the Simple theme with test-specific decorations
 * and appearances. This keeps the production Simple theme clean while
 * providing test-specific styling for the test runner.
 */
qx.Theme.define("qx.test.theme.Simple", {
  title: "Simple Test Theme",

  meta: {
    color: qx.theme.simple.Color,
    decoration: qx.test.theme.SimpleDecoration,
    font: qx.theme.simple.Font,
    icon: qx.theme.icon.Tango,
    appearance: qx.test.theme.SimpleAppearance
  }
});
