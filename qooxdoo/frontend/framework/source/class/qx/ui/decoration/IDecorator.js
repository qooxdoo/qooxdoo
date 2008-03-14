/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A decorator is responsible for rendering a widget's background and
 * border. It is passed the widget's decoration element {@link qx.html.Element}
 * and configures it to display the decoration. Each time a widget is resized
 * the decorator's {@link #render} gets called. Each decorator must also support
 * the method {@link #reset} which is called when the decoration changed to
 * another class. Switches of a decoration object of the same class should
 * be supported by the {@link #render} method as well. This means that every
 * update must apply all relevant styles for the decoration.
 */
qx.Interface.define("qx.ui.decoration.IDecorator",
{
  members :
  {
    /**
     * Render the decoration size of the given decoration element.
     *
     * @param element {qx.html.Element} The widget's decoration element.
     * @param width {Integer} The widget's new width
     * @param height {Integer} The widget's new height
     * @param backgroundColor {String} an optional CSS background color value.
     * @param updateSize {Boolean} Whether the size of the widget has changed and
     *     the decoration size needs to be updated. Is also <code>true</code> when
     *     this decoration should be applied initially.
     * @param updateStyles {Boolean} Whether one of the decorator properties have
     *     changed and the styling of the decoration needs to be updated.
     */
    render : function(element, width, height, backgroundColor, updateSize, updateStyles) {
      return true;
    },


    /**
     * Reset all properties set by the decoration on the widget's decoration
     * element.
     *
     * @param element {qx.html.Element} The widget's decoration element.
     */
    reset : function(element) {
      return true;
    },


    /**
     * Get the amount of space, the decoration needs for its border on each
     * side.
     *
     * @return {Map} the desired insed a map with the keys <code>top</code>,
     *     <code>right</code>, <code>bottom</code>, <code>left</code>.
     */
    getInsets : function() {
      return true;
    }
  }
});
