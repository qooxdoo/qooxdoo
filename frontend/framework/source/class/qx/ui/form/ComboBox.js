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

qx.Class.define("qx.ui.form.ComboBox",
{
  extend  : qx.ui.core.Widget,
  include : qx.ui.core.MRemoteChildrenHandling,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // set the layout
    var layout = new qx.ui.layout.HBox();
    this._setLayout(layout);
    layout.setAlignY("middle");

    this._getChildControl("textfield");
    this._getChildControl("button");
    
    var list = this._getChildControl("list");
    var listPopup = this._getChildControl("list-popup");
    listPopup.add(list);

    this.addListener("resize", function(e) {
      list.setMinWidth(e.getData().width);
    });

    this.addListener("keypress", this._onKeyPress);
    this.addListener("blur", this._hideList, this);

    
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    width :
    {
      refine : true,
      init : 120
    },

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
    },

    selectedItem :
    {
      check : "qx.ui.form.ListItem",
      apply : "_applySelectedItem"
    },

    /**
     * The maximum height of the list popup. Setting this value to
     * <code>null</code> will set cause the list to be autosized.
     */
    maxListHeight :
    {
      check : "Number",
      apply : "_applyMaxListHeight",
      nullable: true,
      init : 200
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

        case "list":
          control = new qx.ui.form.List().set({
            focusable: false,
            keepFocus: true,
            height: null,
            width: null,
            maxHeight: this.getMaxListHeight(),
            selectionMode: "one"
          });

          control.addListener("change", function(e) {
            if (e.getData().length > 0) {
              this.setSelectedItem(e.getData()[0]);
            }
          }, this);
        break;

        case "list-popup":
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
      this._getChildControl("textfield").setValue(value.getLabel());
      this._getChildControl("list").select(value);
    },

    _applyMaxListHeight : function(value, old) {
      this._getChildControl("list").setMaxHeight(value);
    },


    getChildrenContainer : function()
    {
      return this._getChildControl("list");
    },



    /*
    ---------------------------------------------------------------------------
      LIST STUFF
    ---------------------------------------------------------------------------
    */
    _showList : function()
    {
      var pos = qx.bom.element.Location.get(this.getContainerElement().getDomElement(), "box");

      var clientWidth = qx.bom.Viewport.getWidth();
      var clientHeight = qx.bom.Viewport.getHeight();

      var spaceAbove = pos.top;
      var spaceBelow = clientHeight - pos.bottom;
      
      var list = this._getChildControl("list");
      var listPopup = this._getChildControl("list-popup");

      list.setMaxHeight(this.getMaxListHeight());

      var listHeight = list.getSizeHint().height;

      // case 1: List fits below the button
      if (spaceBelow > listHeight) {
        listPopup.moveTo(pos.left, pos.bottom);

      // case 2: list does not fit below the button but above it
      } else if (spaceAbove > listHeight) {
        listPopup.moveTo(pos.left, pos.top - listHeight);

      // case 3: List does not fit at all
      } else if (spaceBelow > spaceAbove) {
        list.setMaxHeight(spaceBelow);
        listPopup.moveTo(pos.left, pos.bottom);

      // case 4: List must be fittet above the button
      } else {
        list.setMaxHeight(spaceAbove);
        listPopup.moveTo(pos.left, pos.bottom - listHeight);
      }

      listPopup.show();
    },


    _hideList : function()
    {
      this._getChildControl("list-popup").hide();
      this._getChildControl("textfield").activate();
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
    _onTextBlur: function(e)
    {
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
        
    
    // overridden
    _onFocus : function(e)
    {
      // Redirct focus to text field
      // State handling is done by _onTextFocus afterwards
      this._getChildControl("textfield").focus();
    },
    

    /*
    ---------------------------------------------------------------------------
      KEY HANDLER
    ---------------------------------------------------------------------------
    */
    _onKeyPress : function(e)
    {
      // get the key identifier
      var identifier = e.getKeyIdentifier();
      var listPopup = this._getChildControl("list-popup");

      // disabled pageUp and pageDown keys
      if (identifier == "PageDown" || identifier == "PageUp")
      {
        if (listPopup.getVisibility() != "visible") {
          return;
        }
      }

      // Open or close the list on space and enter
      if (identifier == "Space" || identifier == "Enter")
      {

        // if the list is visible
        if (listPopup.getVisibility() == "visible") {
          this._hideList();
        } else {
          this._showList();
        }

        return;
      }

      // hide the list always on escape
      if (identifier == "Escape" || identifier == "Tab")
      {
        this._hideList();
        return;
      }
      // forward the rest of the events to the list
      this._getChildControl("list").handleKeyPress(e);
    },


    _onClick : function(e)
    {
      var isListOpen = this._getChildControl("list-popup").getVisibility() == "visible";
      if (isListOpen) {
        this._hideList();
      } else {
        this._showList();
      }
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
      var listPopup = this._getChildControl("list-popup");
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
