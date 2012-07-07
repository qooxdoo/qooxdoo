/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * Mixin for the {@link Scroll} container. Used when the variant
 * <code>qx.mobile.nativescroll</code> is set to "on".
 */
qx.Mixin.define("qx.ui.mobile.container.MNativeScroll",
{

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Mixin method. Creates the scroll element.
     *
     * @return {Element} The scroll element
     */
    _createScrollElement : function()
    {
      return null
    },


    /**
     * Mixin method. Returns the scroll content element.
     *
     * @return {Element} The scroll content element
     */
    _getScrollContentElement : function()
    {
      return null
    },


   /**
    * Scrolls the wrapper contents to the x/y coordinates in a given period.
    *
    * @param x {Integer} X coordinate to scroll to.
    * @param y {Integer} Y coordinate to scroll to.
    * @param time {Integer} Time slice in which scrolling should
    *              be done.
    */
    _scrollTo : function(x, y, time)
    {
      scrollTo(x,y);
    }
  }
});
