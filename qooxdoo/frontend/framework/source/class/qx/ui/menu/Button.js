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

#module(ui_menu)
#embed(qx.widgettheme/arrows/next.gif)

************************************************************************ */

qx.Class.define("qx.ui.menu.Button",
{
  extend : qx.ui.layout.HorizontalBoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vLabel, vIcon, vCommand, vMenu)
  {
    this.base(arguments);

    // ************************************************************************
    //   LAYOUT
    // ************************************************************************
    var io = this._iconObject = new qx.ui.basic.Image;
    io.setWidth(16);
    io.setAnonymous(true);

    var lo = this._labelObject = new qx.ui.basic.Label;
    lo.setAnonymous(true);
    lo.setSelectable(false);

    var so = this._shortcutObject = new qx.ui.basic.Label;
    so.setAnonymous(true);
    so.setSelectable(false);

    var ao = this._arrowObject = new qx.ui.basic.Image("widget/arrows/next.gif");
    ao.setAnonymous(true);

    // ************************************************************************
    //   INIT
    // ************************************************************************
    if (vLabel != null) {
      this.setLabel(vLabel);
    }

    if (vIcon != null) {
      this.setIcon(vIcon);
    }

    if (vCommand != null)
    {
      this.setCommand(vCommand);

      qx.locale.Manager.getInstance().addEventListener("changeLocale", function(e) {
        this._modifyCommand(vCommand, vCommand);
      }, this);
    }

    if (vMenu != null) {
      this.setMenu(vMenu);
    }

    // ************************************************************************
    //   EVENTS
    // ************************************************************************
    this.addEventListener("mouseup", this._onmouseup);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    appearance :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "menu-button"
    },

    icon :
    {
      _legacy : true,
      type    : "string"
    },

    label : { _legacy : true },

    menu :
    {
      _legacy : true,
      type    : "object"
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
      UTILITIES
    ---------------------------------------------------------------------------
    */

    _hasIcon : false,
    _hasLabel : false,
    _hasShortcut : false,
    _hasMenu : false,


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    hasIcon : function() {
      return this._hasIcon;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    hasLabel : function() {
      return this._hasLabel;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    hasShortcut : function() {
      return this._hasShortcut;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    hasMenu : function() {
      return this._hasMenu;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getIconObject : function() {
      return this._iconObject;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getLabelObject : function() {
      return this._labelObject;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getShortcutObject : function() {
      return this._shortcutObject;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getArrowObject : function() {
      return this._arrowObject;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var | null} TODOC
     */
    getParentMenu : function()
    {
      var vParent = this.getParent();

      if (vParent)
      {
        vParent = vParent.getParent();

        if (vParent && vParent instanceof qx.ui.menu.Menu) {
          return vParent;
        }
      }

      return null;
    },




    /*
    ---------------------------------------------------------------------------
      INIT LAYOUT IMPL
    ---------------------------------------------------------------------------
    */

    /**
     * This creates an new instance of the layout impl this widget uses
     *
     * @type member
     * @return {var} TODOC
     */
    _createLayoutImpl : function() {
      return new qx.renderer.layout.MenuButtonLayoutImpl(this);
    },




    /*
    ---------------------------------------------------------------------------
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {var} TODOC
     */
    _modifyEnabled : function(propValue, propOldValue, propData)
    {
      if (this._iconObject) {
        this._iconObject.setEnabled(propValue);
      }

      if (this._labelObject) {
        this._labelObject.setEnabled(propValue);
      }

      if (this._shortcutObject) {
        this._shortcutObject.setEnabled(propValue);
      }

      return this.base(arguments, propValue, propOldValue, propData);
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyIcon : function(propValue, propOldValue, propData)
    {
      this._iconObject.setSource(propValue);

      if (qx.util.Validation.isValidString(propValue))
      {
        this._hasIcon = true;

        if (qx.util.Validation.isInvalidString(propOldValue)) {
          this.addAtBegin(this._iconObject);
        }
      }
      else
      {
        this._hasIcon = false;
        this.remove(this._iconObject);
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyLabel : function(propValue, propOldValue, propData)
    {
      this._labelObject.setHtml(propValue);

      if ((typeof propValue == "string" && propValue != "") || propValue instanceof qx.locale.LocalizedString)
      {
        this._hasLabel = true;

        if (!((typeof propOldValue == "string" && propOldValue != "") || propOldValue instanceof qx.locale.LocalizedString)) {
          this.addAt(this._labelObject, this.getFirstChild() == this._iconObject ? 1 : 0);
        }
      }
      else
      {
        this._hasLabel = false;
        this.remove(this._labelObject);
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyCommand : function(propValue, propOldValue, propData)
    {
      var vHtml = propValue ? propValue.toString() : "";

      this._shortcutObject.setHtml(vHtml);

      if (qx.util.Validation.isValidString(vHtml))
      {
        this._hasShortcut = true;

        var vOldHtml = propOldValue ? propOldValue.getShortcut() : "";

        if (qx.util.Validation.isInvalidString(vOldHtml))
        {
          if (this.getLastChild() == this._arrowObject) {
            this.addBefore(this._shortcutObject, this._arrowObject);
          } else {
            this.addAtEnd(this._shortcutObject);
          }
        }
      }
      else
      {
        this._hasShortcut = false;
        this.remove(this._shortcutObject);
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyMenu : function(propValue, propOldValue, propData)
    {
      if (propValue)
      {
        this._hasMenu = true;

        if (qx.util.Validation.isInvalidObject(propOldValue)) {
          this.addAtEnd(this._arrowObject);
        }
      }
      else
      {
        this._hasMenu = false;
        this.remove(this._arrowObject);
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseup : function(e) {
      this.execute();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_iconObject", "_labelObject", "_shortcutObject", "_arrowObject");
  }
});
