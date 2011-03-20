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
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 */
qx.Class.define("qx.ui.mobile.container.Composite",
{
  extend : qx.ui.mobile.core.Widget,
  include : [ qx.ui.mobile.core.MChildrenHandling, qx.ui.mobile.core.MLayoutHandling],


  construct : function(layout)
  {
    this.base(arguments);
    if (layout) {
      this.setLayout(layout);
    }
  },


  defer : function(statics, members)
  {
    qx.ui.mobile.core.MChildrenHandling.remap(members);
    qx.ui.mobile.core.MLayoutHandling.remap(members);
  }
});
