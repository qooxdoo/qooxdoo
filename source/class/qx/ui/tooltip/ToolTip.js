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
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A Tooltip provides additional information for widgets when the user hovers
 * over a widget.
 *
 * @childControl atom {qx.ui.basic.Atom} atom widget which represents the content of the tooltip
 */
qx.Class.define("qx.ui.tooltip.ToolTip",
{
  extend : qx.ui.popup.Popup,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} label of the tooltip
   * @param icon {String?null} Icon URL of the tooltip
   */

  construct : function(label, icon)
  {
    this.base(arguments);

    // Use static layout
    this.setLayout(new qx.ui.layout.HBox());

    this._createChildControl("arrow");
    // Integrate atom
    this._createChildControl("atom");

    // Initialize properties
    if (label != null) {
      this.setLabel(label);
    }

    if (icon != null) {
      this.setIcon(icon);
    }

    this.addListener("pointerover", this._onPointerOver, this);
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
      init : "tooltip"
    },

    /** Interval after the tooltip is shown (in milliseconds) */
    showTimeout :
    {
      check : "Integer",
      init : 700,
      themeable : true
    },

    /** Interval after the tooltip is hidden (in milliseconds) */
    hideTimeout :
    {
      check : "Integer",
      init : 4000,
      themeable : true
    },

    /** The label/caption/text of the ToolTip's atom. */
    label :
    {
      check : "String",
      nullable : true,
      apply : "_applyLabel"
    },

    /**
     * Any URI String supported by qx.ui.basic.Image to display an icon in
     * ToolTips's atom.
     */
    icon :
    {
      check : "String",
      nullable : true,
      apply : "_applyIcon",
      themeable : true
    },

    /**
     * Switches between rich HTML and text content. The text mode
     * (<code>false</code>) supports advanced features like ellipsis when the
     * available space is not enough. HTML mode (<code>true</code>) supports
     * multi-line content and all the markup features of HTML content.
     */
    rich :
    {
      check : "Boolean",
      init : false,
      apply : "_applyRich"
    },


    /** Widget that opened the tooltip */
    opener :
    {
      check : "qx.ui.core.Widget",
      nullable : true
    },


    /** Position of the arrow pointing towards the opening widget **/
    arrowPosition :
    {
      check : ["left", "right"],
      init : "left",
      themeable : true,
      apply : "_applyArrowPosition"
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
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates :
    {
      placementLeft : true
    },

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "atom":
          control = new qx.ui.basic.Atom();
          this._add(control, {flex: 1});
          break;
        case "arrow":
          control = new qx.ui.basic.Image();
          this._add(control);
      }

      return control || this.base(arguments, id);
    },


    /**
     * Listener method for "pointerover" event
     *
     * @param e {qx.event.type.Pointer} Pointer event
     */
    _onPointerOver : function(e) {
      //this.hide();
    },


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyIcon : function(value, old)
    {
      var atom = this.getChildControl("atom");
      value == null ? atom.resetIcon() : atom.setIcon(value);
    },


    // property apply
    _applyLabel : function(value, old)
    {
      var atom = this.getChildControl("atom");
      value == null ? atom.resetLabel() : atom.setLabel(value);
    },

    // property apply
    _applyRich : function(value, old)
    {
      var atom = this.getChildControl("atom");
      atom.setRich(value);
    },

    // property apply
    _applyArrowPosition : function(value, old)
    {
      this._getLayout().setReversed(value == "left");
    }
  }
});
