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
        ".qooxdoo-table-cell {" +
        qx.bom.element.Style.compile(
        {
          position : "absolute",
          overflow: "hidden",
          cursor : "default",
          textOverflow : "ellipsis",
          userSelect : "none"
        }) +
        "} " +
        ".qooxdoo-cell-right { text-align:right } " +
        ".qooxdoo-cell-italic { font-style:italic} " +
        ".qooxdoo-cell-bold { font-weight:bold } ";

      if (!qx.core.Variant.isSet("qx.client", "mshtml")) {
        stylesheet += ".qooxdoo-cell {" + qx.bom.element.BoxSizing.compile("content-box") + "}";
      }

      cr.__style.stylesheet = qx.bom.Stylesheet.createElement(stylesheet);
    }

    this.__insetX = 0;
    this.__insetY = 0;

    this.base(arguments);
  },

  members :
  {

    __insetX : null,
    __insetY : null,

    _getCssClasses : function(value, states) {
      return "qooxdoo-table-cell";
    },

    _getAttributes : function(value, states) {
      return "";
    },

    _getStyles: function(value, states) {
      return "";
    },

    _getInsets : function(value, states) {
      return [this.__insetX, this.__insetY];
    },

    _getValue : function(value, states) {
      return value;
    },

    getCellProperties : function(value, states)
    {
      return {
        classes : this._getCssClasses(),
        style : this._getStyles(),
        attributes : this._getAttributes(),
        content : this._getValue(),
        insets : this._getInsets()
      };
    }
  }
});