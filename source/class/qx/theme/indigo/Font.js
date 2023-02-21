/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Martin Wittemann (martinwittemann)

************************************************************************* */

/* ************************************************************************


************************************************************************* */

/**
 * The simple qooxdoo font theme.
 *
 * @usefont(JosefinSlab)
 * @usefont(qx.theme.indigo.defaultFont)
 * @usefont(qx.theme.monospace)
 */
qx.Theme.define("qx.theme.indigo.Font", {
  fonts: {
    default: {
      size: 12,
      fontName: "qx.theme.indigo.defaultFont",
      color: "font",
      lineHeight: 1.8
    },

    bold: {
      size: 12,
      fontName: "qx.theme.indigo.defaultFont",
      bold: true,
      color: "font",
      lineHeight: 1.8
    },

    headline: {
      size: 22,
      family: ["serif"],
      fontName: "JosefinSlab"
    },

    small: {
      size: 11,
      fontName: "qx.theme.indigo.defaultFont",
      color: "font",
      lineHeight: 1.8
    },

    monospace: {
      size: 11,
      fontName: "qx.theme.monospace",
      color: "font",
      lineHeight: 1.8
    }
  }
});
