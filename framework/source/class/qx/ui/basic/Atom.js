/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A multi-purpose widget, which combines a label with an icon.
 *
 * The intended purpose of qx.ui.basic.Atom is to easily align the common icon-text
 * combination in different ways.
 *
 * This is useful for all types of buttons, tooltips, ...
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var atom = new qx.ui.basic.Atom("Icon Right", "icon/32/actions/go-next.png");
 *   this.getRoot().add(atom);
 * </pre>
 *
 * This example creates an atom with the label "Icon Right" and an icon.
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/atom.html' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 *
 *
 * @childControl label {qx.ui.basic.Label} label part of the atom
 * @childControl icon {qx.ui.basic.Image} icon part of the atom
 */
qx.Class.define("qx.ui.basic.Atom", {
  extend : qx.ui.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Label to use
   * @param icon {String?null} Icon to use
   */
  construct : function(label, icon)
  {
    if (qx.core.Environment.get("qx.debug")) {
      this.assertArgumentsCount(arguments, 0, 2);
    }

    this.base(arguments);

    this._setLayout(new qx.ui.layout.Atom());

    if (label != null) {
      this.setLabel(label);
    }

    if (icon !== undefined) {
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
      check : "String",
      event : "changeLabel"
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


    /** Any URI String supported by qx.ui.basic.Image to display an icon */
    icon :
    {
      check : "String",
      apply : "_applyIcon",
      nullable : true,
      themeable : true,
      event : "changeIcon"
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
     * Possible values: both, label, icon
     */
    show :
    {
      init : "both",
      check : [ "both", "label", "icon" ],
      themeable : true,
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
      check : ["top", "right", "bottom", "left", "top-left", "bottom-left" , "top-right", "bottom-right"],
      themeable : true,
      apply : "_applyIconPosition"
    },


    /**
     * Whether the content should be rendered centrally when to much space
     * is available. Enabling this property centers in both axis. The behavior
     * when disabled of the centering depends on the {@link #iconPosition} property.
     * If the icon position is <code>left</code> or <code>right</code>, the X axis
     * is not centered, only the Y axis. If the icon position is <code>top</code>
     * or <code>bottom</code>, the Y axis is not centered. In case of e.g. an
     * icon position of <code>top-left</code> no axis is centered.
     */
    center :
    {
      init : false,
      check : "Boolean",
      themeable : true,
      apply : "_applyCenter"
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
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "label":
          control = new qx.ui.basic.Label(this.getLabel());
          control.setAnonymous(true);
          control.setRich(this.getRich());
          control.setSelectable(this.getSelectable());
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


    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates :
    {
      focused : true,
      hovered : true
    },


    /**
     * Updates the visibility of the label
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
      var label = this.getChildControl("label", true);
      if (label) {
        label.setValue(value);
      }

      this._handleLabel();
    },


    // property apply
    _applyRich : function(value, old)
    {
      var label = this.getChildControl("label", true);
      if (label) {
        label.setRich(value);
      }
    },


    // property apply
    _applyIcon : function(value, old)
    {
      var icon = this.getChildControl("icon", true);
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
      this._getLayout().setIconPosition(value);
    },


    // property apply
    _applyCenter : function(value, old) {
      this._getLayout().setCenter(value);
    },


    // overridden
    _applySelectable : function(value, old) {
      this.base(arguments, value, old);

      var label = this.getChildControl("label", true);
      if (label) {
        this.getChildControl("label").setSelectable(value);
      }
    }
  }
});
