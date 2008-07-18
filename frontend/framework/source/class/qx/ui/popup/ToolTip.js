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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Tooltips provide additional help for widgets if the user hovers a widget.
 *
 * *Example*
 * <pre class="javascript">
 * var widget = new qx.ui.form.Button("save");
 *
 * var tooltip = new qx.ui.popup.ToolTip("Save the opened file");
 * widget.setToolTip(tooltip);
 * </pre>
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/tooltip' target='_blank'>
 * Documentation of this widget in the qooxdoo wiki.</a>
 *
 * @appearance tooltip
 */
qx.Class.define("qx.ui.popup.ToolTip",
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

    // Initialize manager
    qx.ui.popup.ToolTipManager.getInstance();

    // Use static layout
    this.setLayout(new qx.ui.layout.Basic());

    // Integrate atom
    this._createChildControl("atom");

    // Initialize properties
    if (label != null) {
      this.setLabel(label);
    }

    if (icon != null) {
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
      init : "tooltip"
    },

    /** Left offset of the mouse pointer (in pixel) */
    offsetLeft :
    {
      check : "Integer",
      init : 1
    },

    /** Top offset of the mouse pointer (in pixel) */
    offsetTop :
    {
      check : "Integer",
      init : 1
    },

    /** Right offset of the mouse pointer (in pixel) */
    offsetRight :
    {
      check : "Integer",
      init : 1
    },

    /** Bottom offset of the mouse pointer (in pixel) */
    offsetBottom :
    {
      check : "Integer",
      init : 20
    },

    /** Interval after the tooltip is shown (in milliseconds) */
    showTimeout :
    {
      check : "Integer",
      init : 1000
    },

    /** Interval after the tooltip is hidden (in milliseconds) */
    hideTimeout :
    {
      check : "Integer",
      init : 4000
    },

    /** The label/caption/text of the ToolTip's atom. */
    label :
    {
      check : "String",
      init : "",
      apply : "_applyLabel"
    },

    /** Any URI String supported by qx.ui.basic.Image to display an icon in ToolTips's atom. */
    icon :
    {
      check : "String",
      init : "",
      apply : "_applyIcon"
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
        case "atom":
          control = new qx.ui.basic.Atom;
          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyIcon : function(value, old) {
      this._getChildControl("atom").setIcon(value);
    },

    // property apply
    _applyLabel : function(value, old) {
      this._getChildControl("atom").setLabel(value);
    },




    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    show : function(e)
    {
      var mgr = qx.ui.popup.ToolTipManager.getInstance();
      if (mgr.getCurrent() == this)
      {
        var left = mgr.getLastLeft() + this.getOffsetRight();
        var top = mgr.getLastTop() + this.getOffsetBottom();

        this.moveTo(left, top);
      }

      this.base(arguments);
    },




    /*
    ---------------------------------------------------------------------------
      HELPERS
    ---------------------------------------------------------------------------
    */

    // overridden
    _normalizeLeft : function(left)
    {
      var bounds = this.getBounds();
      var parentBounds = this.getLayoutParent().getBounds();

      if (!bounds || !parentBounds) {
        return left;
      }

      var mouseLeft = qx.ui.popup.ToolTipManager.getInstance().getLastLeft();
      if (bounds.left < 0) {
        return 0;
      } else if ((bounds.left + bounds.width) > parentBounds.width) {
        return Math.max(0, mouseLeft - this.getOffsetRight() - bounds.width);
      }

      return left;
    },


    // overridden
    _normalizeTop : function(top)
    {
      var bounds = this.getBounds();
      var parentBounds = this.getLayoutParent().getBounds();

      if (!bounds || !parentBounds) {
        return top;
      }

      var mouseTop = qx.ui.popup.ToolTipManager.getInstance().getLastTop();
      if (bounds.top < 0) {
        return 0;
      } else if ((bounds.top + bounds.height) > parentBounds.height) {
        return Math.max(0, mouseTop - this.getOffsetTop() - bounds.height);
      }

      return top;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_showTimer", "_hideTimer");
  }
});
