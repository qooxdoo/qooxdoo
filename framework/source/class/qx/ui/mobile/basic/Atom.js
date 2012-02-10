/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gabriel Munteanu (gabios)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * A multi-purpose widget, which combines a label with an icon.
 *
 * The intended purpose of qx.ui.basic.Atom is to easily align the common icon-text
 * combination in different ways.
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
    this.initGap();
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
     * The space between the icon and the label
     */
    gap :
    {
      check : "Integer",
      nullable : false,
      apply : "_applyGap",
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
    },


    /**
     * Whether the content should be rendered centrally when too much space
     * is available. Affects both axis.
     */
    center :
    {
      init : true,
      check : "Boolean",
      apply : "_applyCenter"
    }
  },

  members :
  {
    __label : null,
    __icon : null,
    __childrenContainer : null,
    __emptyLabel : null,

   
        // property apply
    _applyIconPosition : function(value, old) {
        // TOP or BOTTOM handling.
        var targetLayout;
        var newVerticalLayout = ["top", "bottom"].indexOf(value) != -1;
        var oldVerticalLayout = ["top", "bottom"].indexOf(old) != -1;

        // Fail handling...
        if(newVerticalLayout && !oldVerticalLayout) {
            targetLayout = new qx.ui.mobile.layout.VBox();
            this.__label.setDisplay(null);
        }
        if(!newVerticalLayout && oldVerticalLayout) {
            targetLayout = new qx.ui.mobile.layout.HBox();
            this.__label.setDisplay('inline');
        }

        if(targetLayout) {
            // only if targetLayout changed is set, change layout.
            this.__childrenContainer.setLayout(targetLayout);
        }

        // TOP or LEFT handling.
        var newIconFirst = ["top", "left"].indexOf(value) != -1;
        var oldIconFirst = ["top", "left"].indexOf(old) != -1;
        if(newIconFirst != oldIconFirst) {
            if(newIconFirst) {
                this.__childrenContainer.remove(this.__label);
                this.__childrenContainer._addAfter(this.__label, this.__icon);
            } else {
                this.__childrenContainer.remove(this.__icon);
                this.__childrenContainer._addAfter(this.__icon, this.__label);
            }

            var oldMarginGap = this.__getOpposedPosition(old);
            this.__icon._setStyle('margin' + qx.lang.String.firstUp(oldMarginGap), null);

            this._applyGap(this.getGap());
            this._domUpdated();
        }
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
    _applyGap : function(value, old)
    {
      if(this.__icon)
      {
        var marginPosition = this.__getOpposedPosition(this.getIconPosition());
        this.__icon._setStyle('margin'+qx.lang.String.firstUp(marginPosition), value + 'px');
      }
    },

    /**
     * Returns the opposed position for a given position.
     * @param position {String} "left", "right", "bottom", "right" position.
     * @return {String} opposed position.
     */
    __getOpposedPosition : function(position)
    {
      var opposedPosition = 'left';
      switch(position)
      {
        case 'top':
          opposedPosition = 'bottom';
          break;
        case 'bottom':
          opposedPosition = 'top';
          break;
        case 'left':
          opposedPosition = 'right';
          break;
      }
      return opposedPosition;
    },


    // property apply
    _applyLabel : function(value, old)
    {
      if(this.__label)
      {
        this.__label.setValue(value);
      }
      else
      {
        this.__label = this._createLabelWidget(value);
        if(this.__icon)
        {
          var iconFirst = [ "top", "left" ].indexOf(this.getIconPosition()) != -1;
          if(iconFirst) {
            this.__childrenContainer._addAfter(this.__label, this.__icon);
          } else {
            this.__childrenContainer._addBefore(this.__label, this.__icon);
          }
        }
        if(this.__emptyLabel) {
          this.__childrenContainer._addAfter(this.__label, this.__emptyLabel);
          this.__emptyLabel.destroy();
          this.__emptyLabel = null;
        }
      }
    },


    // property apply
    _applyIcon : function(value, old)
    {
      if(this.__icon)
      {
        this.__icon.setSource(value);
      }
      else
      {
        this.__icon = this._createIconWidget(value);
        var iconFirst = [ "top", "left" ].indexOf(this.getIconPosition()) != -1;
        if(iconFirst) {
          this.__childrenContainer._addBefore(this.__icon, this.__label);
        } else {
          this.__childrenContainer._addAfter(this.__icon, this.__label);
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
      iconWidget.setAnonymous(true);
      iconWidget._setStyle('verticalAlign', 'middle');
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
      var verticalLayout = [ "top", "bottom" ].indexOf(this.getIconPosition()) != -1;
      if(!verticalLayout) {
        labelWidget._setStyle('display', 'inline');
      }
      return labelWidget;
    },


    /**
     *
     * This function is responsible for creating and adding 2 children controls to the Button widget.
     * A label and an icon.
     * @param label {String} the text of the button
     * @param icon {String} A path to an image resource
     *
     */
    __createChildren : function(label, icon) {
      if(label)
      {
        this.__label = this._createLabelWidget(label);
        this.setLabel(label);
      }
      if(icon)
      {
        this.__icon = this._createIconWidget(icon);
        this.setIcon(icon);
      }
      var verticalLayout = [ "top", "bottom" ].indexOf(this.getIconPosition()) != -1;
      var layout = verticalLayout ? new qx.ui.mobile.layout.VBox() : new qx.ui.mobile.layout.HBox();
      if(this.getCenter())
      {
        if(verticalLayout)
        {
          layout.set({alignY: "middle"});
        }
        else
        {
          layout.set({alignX: "center"});
        }
      }
      this.__childrenContainer = new qx.ui.mobile.container.Composite(layout);
      this.__childrenContainer.setAnonymous(true);
      var iconFirst = [ "top", "left" ].indexOf(this.getIconPosition()) != -1;
      if(this.__icon && this.__label)
      {
        if (iconFirst) {
          this.__childrenContainer.add(this.__icon);
          this.__childrenContainer.add(this.__label, {flex : 1});
        } else {
          this.__childrenContainer.add(this.__label, {flex : 1});
          this.__childrenContainer.add(this.__icon);
        }
      }
      else
      {
        if(this.__icon) {
          this.__childrenContainer.add(this.__icon);
        }
        if(this.__label) {
          this.__childrenContainer.add(this.__label, {flex : 1});
        }
        else
        {
          if(!this.__icon)
          {
            this.__emptyLabel = new qx.ui.mobile.basic.Label(" ");
            this.__childrenContainer.add(this.__emptyLabel);
          }
        }
      }
      if(this.getShow() === 'icon' && this.__label) {
        this.__label.exclude();
      }
      if(this.getShow() === 'label' && this.__icon) {
        this.__icon.exclude();
      }
      var verticalCenteredContainer = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox().set({alignY:"middle"}));
      verticalCenteredContainer.setAnonymous(true);
      verticalCenteredContainer.add(this.__childrenContainer, {'flex': 0});
      this._add(verticalCenteredContainer);
    }
  },


     
  /*
  *****************************************************************************
  DESTRUCTOR
  *****************************************************************************
  */ destruct : function() {
      this._disposeObjects("__label", "__emptyLabel", "__icon", "__childrenContainer");
  }

});
