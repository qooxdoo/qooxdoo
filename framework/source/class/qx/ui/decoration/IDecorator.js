/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A decorator is responsible for computing a widget's decoration styles.
 *
 */
qx.Interface.define("qx.ui.decoration.IDecorator",
{
  members :
  {

    /**
     * Returns the decorator's styles.
     *
     * @return {Map} Map of decoration styles
     */
    getStyles : function() {},



    /**
     * Returns the configured padding minus the border width.
     * @return {Map} Map of top, right, bottom and left padding values
     */
    getPadding : function() {},


    /**
     * Get the amount of space the decoration needs for its border and padding
     * on each side.
     *
     * @return {Map} the desired inset as a map with the keys <code>top</code>,
     *     <code>right</code>, <code>bottom</code>, <code>left</code>.
     */
    getInsets : function() {}
  }
});
