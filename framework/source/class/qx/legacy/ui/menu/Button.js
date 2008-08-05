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
 * @appearance menu-button
 */
qx.Class.define("qx.legacy.ui.menu.Button",
{
  extend : qx.legacy.ui.layout.HorizontalBoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vLabel, vIcon, vCommand, vMenu)
  {
    this.base(arguments);



    var io = this._iconObject = new qx.legacy.ui.basic.Image;
    io.setWidth(16);
    io.setAnonymous(true);

    var lo = this._labelObject = new qx.legacy.ui.basic.Label;
    lo.setAnonymous(true);
    lo.setSelectable(false);

    var so = this._shortcutObject = new qx.legacy.ui.basic.Label;
    so.setAnonymous(true);
    so.setSelectable(false);

    var ao = this._arrowObject = new qx.legacy.ui.basic.Image;
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
      qx.locale.Manager.getInstance().addListener("changeLocale", function(e) {
        this._applyCommand(vCommand, vCommand);
      }, this);
    }

    if (vMenu != null) {
      this.setMenu(vMenu);
    }


    // Initialize properties
    this.initMinWidth();
    this.initHeight();



    this.addListener("mouseup", this._onmouseup);
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
      check : "qx.legacy.ui.menu.Menu",
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
     * @return {Boolean} icon available
     */
    hasIcon : function() {
      return this._hasIcon;
    },


    /**
     * Returns <code>true</code> if the button instance has a label
     *
     * @return {Boolean} label available
     */
    hasLabel : function() {
      return this._hasLabel;
    },


    /**
     * Returns <code>true</code> if the button instance has a shortcut
     *
     * @return {Boolean} shortcut available
     */
    hasShortcut : function() {
      return this._hasShortcut;
    },


    /**
     * Returns <code>true</code> if the button instance has a submenu
     *
     * @return {Boolean} sub menu available
     */
    hasMenu : function() {
      return this._hasMenu;
    },


    /**
     * Accessor method for the button icon
     *
     * @return {qx.legacy.ui.basic.Image} button icon
     */
    getIconObject : function() {
      return this._iconObject;
    },


    /**
     * Accessor method for the button label
     *
     * @return {qx.legacy.ui.basic.Label} button label
     */
    getLabelObject : function() {
      return this._labelObject;
    },


    /**
     * Accessor method for the button shortcut
     *
     * @return {qx.legacy.ui.basic.Label} button shortcut
     */
    getShortcutObject : function() {
      return this._shortcutObject;
    },


    /**
     * Accessor method for the button arrow
     *
     * @return {qx.legacy.ui.basic.Image} button arrow
     */
    getArrowObject : function() {
      return this._arrowObject;
    },


    /**
     * Accessor method for the parent menu (if available)
     *
     * @return {qx.legacy.ui.menu.Menu | null} Returns the parent menu (if available)
     */
    getParentMenu : function()
    {
      var vParent = this.getParent();

      if (vParent)
      {
        vParent = vParent.getParent();

        if (vParent && vParent instanceof qx.legacy.ui.menu.Menu) {
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
     * @return {qx.legacy.ui.layout.BoxLayout} instance of a button layout implementation
     */
    _createLayoutImpl : function() {
      return new qx.legacy.ui.menu.ButtonLayoutImpl(this);
    },




    /*
    ---------------------------------------------------------------------------
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
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
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyCommand : function(value, old)
    {
      var vHtml = value ? value.toString() : "";

      this._shortcutObject.setText(vHtml);

      if (qx.legacy.util.Validation.isValidString(vHtml))
      {
        this._hasShortcut = true;

        var vOldHtml = old ? old.toString() : "";

        if (qx.legacy.util.Validation.isInvalidString(vOldHtml))
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
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyMenu : function(value, old)
    {
      if (value)
      {
        this._hasMenu = true;

        if (qx.legacy.util.Validation.isInvalidObject(old)) {
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
     * @param e {qx.legacy.event.type.MouseEvent} mouseUp event
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
