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
 * @appearance combobox
 */
qx.Class.define("qx.ui.form.ComboBox",
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

    // TODO: Call create("popup") here, move other stuff to _createChildControl
    var list = this._getChildControl("list");
    var listPopup = this._getChildControl("popup");
    listPopup.add(list);
    listPopup.addListener("changeVisibility", this._onChangeVisibilityList, this);

    var textField = this._getChildControl("textfield");
    textField.addListener("blur", this._onTextBlur, this);
    textField.addListener("focus", this._onTextFocus, this);
    
    this._createChildControl("button");
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    focusable :
    {
      refine : true,
      init : true
    },

    // overridden
    appearance :
    {
      refine : true,
      init : "spinner"
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
        case "textfield":
          // create the textField
          control = new qx.ui.form.TextField();
          control.setAppearance("spinner-text-field");    
          control.addListener("blur", this._onTextBlur, this);
          control.addListener("focus", this._onTextFocus, this);    
          this._add(control, {flex: 1});
          break;

        case "button":
          // create the button
          control = new qx.ui.form.Button(null, "decoration/arrows/down.gif");
          control.setFocusable(false);
          control.addListener("click", this._onClick, this);
          this._add(control);
          break;

        case "popup":
          // create the popup list
          control = new qx.ui.popup.Popup(new qx.ui.layout.VBox()).set({
            autoHide: false
          });
          control.addListener("mouseup", this._hideList, this);
          control.addListener("changeVisibility", this._onChangeVisibilityList, this);
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
      this.base(arguments, value, old);
      
      this._getChildControl("textfield").setValue(value.getLabel());
    },


    /*
    ---------------------------------------------------------------------------
      FOCUS
    ---------------------------------------------------------------------------
    */ 
       
    /**
     * Callback method for the "blur" event of the textfield.
     *
     * @type member
     * @param e {qx.ui.event.type.Event} blur event
     */
    _onTextBlur: function(e) {
      this.removeState("focused");
    },


    /**
     * Callback method for the "focus" event of the textfield.
     *
     * @type member
     * @param e {qx.ui.event.type.Event} blur event
     */
    _onTextFocus : function(e) {
      this.addState("focused");
    },

    _onClick : function(e) {
      this._togglePopup(e);
    },


    _onChangeVisibilityList : function(e)
    {
      var root = qx.core.Init.getApplication().getRoot();

      // Register events for autoHide
      var isVisible = e.getValue() == "visible";
      if (isVisible) {
        root.addListener("mousedown", this._onMouseDownRoot, this, true);
      } else {
        root.removeListener("mousedown", this._onMouseDownRoot, this, true);
      }
    },


    _onMouseDownRoot : function(e)
    {
      var target = e.getTarget();
      var listPopup = this._getChildControl("popup");
      if (
        target !== this &&
        target !== listPopup &&
        !qx.ui.core.Widget.contains(this, target) &&
        !qx.ui.core.Widget.contains(listPopup, target)
      ) {
        this._hideList();
      }
    }
  }
});
