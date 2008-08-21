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
 * A button which acts as a normal button and shows a menu on one
 * of the sides to open something like a history list.
 */
qx.Class.define("qx.ui.toolbar.SplitButton",
{
  extend : qx.ui.form.SplitButton,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(label, icon, menu, command)
  {
    this.base(arguments, label, icon, menu, command);

    // Toolbar buttons should not support the keyboard events
    this.removeListener("keydown", this._onKeyDown);
    this.removeListener("keyup", this._onKeyUp);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "toolbar-splitbutton"
    },


    // overridden
    focusable :
    {
      refine : true,
      init : false
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "button":
          control = new qx.ui.toolbar.Button;
          control.addListener("execute", this._onButtonExecute, this);
          this._addAt(control, 0);
          break;

        case "arrow":
          control = new qx.ui.toolbar.MenuButton;
          this._addAt(control, 1);
          break;
      }

      return control || this.base(arguments, id);
    }
  }
});
