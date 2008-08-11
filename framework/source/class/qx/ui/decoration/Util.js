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
 * Helper class for common decorator functionality
 */
qx.Class.define("qx.ui.decoration.Util",
{
  statics :
  {
    /**
     * Detects whether the move from decorator <code>a</code> to <code>b</code>
     * results into modified insets.
     *
     * @param a {Decorator} Old decorator or <code>null</code>
     * @param b {Decorator} New decorator or <code>null</code>
     * @return {Boolean} Whether the insets have been modified
     */
    insetsModified : function(a, b)
    {
      if (a == b) {
        return false;
      }

      if (a == null || b == null) {
        return true;
      }

      var manager = qx.theme.manager.Decoration.getInstance();

      var first = manager.resolve(a).getInsets();
      var second = manager.resolve(b).getInsets();

      if (first.top != second.top || first.right != second.right || first.bottom != second.bottom || first.left != second.left) {
        return true;
      }

      return false;
    },


    /**
     * Computes and returns a set of markup to output the given
     * image configuration.
     *
     * @param image {String} URL to the image to show
     * @param repeat {String} Any supported background repeat: <code>repeat</code>,
     *    <code>repeat-x</code>, <code>repeat-y</code>, <code>no-repeat</code> or
     *    <code>scale</code>
     * @param styles {String} Additional styles to insert into the element
     * @return {String} Markup which contains the given image specification
     */
    generateBackgroundMarkup : function(image, repeat, styles)
    {
      // Support for images
      if (image)
      {
        var resolved = qx.util.AliasManager.getInstance().resolve(image);

        // Scaled image
        if (repeat == "scale")
        {
          var uri = qx.util.ResourceManager.toUri(resolved);
          return '<img src="' + uri + '" style="vertical-align:top;' + styles + '"/>';
        }

        // Repeated image
        else
        {
          var back = qx.bom.element.Background.compile(resolved, repeat, 0, 0);
          return '<div style="' + back + styles + '"></div>';
        }
      }
      else
      {
        if (styles) {
          return '<div style="' + styles + '"></div>';
        } else {
          return "";
        }
      }
    }
  }
});
