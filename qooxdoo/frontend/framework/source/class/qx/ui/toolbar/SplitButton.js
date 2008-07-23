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

qx.Class.define("qx.ui.toolbar.SplitButton",
{
  extend : qx.ui.toolbar.Button,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(label, icon, command, menu)
  {
    this.base(arguments, label, icon, command);

    // Force arrow creation
    this._createChildControl("arrow");

    // Process incoming arguments
    if (menu != null) {
      this.setMenu(menu);
    }
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

    /** The menu instance to show when clicking on the button */
    menu :
    {
      check : "qx.ui.menu.Menu",
      nullable : true,
      apply : "_applyMenu",
      event : "changeMenu"
    }
  },




  members :
  {
    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "arrow":
          control = new qx.ui.basic.Image;
          control.addListener("mousedown", this._onArrowMouseDown, this);
          control.addListener("mouseup", this._onArrowMouseUp, this);
          this._addAt(control, 10);
          break;
      }

      return control || this.base(arguments, id);
    },


    _applyMenu : function(value, old) {
      this._getChildControl("arrow").setEnabled(!!value);
    },


    _onMouseOver : function(e)
    {
      var arrow = this._getChildControl("arrow");
      if (e.getTarget() == arrow) {
        this.debug("PATCH-1");
        e.setTarget(this);
      }

      this.base(arguments, e);


    },

    _onMouseOut : function(e)
    {
      var arrow = this._getChildControl("arrow");
      if (e.getTarget() == arrow) {
        this.debug("PATCH-2");
        e.setTarget(this);
      }

      this.base(arguments, e);

    },

    _onArrowMouseDown : function(e)
    {
      this.debug("Down...");

      e.stopPropagation();
    },

    _onArrowMouseUp : function(e)
    {
      this.debug("Up...");

      e.stopPropagation();
    }
  }
});
