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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The desktop is a widget, which can act as container for windows. It can be
 * used to define a clipping region for internal windows e.g. to create
 * an MDI like application.
 */
qx.Class.define("qx.ui.window.Desktop",
{
  extend : qx.ui.core.Widget,

  include : [
    qx.ui.core.MChildrenHandling,
    qx.ui.window.MDesktop,
    qx.ui.core.MBlocker
  ],

  implement : qx.ui.window.IDesktop,

  /**
   * @param windowManager {IWindowManager} The window manager to use for the
   *    desktop
   */
  construct : function(windowManager)
  {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.Canvas());
    this.setWindowManager(windowManager);
  }
});