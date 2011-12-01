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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This class is responsible for checking the scrolling behavior of the client.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Scroll",
{
  statics :
  {
    /**
     * Check if the scrollbars should be positioned on top of the content. This
     * is true of OSX Lion when the scrollbars dissapear automatically.
     *
     * @internal
     *
     * @return {Boolean} <code>true</code> if the scrollbars should be
     *   positioned on top of the content.
     */
    scrollBarOverlayed : function() {
      var scrollBarWidth = qx.bom.element.Overflow.getScrollbarWidth();
      var osx = qx.bom.client.OperatingSystem.getName() === "osx";
      var nativeScrollBars = qx.core.Environment.get("qx.nativeScrollBars");

      return scrollBarWidth == 0 && osx && nativeScrollBars;
    }
  },


  defer : function(statics) {
    qx.core.Environment.add("os.scrollBarOverlayed", statics.scrollBarOverlayed);
  }
});
