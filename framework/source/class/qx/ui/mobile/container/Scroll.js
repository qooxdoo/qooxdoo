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
 * Container, which allows, depending on the set variant <code>qx.mobile.nativescroll</code>,
 * vertical and horizontal scrolling if the contents is larger than the container.
 *
 * Note that this class can only have one child widget. This container has a
 * fixed layout, which cannot be changed.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   // create the scroll widget
 *   var scroll = new qx.ui.mobile.container.Scroll()
 *
 *   // add a children
 *   scroll.add(new qx.ui.mobile.basic.Label("Name: "));
 *
 *   this.getRoot().add(scroll);
 * </pre>
 *
 * This example creates a scroll container and adds a label to it.
 */
qx.Class.define("qx.ui.mobile.container.Scroll",
{
  extend : qx.ui.mobile.container.Composite,


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "scroll"
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _createContainerElement : function()
    {
      var element = this.base(arguments);
      var scrollElement = this._createScrollElement();
      if (scrollElement) {
        element.appendChild(scrollElement);
      }
      return element;
    },


    // overridden
    _getContentElement : function()
    {
      var contentElement = this.base(arguments);
      var scrollContentElement = this._getScrollContentElement();
      return scrollContentElement || contentElement;
    },


    /**
     * Calls the refresh function the used scrolling method. Needed to recalculate the
     * scrolling container.
     */
    refresh : function() {
      if (qx.core.Environment.get("qx.mobile.nativescroll") == false)
      {
        this._refresh();
      }
    },


    /**
     * Scrolls the wrapper contents to the x/y coordinates in a given period.
     *
     * @param x {Integer} X coordinate to scroll to.
     * @param y {Integer} Y coordinate to scroll to.
     * @param time {Integer} Time slice in which scrolling should
     *              be done.
     */
     scrollTo : function(x, y, time)
     {
       this._scrollTo(x, y, time);
     }
  },

  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    if (qx.core.Environment.get("qx.mobile.nativescroll") == false)
    {
      qx.Class.include(statics, qx.ui.mobile.container.MIScroll);
    } else {
      qx.Class.include(statics, qx.ui.mobile.container.MNativeScroll);
    }
  }
});
