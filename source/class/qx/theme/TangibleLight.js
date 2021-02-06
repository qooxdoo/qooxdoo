/* ************************************************************************

  OSparc Dark Theme for Qooxdoo

  Copyright:
     2018 IT'IS Foundation

  License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

  Authors:
    * Tobias Oetiker (oetiker)

  Origin:
    This theme is based in large parts on the osparc.theme
************************************************************************ */
/**
 * Tangible Theme (Light)
 *
 * The tangible theme is inspired by ideas from material design. A lot of work went into designing a higly automated color
 * system. In order to customize the theme to your taste, simply create your own color system. Use qx.theme.tangible.ColorLight for inspiration.
 *
 * The Tangible Theme is very new and still in a state of flux. PRs highly welcome. Use https://material.io as a visual guide.
 * 
 */
qx.Theme.define("qx.theme.TangibleLight", {
  title: "Tangible Light Theme",
  meta: {
    color: qx.theme.tangible.ColorLight,
    decoration: qx.theme.tangible.Decoration,
    font: qx.theme.tangible.Font,
    appearance: qx.theme.tangible.Appearance,
    icon: qx.theme.icon.Tango
  }
});
