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
 * @appearance toolbar-separator-line {qx.ui.basic.Terminator}
 */
qx.Class.define("qx.ui.toolbar.Separator",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // TODO: Should be solved in a decorator
    this._setLayout(new qx.ui.layout.Canvas());

    var line = new qx.ui.core.Widget();
    line.setAppearance("toolbar-separator-line");
    this._add(line, {left:3, top:2, right:5, bottom:2});

    this.setWidth(8);
    // Important: Reset default height
    this.setHeight(0);
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
