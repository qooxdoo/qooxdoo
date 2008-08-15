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
 * Basic class for a selectbox like lists. Basically supports a popup
 * with a list and the whole children managment.
 */
qx.Class.define("qx.ui.form.AbstractSelectBox",
{
  extend  : qx.ui.core.Widget,
  include : qx.ui.core.MRemoteChildrenHandling,
  type : "abstract",



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

    // Register listeners
    this.addListener("keypress", this._onKeyPress);
    this.addListener("blur", this.close, this);

    // register the resize listener
    this.addListener("resize", this._onResize, this);
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
    width :
    {
      refine : true,
      init : 120
    },

    /** The name of the widget. Mainly used for serialization proposes. */
    name :
    {
      check : "String",
      nullable : true,
      event : "changeName"
    },

    /**
     * The maximum height of the list popup. Setting this value to
     * <code>null</code> will set cause the list to be auto-sized.
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
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired everytime the selection has been modified and this way the value */
    "changeValue" : "qx.event.type.Data"
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
        case "list":
          control = new qx.ui.form.List().set({
            focusable: false,
            keepFocus: true,
            height: null,
            width: null,
            maxHeight: this.getMaxListHeight(),
            selectionMode: "one",
            quickSelection: true
          });

          control.addListener("changeSelection", this._onListChangeSelection, this);
          control.addListener("mousedown", this._onListMouseDown, this);
          break;

        case "popup":
          control = new qx.ui.popup.Popup(new qx.ui.layout.VBox);
          control.setAutoHide(false);
          control.setKeepActive(true);
          control.addListener("mouseup", this.close, this);
          control.add(this._getChildControl("list"));

          control.addListener("changeVisibility", this._onPopupChangeVisibility, this);
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
    _applyMaxListHeight : function(value, old) {
      this._getChildControl("list").setMaxHeight(value);
    },



    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the list widget.
     * @return {qx.ui.form.List} the list
     */
    getChildrenContainer : function() {
      return this._getChildControl("list");
    },



    /*
    ---------------------------------------------------------------------------
      LIST STUFF
    ---------------------------------------------------------------------------
    */

    /**
     * Shows the list popup.
     */
    open : function()
    {
      var popup = this._getChildControl("popup");

      popup.placeToWidget(this);
      popup.show();
    },


    /**
     * Hides the list popup.
     */
    close : function() {
      this._getChildControl("popup").hide();
    },


    /**
     * Toggles the popup's visibility.
     */
    toggle : function()
    {
      var isListOpen = this._getChildControl("popup").isVisible();
      if (isListOpen) {
        this.close();
      } else {
        this.open();
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Reacts on special keys and forwards other key events to the list widget.
     *
     * @param e {qx.event.type.KeyEvent} Keypress event
     */
    _onKeyPress : function(e)
    {
      // get the key identifier
      var identifier = e.getKeyIdentifier();
      var listPopup = this._getChildControl("popup");

      // disabled pageUp and pageDown keys
      if (listPopup.isHidden() && (identifier == "PageDown" || identifier == "PageUp")) {
        e.stopPropagation();
      }

      // hide the list always on escape
      else if (!listPopup.isHidden() && identifier == "Escape")
      {
        this.close();
        e.stop();
      }

      // forward the rest of the events to the list
      else
      {
        this._getChildControl("list").handleKeyPress(e);
      }
    },


    /**
     * Updates list minimum size.
     *
     * @param e {qx.event.type.Data} Data event
     */
    _onResize : function(e){
      this._getChildControl("popup").setMinWidth(e.getData().width);
    },


    /**
     * Syncs the own property from the list change
     *
     * @param e {qx.event.type.Data} Data Event
     */
    _onListChangeSelection : function(e) {
      throw new Error("Abstract method: _onListChangeSelection()");
    },


    /**
     * Redirects mousedown event from the list to this widget.
     *
     * @param e {qx.event.type.Mouse} Mouse Event
     */
    _onListMouseDown : function(e) {
      throw new Error("Abstract method: _onListMouseDown()");
    },


    /**
     * Redirects changeVisibility event from the list to this widget.
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onPopupChangeVisibility : function(e) {
      throw new Error("Abstract method: _onPopupChangeVisibility()");
    }
  }
});
