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
 * A multi-purpose widget used by many more complex widgets.
 *
 * The intended purpose of qx.ui.basic.Atom is to easily align the common icon-text
 * combination in different ways.
 *
 * This is useful for all types of buttons, tooltips, ...
 *
 * @appearance atom
 */
qx.Class.define("qx.ui.basic.Atom",
{
  extend : qx.ui.core.Widget,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  /**
   * @param label {String} label of the atom
   * @param icon {String?null} Icon URL of the atom
   */
  construct : function(label, iconUrl)
  {
    this.base(arguments);

    this.setLayout(new qx.ui.layout.Atom());

    if (label) {
      this.setLabel(label);
    }

    if (iconUrl) {
      this.setIcon(iconUrl);
    }
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The label/caption/text of the qx.ui.basic.Atom instance */
    label :
    {
      apply : "_applyLabel",
      nullable : true,
      dispose : true,
      check : "Label"
    },


    /** Any URI String supported by qx.ui.basic.Image to display a icon */
    icon :
    {
      check : "String",
      apply : "_applyIcon",
      nullable : true,
      themeable : true
    },


    /**
     * Any URI String supported by qx.ui.basic.Image to display a disabled icon.
     * <p>
     * If not set the normal icon is shown transparently.
     */
    disabledIcon :
    {
      check : "String",
      apply : "_applyDisabledIcon",
      nullable : true,
      themeable : true
    },


    /**
     * The space between the icon and the label
     */
    gap :
    {
      check : "Integer",
      nullable : false,
      event : "changeGap",
      apply : "_applyGap",
      init : 4
    },


    /**
     * Configure the visibility of the sub elements/widgets.
     *  Possible values: both, text, icon, none
     */
    show :
    {
      init : "both",
      check : [ "both", "label", "icon", "none"],
      themeable : true,
      nullable : true,
      inheritable : true,
      apply : "_applyShow",
      event : "changeShow"
    },


    /**
     * The position of the icon in relation to the text.
     *  Only useful/needed if text and icon is configured and 'show' is configured as 'both' (default)
     */
    iconPosition :
    {
      init   : "left",
      check : [ "top", "right", "bottom", "left" ],
      themeable : true,
      apply : "_applyIconPosition"
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Updates the visibility of the label
     */
    _handleLabel : function()
    {
      var show = this.getShow();
      if (
        this._label &&
        (show == "both" || show == "label")
      ) {
        this.getLayout().setText(this._label);
      } else {
        this.getLayout().setText(null);
      }
    },


    /**
     * Updates the visibility of the icon
     */
    _handleIcon : function()
    {
      var show = this.getShow();
      if (show == "both" || show == "icon")
      {
        if (!this.getEnabled() && this._disabledIcon) {
          this.getLayout().setIcon(this._disabledIcon);
        } else {
          this.getLayout().setIcon(this._icon || this._disabledIcon || null);
        }
      }
      else
      {
        this.getLayout().setIcon(null);
      }
    },


    // property apply
    _applyLabel : function(value, old)
    {
      if (this._label) {
        this._label.setText(value);
      } else {
        this._label = new qx.ui.basic.Label(value);
      }
      this._handleLabel();
    },


    // property apply
    _applyIcon : function(value, old)
    {
      if (this._icon) {
        this._icon.setSource(value);
      } else {
        this._icon = new qx.ui.basic.Icon(value);
      }

      this._handleIcon();
    },


    // property apply
    _applyDisabledIcon : function(value, old)
    {
      if (this._disabledIcon) {
        this._disabledIcon.setSource(value);
      } else {
        this._disabledIcon = new qx.ui.basic.Icon(value);
      }

      this._handleIcon();
    },


    // property apply
    _applyGap : function(value, old) {
      this.getLayout().setGap(value);
    },


    // property apply
    _applyShow : function(value, old)
    {
      this._handleLabel();
      this._handleIcon();
    },


    // property apply
    _applyIconPosition : function(value, old) {
      this.getLayout().setIconPosition(value);
    }

  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
  }
});