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
 * Test appearance theme that extends the Simple appearance theme with
 * test-specific appearances.
 */
qx.Theme.define("qx.test.theme.SimpleAppearance", {
  extend: qx.theme.simple.Appearance,
  include: [qx.test.MAppearance]
});
