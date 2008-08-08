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
     * Get the amount of space, the decoration needs for its border on each
     * side.
     *
     * @return {Map} the desired insed a map with the keys <code>top</code>,
     *     <code>right</code>, <code>bottom</code>, <code>left</code>.
     */
    getInsets : function() {}
  }
});
