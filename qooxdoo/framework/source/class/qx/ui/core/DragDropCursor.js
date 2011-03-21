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
 * This widget is used as feedback widget in drag and drop actions.
 */
qx.Class.define("qx.ui.core.DragDropCursor",
{
  extend : qx.ui.basic.Image,
  include : qx.ui.core.MPlacement,
  type : "singleton",



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Put above other stuff
    this.setZIndex(1e8);

    // Move using DOM
    this.setDomMove(true);

    // Automatically add to root
    var root = this.getApplicationRoot();
    root.add(this, { left: -1000, top: - 1000 });
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
      init : "dragdrop-cursor"
    },

    /** The current drag&drop action */
    action :
    {
      check : [ "alias", "copy", "move" ],
      apply : "_applyAction",
      nullable : true
    }
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  members :
  {
    // property apply
    _applyAction : function(value, old)
    {
      if (old) {
        this.removeState(old);
      }

      if (value) {
        this.addState(value);
      }
    }
  }
});
