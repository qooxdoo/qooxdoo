/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The blocker element is used to block interaction with the application.
 *
 * It is usually transparent or semi-transparent and blocks all events from
 * the underlying elements.
 */
qx.Class.define("qx.html.Blocker",
{
  extend : qx.html.Element,

  /**
   * @param backgroundColor {Color?null} the blocker's background color. This
   *    color can be themed and will be resolved by the blocker.
   * @param opacity {Number?0} The blocker's opacity
   */
  construct : function(backgroundColor, opacity)
  {
    this.base(arguments);

    var backgroundColor = backgroundColor ?
        qx.theme.manager.Color.getInstance().resolve(backgroundColor) : null;

    this.setStyles({
      position: "absolute",
      width: "100%",
      height: "100%",
      opacity : opacity || 0,
      backgroundColor : backgroundColor
    });

    // IE needs some extra love here to convince it to block events.
    if (qx.core.Variant.isSet("qx.client", "mshtml"))
    {
      this.setStyles({
        backgroundImage: "url(" + qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif") + ")",
        backgroundRepeat: "repeat"
      });
    }
  }
});