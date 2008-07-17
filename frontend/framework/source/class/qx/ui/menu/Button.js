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

qx.Class.define("qx.ui.menu.Button",
{
  extend : qx.ui.core.Widget,
  include : qx.ui.core.MExecutable,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(label, icon, command, menu)
  {
    this.base(arguments);

    // Use hard coded layout
    this._setLayout(new qx.ui.layout.MenuButton);

    // Add command listener
    this.addListener("changeCommand", this._onChangeCommand, this);

    // Initialize with incoming arguments
    if (label != null) {
      this.setLabel(label);
    }

    if (icon != null) {
      this.setIcon(icon);
    }

    if (command != null) {
      this.setCommand(command);
    }

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
      init : "menubutton"
    },

    /** The label text of the button */
    label :
    {
      check : "String",
      apply : "_applyLabel",
      nullable : true
    },

    /** The icon to use */
    icon :
    {
      check : "String",
      apply : "_applyIcon",
      nullable : true
    },

    /** Whether a sub menu should be shown and which one */
    menu :
    {
      check : "qx.ui.menu.Menu",
      apply : "_applyMenu",
      nullable : true
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
        case "icon":
          control = new qx.ui.basic.Image(this.getIcon());
          control.setAnonymous(true);
          this._add(control, {column:0});
          break;

        case "label":
          control = new qx.ui.basic.Label(this.getLabel());
          control.setAnonymous(true);
          this._add(control, {column:1});
          break;

        case "shortcut":
          control = new qx.ui.basic.Label();
          control.setAnonymous(true);
          this._add(control, {column:2});
          break;

        case "arrow":
          control = new qx.ui.basic.Image;
          control.setAnonymous(true);
          this._add(control, {column:3});
          break;
      }

      return control || this.base(arguments, id);
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT UTILS
    ---------------------------------------------------------------------------
    */

    getChildrenSizes : function()
    {
      var hasIcon = this._isChildControlVisible("icon");
      var hasLabel = this._isChildControlVisible("label");
      var hasShortcut = this._isChildControlVisible("shortcut");
      var hasMenu = this._isChildControlVisible("arrow");

      return [
        hasIcon ? this._getChildControl("icon").getSizeHint().width : 0,
        hasLabel ? this._getChildControl("label").getSizeHint().width : 0,
        hasShortcut ? this._getChildControl("shortcut").getSizeHint().width : 0,
        hasMenu ? this._getChildControl("arrow").getSizeHint().width : 0
      ];
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyIcon : function(value, old)
    {
      if (value) {
        this._getChildControl("icon").setSource(value);
      } else {
        this._excludeChildControl("icon");
      }
    },

    // property apply
    _applyLabel : function(value, old)
    {
      if (value) {
        this._getChildControl("label").setContent(value);
      } else {
        this._excludeChildControl("label");
      }
    },

    // property apply
    _applyMenu : function(value, old)
    {
      this._hasSubMenu = !!value;
      if (value) {
        this._showChildControl("arrow");
      } else {
        this._excludeChildControl("arrow");
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    _onChangeCommand : function(e) {
      this._getChildControl("shortcut").setContent(e.getData().toString());
    }
  }
});

