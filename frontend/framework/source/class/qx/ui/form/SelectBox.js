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
     * Martin Wittemann (martinwittemann)
     * Sebastian Werner (wpbasti)
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * @appearance selectbox
 */
qx.Class.define("qx.ui.form.SelectBox",
{
  extend : qx.ui.form.AbstractSelectBox,
  implement : qx.ui.core.IFormElement,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._createChildControl("atom");
    this._createChildControl("spacer");
    this._createChildControl("arrow");

    // Register listener
    this.addListener("click", this._onClick, this);
    this.addListener("mousewheel", this._onMouseWheel, this);
    this.addListener("keyinput", this._onKeyInput, this);
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
      init : "selectbox"
    },

    // overridden
    focusable :
    {
      refine : true,
      init : true
    },

    /**
     * The selected item inside the list.
     */
    selected :
    {
      check : "qx.ui.form.ListItem",
      apply : "_applySelected"
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "spacer":
          control = new qx.ui.core.Spacer();
          this._add(control, {flex: 1});
          break;

        case "atom":
          control = new qx.ui.basic.Atom(" ");
          this._add(control, {flex:1});
          break;

        case "arrow":
          control = new qx.ui.basic.Image();
          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },

    // overridden
    _forwardStates : {
      focused : true
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applySelected : function(value, old)
    {
      var list = this._getChildControl("list");
      if (list.getSelectedItem() != value) {
        list.select(value);
      }

      var atom = this._getChildControl("atom");

      var label = value.getLabel();
      label == null ? atom.resetLabel() : atom.setLabel(label);

      var icon = value.getIcon();
      icon == null ? atom.resetIcon() : atom.setIcon(icon);
    },



    /*
    ---------------------------------------------------------------------------
      FORM ELEMENT INTERFACE METHODS
    ---------------------------------------------------------------------------
    */

    // interface implementation
    setValue : function(value) {
      this._getChildControl("list").setValue(value);
    },


    // interface implementation
    getValue : function()
    {
      var item = this.getSelected();
      return item ? item.getFormValue() : null;
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Toggles the popup's visibility.
     *
     * @param e {qx.event.type.Mouse} Mouse event
     * @type member
     */
    _onClick : function(e) {
      this._togglePopup();
    },


    /**
     * Event handler for mousewheel event
     *
     * @param e {qx.event.type.Mouse} Mouse event
     */
    _onMouseWheel : function(e)
    {
      if (this._getChildControl("popup").isVisible()) {
        return;
      }

      var children = this.getChildren();
      var selected = this.getSelected();

      if (!selected) {
        selected = children[0];
      }

      var index = children.indexOf(selected) - e.getWheelDelta();
      var max = children.length - 1;

      // Limit
      if (index < 0) {
        index = 0;
      } else if (index >= max) {
        index = max;
      }

      this.setSelected(children[index]);
    },


    // overridden
    _onKeyPress : function(e)
    {
      if(e.getKeyIdentifier() == "Enter") {
        this._togglePopup();
      } else {
        this.base(arguments, e);
      }
    },


    /**
     * Forwards key event to list widget.
     *
     * @param e {qx.event.type.KeyInput} Key event
     * @type member
     */
    _onKeyInput : function(e)
    {
      // clone the event and re-calibrate the event
      var clone = e.clone();
      clone.setTarget(this._list);
      clone.setBubbles(false);

      // forward it to the list
      this._getChildControl("list").dispatchEvent(clone);
    },


    // overridden
    _onListChangeSelection : function(e)
    {
      var current = e.getData();
      if (current.length > 0) {
        this.setSelected(current[0]);
      }
    },


    // overridden
    _onListChangeValue : function(e) {
      this.fireDataEvent("changeValue", e.getData());
    }
  }
});
