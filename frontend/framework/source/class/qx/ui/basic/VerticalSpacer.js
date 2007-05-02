/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_basic)

************************************************************************ */

/**
 * This widget can be used to create a vertical spacing between
 * widgets in e.g. a {@link qx.ui.layout.VerticalBoxLayout}.
 *
 * By default it tries to occupy the all the remaining space by setting
 * a flex height of <code>1*</code>.
 */
qx.Class.define("qx.ui.basic.VerticalSpacer",
{
  extend : qx.ui.basic.Terminator,

  construct : function()
  {
    this.base(arguments);

    this.initHeight();
  },

  properties :
  {
    height :
    {
      refine : true,
      init : "1*"
    }
  }
});
