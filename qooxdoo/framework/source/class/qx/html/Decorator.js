/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * An element preconfigured with a decorator. The decorator cannot be changed
 * after creation. This class is used to render the backgrounds, shadows and
 * separators in widgets.
 */

qx.Class.define("qx.html.Decorator",
{
  extend : qx.html.Element,

  /**
   * @param decorator {qx.ui.decoration.IDecorator} The decorator to use
   * @param decoratorId {String?} An optional id for the decorator.
   */
  construct : function(decorator, decoratorId)
  {
    var styles = {
      position: "absolute",
      top: 0,
      left: 0
    }

    if (qx.core.Environment.get("event.pointer")) {
      styles.pointerEvents = "none"
    }

    this.base(arguments, null, styles);

    this.__decorator = decorator;
    this.__id = decoratorId || decorator.toHashCode();

    this.useMarkup(decorator.getMarkup());
  },


  members :
  {
    __id : null,
    __decorator : null,

    /**
     * Get the decorator's id
     *
     * @return {String} the id
     */
    getId : function() {
      return this.__id;
    },


    /**
     * Get the decorator
     *
     * @return {qx.ui.decoration.IDecorator} the decorator used
     */
    getDecorator : function() {
      return this.__decorator;
    },


    /**
     * Resizes the element respecting the configured borders
     * to the given width and height. Should automatically
     * respect the box model of the client to correctly
     * compute the dimensions.
     *
     * @param width {Integer} Width of the element
     * @param height {Integer} Height of the element
     */
    resize : function(width, height) {
      this.__decorator.resize(this.getDomElement(), width, height);
    },


    /**
     * Applies the given background color to the element
     * or fallback to the background color defined
     * by the decoration itself.
     *
     * @param color {Color|null} The color to apply or <code>null</code>
     */
    tint : function(color) {
      this.__decorator.tint(this.getDomElement(), color);
    },


    /**
     * Get the amount of space, the decoration needs for its border on each
     * side.
     *
     * @return {Map} the desired insets. A map with the keys <code>top</code>,
     *     <code>right</code>, <code>bottom</code>, <code>left</code>.
     */
    getInsets : function() {
      return this.__decorator.getInsets();
    }
  },


  destruct : function() {
    this.__decorator = null;
  }
});