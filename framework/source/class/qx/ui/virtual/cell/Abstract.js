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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/* ************************************************************************
#require(qx.bom.Stylesheet)
************************************************************************ */

qx.Class.define("qx.ui.virtual.cell.Abstract", 
{
  type : "abstract",
  extend : qx.core.Object,
  implement : qx.ui.virtual.cell.ICell,

  construct : function()
  {

    var cr = qx.ui.virtual.cell.Abstract;
    if (!cr.__style)
    {
      cr.__style = this.self(arguments);
      var stylesheet =
        ".qx-cell {" +
        qx.bom.element.Style.compile(
        {
          position : "absolute",
          overflow: "hidden",
          cursor : "default",
          textOverflow : "ellipsis",
          userSelect : "none"
        }) +
        "} " +
        ".qx-cell-right { text-align:right } " +
        ".qx-cell-italic { font-style:italic} " +
        ".qx-cell-bold { font-weight:bold } ";

      if (!qx.core.Variant.isSet("qx.client", "mshtml")) {
        stylesheet += ".qx-cell {" + qx.bom.element.BoxSizing.compile("content-box") + "}";
      }

      cr.__style.stylesheet = qx.bom.Stylesheet.createElement(stylesheet);
    }

    this.base(arguments);
  },

  members :
  {
    _getCssClasses : function(value, states) {
      return "qx-cell";
    },

    _getAttributes : function(value, states) {
      return "";
    },

    _getStyles: function(value, states) {
      return "";
    },

    _getInsets : function(value, states) {
      return [0, 0];
    },

    _getValue : function(value, states) {
      return value;
    },

    getCellProperties : function(value, states)
    {
      return {
        classes : this._getCssClasses(value, states),
        style : this._getStyles(value, states),
        attributes : this._getAttributes(value, states),
        content : this._getValue(value, states),
        insets : this._getInsets(value, states)
      };
    }
  }
});