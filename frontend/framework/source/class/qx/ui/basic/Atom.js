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

#module(ui_basic)
#optional(qx.ui.embed.Flash)

************************************************************************ */

/**
 * A multi-purpose widget used by many more complex widgets.
 *
 * The intended purpose of qx.ui.basic.Atom is to easily align the common icon-text combination in different ways.
 * This is useful for all types of buttons, menuentries, tooltips, ...
 */
qx.Class.define("qx.ui.basic.Atom",
{
  extend : qx.ui.layout.BoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

	/**
	 * @param vLabel {String} label of the atom
	 * @param vIcon {String?null} Icon of the atom
	 * @param vIconWidth {Integer?null} desired width of the icon (the icon will be scaled to this size)
	 * @param vIconHeight {Integer?null} desired height of the icon (the icon will be scaled to this size)
	 * @param vFlash {qx.ui.embed.Flash?null} optional flash animation for the Atom. Needs valid width and height values.
	 */
  construct : function(vLabel, vIcon, vIconWidth, vIconHeight, vFlash)
  {
    this.base(arguments);

    if (this.getOrientation() == null) {
      this.setOrientation("horizontal");
    }

    // Prohibit selection
    this.setSelectable(false);

    // Disable flex support
    this.getLayoutImpl().setEnableFlexSupport(false);

    // Apply constructor arguments
    this.setLabel(vLabel);

    // Simple flash wrapper
    if (qx.Class.isDefined("qx.ui.embed.Flash") && vFlash != null && vIconWidth != null && vIconHeight != null && qx.ui.embed.Flash.getPlayerVersion().getMajor() > 0)
    {
      this._flashMode = true;

      this.setIcon(vFlash);

      // flash needs explicit dimensions!
      this.setIconWidth(vIconWidth);
      this.setIconHeight(vIconHeight);
    }
    else if (vIcon != null)
    {
      this.setIcon(vIcon);

      if (vIconWidth != null) {
        this.setIconWidth(vIconWidth);
      }

      if (vIconHeight != null) {
        this.setIconHeight(vIconHeight);
      }
    }
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    SHOW_LABEL : "label",
    SHOW_ICON  : "icon",
    SHOW_BOTH  : "both"
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

    /** The label/caption/text of the qx.ui.basic.Atom instance */
    label : { _legacy : true },


    /** Any URI String supported by qx.ui.basic.Image to display a icon */
    icon :
    {
      _legacy : true,
      type    : "string"
    },


    /**
     * Any URI String supported by qx.ui.basic.Image to display a disabled icon.
     * <p>
     * If not set the normal icon is shown transparently.
     */
    disabledIcon :
    {
      _legacy : true,
      type    : "string"
    },


    /**
     * Configure the visibility of the sub elements/widgets.
     *  Possible values: both, text, icon, none
     */
    show :
    {
      _legacy        : true,
      type           : "string",
      defaultValue   : "both",
      possibleValues : [ "both", "label", "icon", "none", null ]
    },


    /**
     * The position of the icon in relation to the text.
     *  Only useful/needed if text and icon is configured and 'show' is configured as 'both' (default)
     */
    iconPosition :
    {
      _legacy        : true,
      type           : "string",
      defaultValue   : "left",
      possibleValues : [ "top", "right", "bottom", "left" ]
    },


    /**
     * The width of the icon.
     *  If configured, this makes qx.ui.basic.Atom a little bit faster as it does not need to wait until the image loading is finished.
     */
    iconWidth :
    {
      _legacy : true,
      type    : "number"
    },


    /**
     * The height of the icon
     *  If configured, this makes qx.ui.basic.Atom a little bit faster as it does not need to wait until the image loading is finished.
     */
    iconHeight :
    {
      _legacy : true,
      type    : "number"
    },

    appearance :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "atom"
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
      SUB WIDGETS
    ---------------------------------------------------------------------------
    */

    _flashMode : false,

    _labelObject : null,
    _iconObject : null,


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createLabel : function()
    {
      var l = this._labelObject = new qx.ui.basic.Label(this.getLabel());

      l.setAnonymous(true);
      l.setEnabled(this.getEnabled());
      l.setSelectable(false);

      this.addAt(l, this._iconObject ? 1 : 0);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createIcon : function()
    {
      if (this._flashMode && qx.Class.isDefined("qx.ui.embed.Flash")) {
        var i = this._iconObject = new qx.ui.embed.Flash(this.getIcon());
      } else {
        var i = this._iconObject = new qx.ui.basic.Image();
      }

      i.setAnonymous(true);

      this._updateIcon();

      this.addAt(i, 0);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _updateIcon : function()
    {
      // NOTE: We have to check whether the properties "icon" and "disabledIcon"
      //       exist, because some child classes remove them.
      if (this._iconObject && this.getIcon && this.getDisabledIcon)
      {
        var disabledIcon = this.getDisabledIcon();

        if (disabledIcon)
        {
          if (this.getEnabled()) {
            this._iconObject.setSource(this.getIcon());
          } else {
            this._iconObject.setSource(disabledIcon);
          }

          this._iconObject.setEnabled(true);
        }
        else
        {
          this._iconObject.setSource(this.getIcon());
          this._iconObject.setEnabled(this.getEnabled());
        }
      }
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
    getIconObject : function() {
      return this._iconObject;
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
      this._updateIcon();

      if (this._labelObject) {
        this._labelObject.setEnabled(propValue);
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
    _modifyIconPosition : function(propValue, propOldValue, propData)
    {
      switch(propValue)
      {
        case "top":
        case "bottom":
          this.setOrientation("vertical");
          this.setReverseChildrenOrder(propValue == "bottom");
          break;

        default:
          this.setOrientation("horizontal");
          this.setReverseChildrenOrder(propValue == "right");
          break;
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
    _modifyShow : function(propValue, propOldValue, propData)
    {
      this._handleIcon();
      this._handleLabel();

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
      if (this._labelObject) {
        this._labelObject.setHtml(propValue);
      }

      this._handleLabel();

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
    _modifyIcon : function(propValue, propOldValue, propData)
    {
      this._updateIcon();
      this._handleIcon();

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
    _modifyDisabledIcon : function(propValue, propOldValue, propData)
    {
      this._updateIcon();
      this._handleIcon();

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
    _modifyIconWidth : function(propValue, propOldValue, propData)
    {
      this._iconObject.setWidth(propValue);
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
    _modifyIconHeight : function(propValue, propOldValue, propData)
    {
      this._iconObject.setHeight(propValue);
      return true;
    },




    /*
    ---------------------------------------------------------------------------
      HANDLER
    ---------------------------------------------------------------------------
    */

    _iconIsVisible : false,
    _labelIsVisible : false,


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _handleLabel : function()
    {
      switch(this.getShow())
      {
        case qx.ui.basic.Atom.SHOW_LABEL:
        case qx.ui.basic.Atom.SHOW_BOTH:
          this._labelIsVisible = qx.util.Validation.isValidString(this.getLabel()) || this.getLabel() instanceof qx.locale.LocalizedString;
          break;

        default:
          this._labelIsVisible = false;
      }

      if (this._labelIsVisible) {
        this._labelObject ? this._labelObject.setDisplay(true) : this._createLabel();
      } else if (this._labelObject) {
        this._labelObject.setDisplay(false);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _handleIcon : function()
    {
      switch(this.getShow())
      {
        case qx.ui.basic.Atom.SHOW_ICON:
        case qx.ui.basic.Atom.SHOW_BOTH:
          this._iconIsVisible = qx.util.Validation.isValidString(this.getIcon());
          break;

        default:
          this._iconIsVisible = false;
      }

      if (this._iconIsVisible) {
        this._iconObject ? this._iconObject.setDisplay(true) : this._createIcon();
      } else if (this._iconObject) {
        this._iconObject.setDisplay(false);
      }
    },




    /*
    ---------------------------------------------------------------------------
      CLONE
    ---------------------------------------------------------------------------
    */

    // Omit recursive cloning
    _cloneRecursive : qx.lang.Function.returnTrue
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_iconObject", "_labelObject");
  }
});
