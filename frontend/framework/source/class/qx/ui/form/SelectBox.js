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
 * @appearance selectbox-button
 */

qx.Class.define("qx.ui.form.SelectBox",
{
  extend : qx.ui.form.AbstractSelectBox,



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
    this._createChildControl("down-arrow");

    var list = this._getChildControl("list");
    var listPopup = this._getChildControl("popup");
    listPopup.add(list);

    // register the mouse listener
    this.addListener("mousedown", this._onMouseDown, this);

    // Listener for Search as you type (forward the keyinput event)
    this.addListener("keyinput", this._onKeyInput, this);

    // add a hide listener for clicks on the list
    listPopup.addListener("mouseup", this._hideList, this);
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
      init : "button"
    },

    // overridden
    focusable :
    {
      refine : true,
      init : true
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
        case "spacer":
          control = new qx.ui.core.Spacer();
          this._add(control, {flex: 1});
          break;

        case "atom":
          control = new qx.ui.basic.Atom(" ");
          this._add(control, {flex:1});
          break;

        case "down-arrow":
          control = new qx.ui.basic.Image("decoration/arrows/down.gif");
          control.setAppearance("selectbox-button");
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
    _applySelectedItem : function(value, old)
    {
      this.base(arguments, value, old);
      
      var atom = this._getChildControl("atom");
      atom.setLabel(value.getLabel());
      atom.setIcon(value.getIcon());      
    },

    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Toggles the popup's visibility.
     * @param e {qx.event.type.MouseEvent} Mouse event
     * @type member
     */
    _onMouseDown : function(e) {
      this._togglePopup(e);
    },

    /**
     * Forwards key event to list widget.
     * @param e {qx.event.type.KeyEvent} Key event
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
    }

  }
});
