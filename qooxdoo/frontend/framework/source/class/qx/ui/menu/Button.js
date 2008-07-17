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

  construct : function(label, icon, command, menu)
  {
    this.base(arguments);

    // use hard coded layout
    this._setLayout(new qx.ui.layout.MenuButton);

    if (label != null) {
      this.setLabel(label);
    }

    if (icon != null) {
      this.setIcon(icon);
    }

    this.addListener("changeCommand", this._onChangeCommand, this);
    if (command != null) {
      this.setCommand(command);
    }

    if (menu != null) {
      this.setMenu(menu);
    }

    this.addListener("mouseover", this._onMouseOver, this);
    this.addListener("mouseout", this._onMouseOut, this);
  },

  properties :
  {
    appearance :
    {
      refine : true,
      init : "menubutton"
    },

    label :
    {
      check : "String",
      apply : "_applyLabel",
      nullable : true
    },

    icon :
    {
      check : "String",
      apply : "_applyIcon",
      nullable : true
    },

    menu :
    {
      check : "qx.ui.menu.Menu",
      apply : "_applyMenu",
      nullable : true
    }
  },

  members :
  {
    getChildrenSizes : function()
    {
      var icon = this._getChildControl("icon", true);
      var label = this._getChildControl("label", true);
      var shortcut = this._getChildControl("shortcut", true);
      var arrow = this._getChildControl("arrow", true);

      return [
        icon ? icon.getSizeHint().width : 16,
        label ? label.getSizeHint().width : 0,
        shortcut ? shortcut.getSizeHint().width : 0,
        arrow ? arrow.getSizeHint().width : 5
      ];
    },


    _applyIcon : function(value, old)
    {
      this._getChildControl("icon").setSource(value);
    },

    _applyLabel : function(value, old)
    {
      this._getChildControl("label").setContent(value);
    },

    _applyMenu : function(value, old)
    {
      this._getChildControl("arrow");
    },

    _onChangeCommand : function(e)
    {
      this._getChildControl("shortcut").setContent(e.getData().toString());
    },



    _onMouseOver : function(e) {
      this.addState("hovered");
    },

    _onMouseOut : function(e) {
      this.removeState("hovered");
    },



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
    }
  }
});

