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
 * var tooltip = new qx.ui.tooltip.ToolTip("Save the opened file");
 * widget.setToolTip(tooltip);
 * </pre>
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/tooltip' target='_blank'>
 * Documentation of this widget in the qooxdoo wiki.</a>
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

    // Initialize manager
    qx.ui.tooltip.Manager.getInstance();

    // Use static layout
    this.setLayout(new qx.ui.layout.Grow);

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

    /** Interval after the tooltip is shown (in milliseconds) */
    showTimeout :
    {
      check : "Integer",
      init : 1000,
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

    /** Any URI String supported by qx.ui.basic.Image to display an icon in ToolTips's atom. */
    icon :
    {
      check : "String",
      nullable : true,
      apply : "_applyIcon",
      themeable : true
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
    _applyIcon : function(value, old)
    {
      var atom = this._getChildControl("atom");
      value == null ? atom.resetIcon : atom.setIcon(value);
    },


    // property apply
    _applyLabel : function(value, old)
    {
      var atom = this._getChildControl("atom");
      value == null ? atom.resetLabel() : atom.setLabel(value);
    }
  }
});
