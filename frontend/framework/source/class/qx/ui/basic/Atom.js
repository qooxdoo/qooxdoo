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
    // overridden
    _createChildControlImpl : function(id)
    {
      var control;
      var show = this.getShow();

      switch(id)
      {
        case "label":
          control = new qx.ui.basic.Label(this.getLabel()).set({
            anonymous: true,
            rich: this.getRich()
          });
          this._add(control);
          if (show == "none" || show == "icon") {
            control.exclude();
          }
          break;

        case "icon":
          control = new qx.ui.basic.Image(this.getIcon()).set({
            anonymous: true
          });
          this._addAt(control, 0);
          if (show == "none" || show == "label") {
            control.exclude();
          }
          break;
      }
      return control || this.base(arguments, id);
    },


    // property apply
    _applyLabel : function(value, old)
    {
      var label = this._getChildControl("label", true);
      if (label) {
        label.setContent(value);
      }
    },


    // property apply
    _applyRich : function(value, old)
    {
      var label = this._getChildControl("label", true);
      if (label) {
        label.setRich(value);
      }
    },


    // property apply
    _applyIcon : function(value, old)
    {
      var icon = this._getChildControl("icon", true);
      if (icon) {
        icon.setSource(value);
      }
    },


    // property apply
    _applyGap : function(value, old) {
      this._getLayout().setGap(value);
    },


    // property apply
    _applyShow : function(value, old)
    {
      var show = this.getShow();

      if (show == "both" || show == "label") {
        this._showChildControl("label");
      } else {
        this._excludeChildControl("label");
      }

      if (show == "both" || show == "icon") {
        this._showChildControl("icon");
      } else {
        this._excludeChildControl("icon");
      }
    },


    // property apply
    _applyIconPosition : function(value, old) {
      this._getLayout().setAlign(value);
    }
  }
});
