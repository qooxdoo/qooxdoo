/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * The mixin contains all functionality to provide methods
 * for scroll container handling: determine the parent scroll container.
 *
 */
qx.Mixin.define("qx.ui.mobile.container.MScrollHandling",
{
  members :
  {
    /**
     * Returns the parent scroll container of this widget.
     * @return {qx.ui.mobile.container.Scroll} the parent scroll container or <code>null</code>
     */
    _getParentScrollContainer: function() {
      var scroll = this;
      while (!(scroll instanceof qx.ui.mobile.container.Scroll)) {
        if (scroll.getLayoutParent) {
          var layoutParent = scroll.getLayoutParent();
          if (layoutParent === null || layoutParent instanceof qx.ui.mobile.core.Root) {
            return null;
          }
          scroll = layoutParent;
        } else {
          return null;
        }
      }
      return scroll;
    }
  }
});