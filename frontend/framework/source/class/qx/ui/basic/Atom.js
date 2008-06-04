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
  construct : function(label, icon)
  {
    if (qx.core.Variant.isSet("qx.debug", "on")) {
      this.assertArgumentsCount(arguments, 0, 2);
    }

    this.base(arguments);

    this._setLayout(new qx.ui.layout.Atom());

    if (label) {
      this.setLabel(label);
    }

    if (icon) {
      this.setIcon(icon);
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
      check : "String"
    },


    /**
     * Switches between rich HTML and text content. The text mode (<code>false</code>) supports
     * advanced features like ellipsis when the available space is not
     * enough. HTML mode (<code>true</code>) supports multi-line content and all the
     * markup features of HTML content.
     */
    rich :
    {
      check : "Boolean",
      init : false,
      apply : "_applyRich"
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
     * The space between the icon and the label
     */
    gap :
    {
      check : "Integer",
      nullable : false,
      event : "changeGap",
      apply : "_applyGap",
      themeable : true,
      init : 4
    },


    /**
     * Configure the visibility of the sub elements/widgets.
     * Possible values: both, text, icon, none
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
     * Only useful/needed if text and icon is configured and 'show' is configured as 'both' (default)
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
      if (this.getLabel() == null || this.getShow() === "icon") {
        this._remove(this._label);
      } else {
        this._add(this._label);
      }
    },


    /**
     * Updates the visibility of the icon
     */
    _handleIcon : function()
    {
      if (this.getIcon() == null || this.getShow() === "label") {
        this._remove(this._icon);
      } else {
        this._addAt(this._icon, 0);
      }
    },


    // property apply
    _applyLabel : function(value, old)
    {
      if (this._label)
      {
        this._label.setContent(value);
      }
      else
      {
        this._label = new qx.ui.basic.Label(value);
        this._label.setAnonymous(true);
        this._label.setRich(this.getRich());
      }

      this._handleLabel();
    },


    _applyRich : function(value, old)
    {
      if (this._label) {
        this._label.setRich(value);
      }
    },


    // property apply
    _applyIcon : function(value, old)
    {
      if (this._icon)
      {
        this._icon.setSource(value);
      }
      else
      {
        this._icon = new qx.ui.basic.Image(value);
        this._icon.setAnonymous(true);
      }

      this._handleIcon();
    },


    // property apply
    _applyGap : function(value, old) {
      this._getLayout().setGap(value);
    },


    // property apply
    _applyShow : function(value, old)
    {
      if (this._label) {
        this._handleLabel();
      }

      if (this._icon) {
        this._handleIcon();
      }
    },


    // property apply
    _applyIconPosition : function(value, old) {
      this._getLayout().setAlign(value);
    }
  }
});
