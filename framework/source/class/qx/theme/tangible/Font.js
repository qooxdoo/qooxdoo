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
 * @asset(qx/font/Roboto/*.woff)
 * @asset(qx/font/Roboto/*.woff2)
 * @asset(qx/font/Roboto/*.eot)
 * @asset(qx/font/Roboto/*.ttf)
 */
/**
 * The simple qooxdoo font theme.
 */
qx.Theme.define("qx.theme.tangible.Font", {
  fonts: {
    "default": {
      size: 14,
      family: ["sans-serif"],
      color: "text-primary-on-surface",
      sources: [
        {
          family: "Roboto",
          source: [
            "qx/font/Roboto/roboto-v18-latin_latin-ext-regular.eot",
            "qx/font/Roboto/roboto-v18-latin_latin-ext-regular.woff2",
            "qx/font/Roboto/roboto-v18-latin_latin-ext-regular.woff",
            "qx/font/Roboto/roboto-v18-latin_latin-ext-regular.ttf"
          ]
        }
      ]
    },

    "bold":
      {
        size: 14,
        family: ["sans-serif"],
        bold: true,
        color: "text-primary-on-surface",
        sources: [
          {
            family: "Roboto",
            source: [
              "qx/font/Roboto/roboto-v18-latin_latin-ext-700.eot",
              "qx/font/Roboto/roboto-v18-latin_latin-ext-700.woff2",
              "qx/font/Roboto/roboto-v18-latin_latin-ext-700.woff",
              "qx/font/Roboto/roboto-v18-latin_latin-ext-700.ttf"
            ]
          }
        ]
      },

    "headline":
      {
        size: 24,
        family: ["sans-serif"],
        color: "text-primary-on-surface",
        sources: [
          {
            family: "Roboto",
            source: [
              "qx/font/Roboto/roboto-v18-latin_latin-ext-regular.eot",
              "qx/font/Roboto/roboto-v18-latin_latin-ext-regular.woff2",
              "qx/font/Roboto/roboto-v18-latin_latin-ext-regular.woff",
              "qx/font/Roboto/roboto-v18-latin_latin-ext-regular.ttf"
            ]
          }
        ]
      },

    "small":
      {
        size: 12,
        family: ["sans-serif"],
        color: "text-primary-on-surface",
        sources: [
          {
            family: "Roboto",
            source: [
              "qx/font/Roboto/roboto-v18-latin_latin-ext-regular.eot",
              "qx/font/Roboto/roboto-v18-latin_latin-ext-regular.woff2",
              "qx/font/Roboto/roboto-v18-latin_latin-ext-regular.woff",
              "qx/font/Roboto/roboto-v18-latin_latin-ext-regular.ttf"
            ]
          }
        ]
      },

    "monospace":
      {
        size: 14,
        family: ["monospace"],
        color: "text-primary-on-surface",
        sources: [
          {
            family: "Roboto Mono",
            source: [
              "qx/font/Roboto/roboto-mono-v6-latin_latin-ext-regular.eot",
              "qx/font/Roboto/roboto-mono-v6-latin_latin-ext-regular.woff2",
              "qx/font/Roboto/roboto-mono-v6-latin_latin-ext-regular.woff",
              "qx/font/Roboto/roboto-mono-v6-latin_latin-ext-regular.ttf"
            ]
          }
        ]
      }
  }
});
