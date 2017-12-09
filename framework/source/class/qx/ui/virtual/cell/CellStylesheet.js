/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Singleton wrapper for the stylesheet containing the CSS rules for HTML cells.
 *
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

    if (qx.core.Environment.get("css.boxsizing")) {
      stylesheet += ".qx-cell {" + qx.bom.element.BoxSizing.compile("content-box") + "}";
    }

    this.__stylesheet = qx.bom.Stylesheet.createElement(stylesheet);

    this.__classes = {};
    this.__styles = {};
  },


  members :
  {
    __stylesheet : null,
    __classes : null,
    __styles : null,


    /**
     * Get the DOM stylesheet element
     *
     * @return {StyleSheet} The DOM stylesheet element
     */
    getStylesheet : function() {
      return this.__stylesheet;
    },


    /**
     * Get the CSS class stored under the given key
     *
     * @param key {String} The key under which the class name is stored
     * @return {String|null} The CSS class stored under the given key or
     *   <code>null</code>.
     */
    getCssClass : function(key) {
      return this.__classes[key] || null;
    },


    /**
     * Dynamically create a CSS rule for the given style string. The selector is
     * an unique class name, which is returned. The class is stored under the
     * given key name and can be queried using {@link #getCssClass}.
     *
     * @param key {String} The key under which the class name should be stored
     * @param styleString {String} A compiled string of CSS rules.
     * @return {String} The CSS class name.
     */
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