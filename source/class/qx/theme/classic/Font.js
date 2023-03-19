/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)

************************************************************************* */

/**
 * The classic qooxdoo font theme.
 *
 * @usefont(qx.theme.classic.defaultFont)
 * @usefont(qx.theme.monospace)
 */
qx.Theme.define("qx.theme.classic.Font", {
  fonts: {
    default: {
      size: 11,
      lineHeight: 1.4,
      fontName: "qx.theme.classic.defaultFont"
    },

    bold: {
      size: 11,
      lineHeight: 1.4,
      fontName: "qx.theme.classic.defaultFont",
      bold: true
    },

    small: {
      size: 10,
      lineHeight: 1.4,
      fontName: "qx.theme.classic.defaultFont"
    },

    monospace: {
      size: 11,
      lineHeight: 1.4,
      fontName: "qx.theme.monospace"
    }
  }
});
