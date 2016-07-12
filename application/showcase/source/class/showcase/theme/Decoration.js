/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
qx.Theme.define("showcase.theme.Decoration",
{
  extend : qx.theme.indigo.Decoration,

  include : [
    showcase.page.theme.calc.theme.Decoration
  ],

  decorations :
  {
    "previewlist-scrollbar-knob" :
    {
      style :
      {
        radius: 10,
        backgroundColor: "#1C1C1C"
      }
    }
  }
});
