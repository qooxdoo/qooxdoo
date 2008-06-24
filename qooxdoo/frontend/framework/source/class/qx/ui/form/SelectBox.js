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
  extend  : qx.ui.form.AbstractSelectBox,



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
    var listPopup = this._getChildControl("list-popup");
    listPopup.add(list);

    this.addListener("resize", function(e) {
      list.setMinWidth(e.getData().width);
    });

    // register the mouse and keyboard listener
    this.addListener("mousedown", this._onMouseDown, this);

    // Listener for Search as you type (forward the keyinput event)
    this.addListener("keyinput", function(e) {
      // clone the event and re-calibrate the event
      var clone = e.clone();
      clone.setTarget(this._list);
      clone.setBubbles(false);
      // forward it to the list
      list.dispatchEvent(clone);
    }, this);

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
          // add the spacer
          control = new qx.ui.core.Spacer();
          this._add(control, {flex: 1});
        break;

        case "atom":
          // create the label
          control = new qx.ui.basic.Atom(" ");
          this._add(control, {flex:1});
        break;

        case "down-arrow":
          // create the down arrow
          control = new qx.ui.basic.Image("decoration/arrows/down.gif");
          control.setPaddingRight(4);
          control.setPaddingLeft(5);
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

    _applySelectedItem : function(value, old)
    {
      var atom = this._getChildControl("atom");
      atom.setLabel(value.getLabel());
      atom.setIcon(value.getIcon());

      this.base(arguments, value, old);
    },

    _onMouseDown : function(e) {
      this._activate(e);
    }

  }
});
