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

/* ************************************************************************

#module(ui_menu)

************************************************************************ */

/**
 * @appearance menu-button
 */
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



    var io = this._iconObject = new qx.ui.basic.Image;
    io.setWidth(16);
    io.setAnonymous(true);

    var lo = this._labelObject = new qx.ui.basic.Label;
    lo.setAnonymous(true);
    lo.setSelectable(false);

    var so = this._shortcutObject = new qx.ui.basic.Label;
    so.setAnonymous(true);
    so.setSelectable(false);

    var ao = this._arrowObject = new qx.ui.basic.Image;
    ao.setAppearance("menu-button-arrow");
    ao.setAnonymous(true);



    if (vLabel != null) {
      this.setLabel(vLabel);
    }

    if (vIcon != null) {
      this.setIcon(vIcon);
    }

    if (vCommand != null)
    {
      this.setCommand(vCommand);

      // force update of the shortcut string
      qx.locale.Manager.getInstance().addEventListener("changeLocale", function(e) {
        this._applyCommand(vCommand, vCommand);
      }, this);
    }

    if (vMenu != null) {
      this.setMenu(vMenu);
    }


    // Initialize properties
    this.initMinWidth();
    this.initHeight();



    this.addEventListener("mouseup", this._onmouseup);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    allowStretchX :
    {
      refine : true,
      init : true
    },

    appearance :
    {
      refine : true,
      init : "menu-button"
    },

    minWidth :
    {
      refine : true,
      init : "auto"
    },

    height :
    {
      refine : true,
      init : "auto"
    },

    /** Icon of the menu button */
    icon :
    {
      check : "String",
      apply : "_applyIcon",
      nullable : true,
      themeable : true
    },

    /** Label of the menu button */
    label :
    {
      apply : "_applyLabel",
      nullable : true,
      dispose : true
    },

    /** Associated sub menu */
    menu :
    {
      check : "qx.ui.menu.Menu",
      nullable : true,
      apply : "_applyMenu"
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
     * Returns <code>true</code> if the button instance has an icon
     *
     * @type member
     * @return {Boolean} icon available
     */
    hasIcon : function() {
      return this._hasIcon;
    },


    /**
     * Returns <code>true</code> if the button instance has a label
     *
     * @type member
     * @return {Boolean} label available
     */
    hasLabel : function() {
      return this._hasLabel;
    },


    /**
     * Returns <code>true</code> if the button instance has a shortcut
     *
     * @type member
     * @return {Boolean} shortcut available
     */
    hasShortcut : function() {
      return this._hasShortcut;
    },


    /**
     * Returns <code>true</code> if the button instance has a submenu
     *
     * @type member
     * @return {Boolean} sub menu available
     */
    hasMenu : function() {
      return this._hasMenu;
    },


    /**
     * Accessor method for the button icon
     *
     * @type member
     * @return {qx.ui.basic.Image} button icon
     */
    getIconObject : function() {
      return this._iconObject;
    },


    /**
     * Accessor method for the button label
     *
     * @type member
     * @return {qx.ui.basic.Label} button label
     */
    getLabelObject : function() {
      return this._labelObject;
    },


    /**
     * Accessor method for the button shortcut
     *
     * @type member
     * @return {qx.ui.basic.Label} button shortcut
     */
    getShortcutObject : function() {
      return this._shortcutObject;
    },


    /**
     * Accessor method for the button arrow
     *
     * @type member
     * @return {qx.ui.basic.Image} button arrow
     */
    getArrowObject : function() {
      return this._arrowObject;
    },


    /**
     * Accessor method for the parent menu (if available)
     *
     * @type member
     * @return {qx.ui.menu.Menu | null} Returns the parent menu (if available)
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
     * @return {qx.ui.layout.BoxLayout} instance of a button layout implementation
     */
    _createLayoutImpl : function() {
      return new qx.ui.menu.ButtonLayoutImpl(this);
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
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyIcon : function(value, old)
    {
      this._iconObject.setSource(value);

      if (value && value !== "")
      {
        this._hasIcon = true;

        if (!old || old === "") {
          this.addAtBegin(this._iconObject);
        }
      }
      else
      {
        this._hasIcon = false;
        this.remove(this._iconObject);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyLabel : function(value, old)
    {
      this._labelObject.setText(value);

      if (value && value !== "")
      {
        this._hasLabel = true;

        if (!old || old === "") {
          this.addAt(this._labelObject, this.getFirstChild() == this._iconObject ? 1 : 0);
        }
      }
      else
      {
        this._hasLabel = false;
        this.remove(this._labelObject);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyCommand : function(value, old)
    {
      var vHtml = value ? value.toString() : "";

      this._shortcutObject.setText(vHtml);

      if (qx.util.Validation.isValidString(vHtml))
      {
        this._hasShortcut = true;

        var vOldHtml = old ? old.toString() : "";

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
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyMenu : function(value, old)
    {
      if (value)
      {
        this._hasMenu = true;

        if (qx.util.Validation.isInvalidObject(old)) {
          this.addAtEnd(this._arrowObject);
        }
      }
      else
      {
        this._hasMenu = false;
        this.remove(this._arrowObject);
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * Callback method for "mouseUp" event<br/>
     * Simply calls the {@link #execute} method
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseUp event
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
