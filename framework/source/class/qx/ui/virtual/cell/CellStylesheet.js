/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui.virtual.cell.CellStylesheet",
{
  extend : qx.core.Object,
  type : "singleton",
  
  construct : function()
  {
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
      "} ";

    if (!qx.core.Variant.isSet("qx.client", "mshtml")) {
      stylesheet += ".qx-cell {" + qx.bom.element.BoxSizing.compile("content-box") + "}";
    }

    this.__stylesheet = qx.bom.Stylesheet.createElement(stylesheet);
  },
  
  members : 
  {
    getStylesheet : function() {
      return this.__stylesheet;
    }  
  },
  
  
  destruct : function() {
    this._disposeFields("__stylesheet"); 
  }
});