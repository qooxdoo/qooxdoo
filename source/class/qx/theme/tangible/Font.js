/* ************************************************************************

  Tangible Theme for Qooxdoo

  Copyright:
     2018 IT'IS Foundation
     2020 Tobi Oetiker

  License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

  Authors:
    * Tobias Oetiker (oetiker)

  Origin:
    This theme is based in large parts on the osparc.theme

************************************************************************ */

/**
 * The simple qooxdoo font theme.
 *
 * @usefont(Roboto)
 * @usefont(Roboto Mono)
 */
qx.Theme.define("qx.theme.tangible.Font", {
  fonts: {
    default: {
      size: 14,
      family: ["sans-serif"],
      color: "text-primary-on-surface",
      fontName: "Roboto"
    },

    bold: {
      size: 14,
      family: ["sans-serif"],
      bold: true,
      color: "text-primary-on-surface",
      fontName: "Roboto"
    },

    headline: {
      size: 24,
      family: ["sans-serif"],
      color: "text-primary-on-surface",
      fontName: "Roboto"
    },

    small: {
      size: 12,
      family: ["sans-serif"],
      color: "text-primary-on-surface",
      fontName: "Roboto"
    },

    monospace: {
      size: 14,
      family: ["monospace"],
      color: "text-primary-on-surface",
      fontName: "Roboto Mono"
    }
  }
});
