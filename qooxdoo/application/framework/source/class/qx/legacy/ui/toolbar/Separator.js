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
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * @appearance toolbar-separator
 * @appearance toolbar-separator-line {qx.legacy.ui.basic.Terminator}
 */
qx.Class.define("qx.legacy.ui.toolbar.Separator",
{
  extend : qx.legacy.ui.layout.CanvasLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    var l = new qx.legacy.ui.basic.Terminator;
    l.setAppearance("toolbar-separator-line");
    this.add(l);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "toolbar-separator"
    }
  }
});
