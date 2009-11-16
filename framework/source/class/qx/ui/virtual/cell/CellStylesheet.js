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

/**
 * EXPERIMENTAL!
 */
qx.Class.define("qx.ui.virtual.cell.CellStylesheet",
{
  extend : qx.core.Object,
  type : "singleton",

  construct : function()
  {
    this.base(arguments);

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

    this.__classes = {};
    this.__styles = {}
  },

  members :
  {
    __stylesheet : null,
    __classes : null,
    __styles : null,

    getStylesheet : function() {
      return this.__stylesheet;
    },


    getCssClass : function(key) {
      return this.__classes[key];
    },


    computeClassForStyles : function(key, styleString)
    {
      var cssClass = this.__styles[styleString];
      if (!cssClass)
      {
        // generate stylesheet rule
        var cssClass = this.__getNextClassname();
        qx.bom.Stylesheet.addRule(this.__stylesheet, "." + cssClass, styleString);
        this.__styles[styleString] = cssClass;
      }

      this.__classes[key] = cssClass;
      return cssClass;
    },


    /**
     * Get the next unique CSS class name
     *
     * @return {String} The next unique CSS class name
     */
    __getNextClassname : function() {
      return "qx-cell-" + this.toHashCode() + "-" + (this.__classCounter++);
    },
    __classCounter : 0
  },


  destruct : function() {
    this.__stylesheet = this.__classes = this.__styles = null;
  }
});