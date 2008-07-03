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
    // overridden
    appearance :
    {
      refine : true,
      init : "atom"  
    },
    
    
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
     * Possible values: both, text, icon
     */
    show :
    {
      init : "both",
      check : [ "both", "label", "icon" ],
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

      switch(id)
      {
        case "label":
          control = new qx.ui.basic.Label(this.getLabel());
          control.setAnonymous(true);
          control.setRich(this.getRich());
          this._add(control);
          if (this.getLabel() == null || this.getShow() === "icon") {
            control.exclude(); 
          }
          break;

        case "icon":
          control = new qx.ui.basic.Image(this.getIcon());
          control.setAnonymous(true);
          this._addAt(control, 0);
          if (this.getIcon() == null || this.getShow() === "label") {
            control.exclude(); 
          }
          break;
      }
      
      return control || this.base(arguments, id);
    },


    /**
     * Updates the visibility of the label
     *
     * @param control {qx.ui.basic.Label?null} (Optional) the label instance
     */
    _handleLabel : function()
    {
      if (this.getLabel() == null || this.getShow() === "icon") {
        this._excludeChildControl("label");
      } else {
        this._showChildControl("label");
      }
    },


    /**
     * Updates the visibility of the icon
     *
     * @param control {qx.ui.basic.Icon?null} (Optional) the icon instance
     */
    _handleIcon : function()
    {
      if (this.getIcon() == null || this.getShow() === "label") {
        this._excludeChildControl("icon");
      } else {
        this._showChildControl("icon");
      }
    },


    // property apply
    _applyLabel : function(value, old)
    {
      var label = this._getChildControl("label", true);
      if (label) {
        label.setContent(value);
      }
      this._handleLabel();
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
      this._handleIcon();
    },


    // property apply
    _applyGap : function(value, old) {
      this._getLayout().setGap(value);
    },


    // property apply
    _applyShow : function(value, old)
    {
      this._handleLabel();
      this._handleIcon();
    },


    // property apply
    _applyIconPosition : function(value, old) {
      this._getLayout().setAlign(value);
    }
  }
});
