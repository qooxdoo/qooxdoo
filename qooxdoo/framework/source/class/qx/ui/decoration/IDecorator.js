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
 * and configures it to display the decoration.
 *
 * To use the decorator first call the {@link #getMarkup} method. This method
 * will return an HTML fragment containing the decoration. After the decoration
 * has been inserted into the DOM e.g. by using <code>innerHTML</code> the
 * {@link #resize} method must be called to give the decoration the proper size.
 * The first parameter of this call is the root DOM element of the decoration.
 * The resize call can be repeated as needed.
 *
 * It is also possible to alter the background color of an decoration using the
 * {@link #tint} method.
 */
qx.Interface.define("qx.ui.decoration.IDecorator",
{
  members :
  {
    /**
     * Returns the basic markup structure used for this decoration.
     * This later updated on DOM to resize or tint the element.
     *
     * @return {String} Basic markup
     */
    getMarkup : function() {},

    /**
     * Resizes the element respecting the configured borders
     * to the given width and height. Should automatically
     * respect the box model of the client to correctly
     * compute the dimensions.
     *
     * @param element {qx.html.Element} The element to update
     * @param width {Integer} Width of the element
     * @param height {Integer} Height of the element
     */
    resize : function(element, width, height) {},


    /**
     * Applies the given background color to the element
     * or fallback to the background color defined
     * by the decoration itself.
     *
     * @param element {qx.html.Element} The element to update
     * @param bgcolor {Color} The color to apply or <code>null</code>
     */
    tint : function(element, bgcolor) {},


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
