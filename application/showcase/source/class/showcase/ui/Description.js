/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("showcase.ui.Description",
{
  extend : qx.ui.basic.Label,

  construct : function()
  {
    this.base(arguments);
    // this.__loadCss();

    this.setRich(true);
    this.setSelectable(true);
  },

  properties :
  {
    appearance :
    {
      refine: true,
      init: "description"
    },

    allowGrowX :
    {
      refine: true,
      init: false
    },

    nativeContextMenu :
    {
      init : true,
      refine : true
    },

    allowGrowY :
    {
      refine: true,
      init: true
    }
  },

  members :
  {
    __loadCss : function()
    {
      var code = [
        "#description {",
        '  font-family: Verdana,"Bitstream Vera Sans","Lucida Grande",Tahoma,"Lucida Sans Unicode",Arial,sans-serif;',
        "  color: #444444;",
        "  font-size: 12px;",
        "  line-height: 140%;",
        "  padding-left: 10px;",
        "}",

        "#description a {",
        "  text-decoration: underline;",
        "  color: #444444;",
        "}",

        "#description a:hover, #description a:active {",
        "  color: #83B300;",
        "}",

        "#description h2 {",
        "  color: rgb(131, 179, 0);",
        "  padding: 10px 0px 5px 0px;",
        "  font-size: 15px;",
        "  font-weight: bold;",
        "}",

        "#description h1 {",
        "  font-size: 24px;",
        "  line-height: 130%;",
        "  margin: 10px 0 4px 0;",
        "  color: rgb(16, 66, 117);",
        "  font-weight: bold;",
        "}",

        "#description ul {",
        "  padding-left: 20px;",
        "}",

        "#description li {",
        "  color: #444444;",
        "}",

        "#i18n td {",
        "  font-size: 10px;",
        "}"
      ];
      qx.bom.Stylesheet.createElement(code.join("\n"));
    }
  }
});