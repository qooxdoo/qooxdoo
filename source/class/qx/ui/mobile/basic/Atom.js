/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gabriel Munteanu (gabios)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * A multi-purpose widget, which combines a label with an icon.
 *
 * The intended purpose of qx.ui.mobile.basic.Atom is to easily align the common icon-text
 * combination in different ways.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var atom = new qx.ui.mobile.basic.Atom("Icon Right", "icon/32/actions/go-next.png");
 *   this.getRoot().add(atom);
 * </pre>
 *
 * This example creates an atom with the label "Icon Right" and an icon.
 */
qx.Class.define("qx.ui.mobile.basic.Atom",
{
  extend : qx.ui.mobile.core.Widget,


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
    this.base(arguments);
    this.__createChildren(label, icon);

    this.addCssClass("gap");
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "atom"
    },

    /** The label/caption/text of the qx.ui.mobile.basic.Atom instance */
    label :
    {
      apply : "_applyLabel",
      nullable : true,
      check : "String",
      event : "changeLabel"
    },

    /** Any URI String supported by qx.ui.mobile.basic.Image to display an icon */
    icon :
    {
      check : "String",
      apply : "_applyIcon",
      nullable : true,
      event : "changeIcon"
    },


    /**
     * Configure the visibility of the sub elements/widgets.
     * Possible values: both, text, icon
     */
    show :
    {
      init : "both",
      check : [ "both", "label", "icon" ],
      inheritable : true,
      apply : "_applyShow"
    },


    /**
     * The position of the icon in relation to the text.
     * Only useful/needed if text and icon is configured and 'show' is configured as 'both' (default)
     */
    iconPosition :
    {
      init   : "left",
      check : [ "top", "right", "bottom", "left" ],
      apply : "_applyIconPosition"
    }
  },

  members :
  {
    __layout : null,
    __label : null,
    __icon : null,
    __childrenContainer : null,


    // property apply
    _applyIconPosition : function(value, old) {
      var verticalLayout = ["top", "bottom"].indexOf(value) != -1;
      var hasNoLabel = !this.__label;

      this.__createLayout(verticalLayout, hasNoLabel);
      var isReverse = ["right", "bottom"].indexOf(value) != -1;
      this.__childrenContainer.setLayout(this.__layout);
      this.__layout.setReversed(isReverse);

      this._domUpdated();
    },


    // property apply
    _applyShow : function(value, old)
    {
      if(this.__label) {
        if(value === 'both' || value === 'label') {
          this.__label.show();
        } else if(value === 'icon') {
          this.__label.exclude();
        }
      }
      if(this.__icon) {
        if(value === 'both' || value === 'icon') {
          this.__icon.show();
        } else if(value === 'label') {
          this.__icon.exclude();
        }
      }
    },


    // property apply
    _applyLabel : function(value, old)
    {
      if (this.__label) {
        this.__label.setValue(value);
      } else {
        this.__label = this._createLabelWidget(value);
      }
    },


    // property apply
    _applyIcon : function(value, old)
    {
      if (this.__icon) {
        this.__icon.setSource(value);
      } else {
        this.__icon = this._createIconWidget(value);
      }
    },


    /**
     * Takes care of lazily creating the layout and disposing an already
     * present layout if necessary.
     *
     * @param verticalLayout {Boolean} Whether icon and label should be vertically aligned.
     * @param hasNoLabel {Boolean} Whether the atom currently contains a label.
     */
    __createLayout : function(verticalLayout, hasNoLabel)
    {
      if (verticalLayout || hasNoLabel)
      {
        if (this.__layout)
        {
          if (this.__layout.classname !== "qx.ui.mobile.layout.VBox")
          {
            this.__layout.dispose();
            this.__layout = new qx.ui.mobile.layout.VBox();
          }
        }
        // layout == null
        else {
          this.__layout = new qx.ui.mobile.layout.VBox();
        }
      }
      // horizontal layout and has label
      else
      {
        if (this.__layout)
        {
          if (this.__layout.classname !== "qx.ui.mobile.layout.HBox")
          {
            this.__layout.dispose();
            this.__layout = new qx.ui.mobile.layout.HBox();
          }
        }
        // layout == null
        else {
          this.__layout = new qx.ui.mobile.layout.HBox();
        }
      }
    },


    /**
     * Returns the icon widget.
     *
     * @return {qx.ui.mobile.basic.Image} The icon widget.
     */
    getIconWidget: function() {
      return this.__icon;
    },


    /**
     * Returns the label widget.
     *
     * @return {qx.ui.mobile.basic.Label} The label widget.
     */
    getLabelWidget : function() {
      return this.__label;
    },


    /**
     * Creates the icon widget.
     *
     * @param iconUrl {String} The icon url.
     * @return {qx.ui.mobile.basic.Image} The created icon widget.
     */
    _createIconWidget : function(iconUrl)
    {
      var iconWidget = new qx.ui.mobile.basic.Image(iconUrl);
      qx.bom.element.Style.set(iconWidget.getContentElement(),"display","block");
      iconWidget.setAnonymous(true);
      iconWidget.addCssClass("gap");
      return iconWidget;
    },


    /**
     * Creates the label widget.
     *
     * @param label {String} The text that should be displayed.
     * @return {qx.ui.mobile.basic.Label} The created label widget.
     */
    _createLabelWidget : function(label)
    {
      var labelWidget = new qx.ui.mobile.basic.Label(label);
      labelWidget.setAnonymous(true);
      labelWidget.setWrap(false);
      labelWidget.addCssClass("gap");
      return labelWidget;
    },


    /**
     * This function is responsible for creating and adding 2 children controls to the Button widget.
     * A label and an icon.
     * @param label {String} the text of the button
     * @param icon {String} A path to an image resource
     *
     */
    __createChildren : function(label, icon) {
      this.__label = this._createLabelWidget(label);
      if(label)
      {
        this.setLabel(label);
      }

      this.__icon = this._createIconWidget(icon);
      if (icon) {
        this.setIcon(icon);
      } else {
        this.__icon.exclude();
      }

      var verticalLayout = [ "top", "bottom" ].indexOf(this.getIconPosition()) != -1;
      // If Atom has no Label, only Icon is shown, and should vertically centered.
      var hasNoLabel = !this.__label;

      this.__createLayout(verticalLayout, hasNoLabel);

      if(this.__childrenContainer) {
        this.__childrenContainer.dispose();
      }

      this.__childrenContainer = new qx.ui.mobile.container.Composite(this.__layout);
      this.__childrenContainer.addCssClass("qx-flex-center");
      this.__childrenContainer.setAnonymous(true);

      if(this.__icon) {
        this.__childrenContainer.add(this.__icon);
      }

      if(this.__label) {
        this.__label.addCssClass("qx-flex-center");
        this.__childrenContainer.add(this.__label);
      }

      // Show/Hide Label/Icon
      if(this.getShow() === 'icon' && this.__label) {
        this.__label.exclude();
      }
      if(this.getShow() === 'label' && this.__icon) {
        this.__icon.exclude();
      }

      this._add(this.__childrenContainer);
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__layout", "__label", "__icon", "__childrenContainer");
  }
});
