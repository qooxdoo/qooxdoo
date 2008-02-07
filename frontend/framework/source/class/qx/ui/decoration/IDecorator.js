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
 * and configures it to display the decoration.
 *
 * All Decoration renderer must implement this interface.
 */
qx.Interface.define("qx.ui.decoration.IDecorator",
{
  members :
  {
    /**
     * Initialize the decoration for the given widget and decoration element.
     *
     * @param decorationElement {qx.html.Element} The widget's decoration element.
     */
    init : function(decorationElement) {
      return true;
    },

    update : function(decorationElement, height, width) {
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
