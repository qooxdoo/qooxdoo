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
 * A decoration renderer is responsible for rendering a widget's background and
 * border. It is passed the widget's decoration element {@link qx.html.Element}
 * and configures it to display the decoration. Each time a widget is resized
 * the decorator's {@link #update} gets called.
 *
 * All Decoration renderer must implement this interface.
 *
 * A decorators must support the following three life cycles:
 * <ul>
 *   <li><b>Init</b>: If the widget did not have a decorator before, the
 *     {@link init} method is called once for the widget nd gives the decorator
 *     the opportunity to initialize the widget's decortation element.
 *   </li><li><b>Reuse</b>: If the widget's old decorator was an instance of the
 *     same decorator class, the {@link #reset} method of the old decorator
 *     and the {@link #init} method of the new decorator are <b>not</b> called.
 *   </li><li><b>Change</b>: If the widget's old decorator was not an instance of the
 *     same decorator class, the {@link #reset} method of the old decorator and
 *     the {@link #init} method of the new decorator is called.
 *   </li>
 * </ul>
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
     * @param backgroundColor {String?null} an optional CSS background color value.
     * @param updateSize {Boolean} Whether the size of the widget has changed and
     *     the decoration size needs to be updated.
     * @param updateStyles {Boolean} Whether one of the decorator properties have
     *     changed and the styling of the decoration needs to be updatet.
     */
    render : function(element, width, height, backgroundColor, updateSize, updateStyles) {
      return true;
    },


    /**
     * Reset all properties set by the decoration on the widget's decoration
     * element.
     *
     * @param decorationElement {qx.html.Element} The widget's decoration element.
     */
    reset : function(decorationElement) {
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
