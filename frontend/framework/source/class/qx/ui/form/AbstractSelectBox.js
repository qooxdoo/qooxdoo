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
    this.addListener("blur", this._hideList, this);

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
    width :
    {
      refine : true,
      init : 120
    },

    /**
     * The selected item inside the list.
     */
    selected :
    {
      check : "qx.ui.form.ListItem",
      apply : "_applySelected"
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
            selectionMode: "one"
          });

          control.addListener("changeSelection", this._onChangeSelection, this);
          break;

        case "popup":
          control = new qx.ui.popup.Popup(new qx.ui.layout.VBox);
          control.setAutoHide(false);
          control.addListener("mouseup", this._hideList, this);
          control.addListener("activate", this._onActivateList, this);
          control.add(this._getChildControl("list"));
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
    _applySelected : function(value, old) {
      this._getChildControl("list").select(value);
    },

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
     * @type member
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
     * @type member
     */
    _showList : function()
    {
      var pos = qx.bom.element.Location.get(this.getContainerElement().getDomElement(), "box");

      var clientWidth = qx.bom.Viewport.getWidth();
      var clientHeight = qx.bom.Viewport.getHeight();

      var spaceAbove = pos.top;
      var spaceBelow = clientHeight - pos.bottom;

      var list = this._getChildControl("list");
      var listPopup = this._getChildControl("popup");

      list.setMaxHeight(this.getMaxListHeight());

      var listHeight = list.getSizeHint().height;

      // case 1: List fits below the button
      if (spaceBelow > listHeight) {
        listPopup.moveTo(pos.left, pos.bottom);
      }

      // case 2: list does not fit below the button but above it
      else if (spaceAbove > listHeight) {
        listPopup.moveTo(pos.left, pos.top - listHeight);
      }

      // case 3: List does not fit at all
      else if (spaceBelow > spaceAbove)
      {
        list.setMaxHeight(spaceBelow);
        listPopup.moveTo(pos.left, pos.bottom);
      }

      // case 4: List must be fitted above the button
      else
      {
        list.setMaxHeight(spaceAbove);
        listPopup.moveTo(pos.left, pos.bottom - listHeight);
      }

      listPopup.show();
    },


    /**
     * Hides the list popup.
     * @type member
     */
    _hideList : function() {
      this._getChildControl("popup").hide();
    },


    /**
     * Toggles the popup's visibility.
     * @type member
     */
    _togglePopup : function()
    {
      var isListOpen = this._getChildControl("popup").isVisible();
      if (isListOpen) {
        this._hideList();
      } else {
        this._showList();
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Redirects the activation to the main widget
     * @param e {Object} Activation event
     * @type member
     */
    _onActivateList : function(e)
    {
      this.activate();
      e.stopPropagation();
    },


    /**
     * Reacts on special keys and forwards other key events to the list widget.
     * @param e {qx.event.type.KeyEvent} Keypress event
     * @type member
     */
    _onKeyPress : function(e)
    {
      // get the key identifier
      var identifier = e.getKeyIdentifier();
      var listPopup = this._getChildControl("popup");

      // disabled pageUp and pageDown keys
      if (identifier == "PageDown" || identifier == "PageUp")
      {
        if (listPopup.isHidden()) {
          return;
        }
      }

      // hide the list always on escape
      if (identifier == "Escape")
      {
        this._hideList();

        // stop event
        if (identifier == "Escape") {
          e.stopPropagation();
        }

        return;
      }

      // forward the rest of the events to the list
      this._getChildControl("list").handleKeyPress(e);
    },


    /**
     * Updates list minimum size.
     * @param e {qx.event.type.Data} Data event
     * @type member
     */
    _onResize : function(e){
      this._getChildControl("list").setMinWidth(e.getData().width);
    },


    /**
     * Sets the selected item on change.
     * @param e {qx.event.type.Data} Change Event
     * @type member
     */
    _onChangeSelection : function(e)
    {
      if (e.getData().length > 0) {
        this.setSelected(e.getData()[0]);
      }
    }
  }
});
