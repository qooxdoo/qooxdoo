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

    //this.setAppearance("selectbox")

    // set the layout
    var layout = new qx.ui.layout.HBox();
    this._setLayout(layout);
    layout.setAlignY("middle");

    // create the label
    this._atom = new qx.ui.basic.Atom(" ");
    this._add(this._atom, {flex:1});
    // add the spacer
    this._add(new qx.ui.core.Spacer(), {flex: 1});

    // create the down arrow
    this._downArrow = new qx.ui.basic.Image("decoration/arrows/down.gif");
    this._downArrow.setPaddingRight(4);
    this._downArrow.setPaddingLeft(5);

    this._add(this._downArrow);

    // create the popup list
    this._listPopup = new qx.ui.popup.Popup(new qx.ui.layout.VBox()).set({
      autoHide: false
    });

    // this._listPopup.setRes
    this._list = new qx.ui.form.List().set({
      focusable: false,
      keepFocus: true,
      height: null,
      width: null,
      maxHeight: this.getMaxListHeight(),
      selectionMode: "one"
    });
    this._listPopup.add(this._list);


    this._list.addListener("change", function(e) {
      if (e.getData().length > 0) {
        this.setSelectedItem(e.getData()[0]);
      }
    }, this);


    this.addListener("resize", function(e) {
      this._list.setMinWidth(e.getData().width);
    });

    this.addListener("click", this._onClick, this);
    this.addListener("keypress", this._onKeyPress);
    this.addListener("blur", this._hideList, this);

    this._listPopup.addListener("mouseup", this._hideList, this);
    this._listPopup.addListener("changeVisibility", this._onChangeVisibilityList, this);
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
    appearance :
    {
      refine : true,
      init : "button"
    },

    selectedItem :
    {
      check : "qx.ui.form.ListItem",
      apply : "_applySelectedItem"
    },

    focusable :
    {
      refine : true,
      init : true
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
    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applySelectedItem : function(value, old)
    {
      this._atom.setLabel(value.getLabel());
      this._atom.setIcon(value.getIcon());
      this._list.select(value);
    },

    _applyMaxListHeight : function(value, old) {
      this._list.setMaxHeight(value);
    },


    getChildrenContainer : function()
    {
      return this._list;
    },


    _showList : function()
    {
      var pos = qx.bom.element.Location.get(this.getContainerElement().getDomElement(), "box");

      var clientWidth = qx.bom.Viewport.getWidth();
      var clientHeight = qx.bom.Viewport.getHeight();

      var spaceAbove = pos.top;
      var spaceBelow = clientHeight - pos.bottom;

      this._list.setMaxHeight(this.getMaxListHeight());

      var listHeight = this._list.getSizeHint().height;

      // case 1: List fits below the button
      if (spaceBelow > listHeight) {
        this._listPopup.moveTo(pos.left, pos.bottom);

      // case 2: list does not fit below the button but above it
      } else if (spaceAbove > listHeight) {
        this._listPopup.moveTo(pos.left, pos.top - listHeight);

      // case 3: List does not fit at all
      } else if (spaceBelow > spaceAbove) {
        this._list.setMaxHeight(spaceBelow);
        this._listPopup.moveTo(pos.left, pos.bottom);

      // case 4: List must be fittet above the button
      } else {
        this._list.setMaxHeight(spaceAbove);
        this._listPopup.moveTo(pos.left, pos.bottom - listHeight);
      }

      this._listPopup.show();
    },


    _hideList : function()
    {
      this._listPopup.hide();
      this.activate();
    },



    _onKeyPress : function(e)
    {
      // get the key identifier
      var identifier = e.getKeyIdentifier();

      // disabled pageUp and pageDown keys
      if (identifier == "PageDown" || identifier == "PageUp")
      {
        if (this._listPopup.getVisibility() != "visible") {
          return;
        }
      }

      // Open or close the list on space and enter
      if (identifier == "Space" || identifier == "Enter")
      {

        // if the list is visible
        if (this._listPopup.getVisibility() == "visible") {
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
      this._list.handleKeyPress(e);
    },


    _onClick : function(e)
    {
      var isListOpen = this._listPopup.getVisibility() == "visible";
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
      if (
        target !== this &&
        target !== this._listPopup &&
        !qx.ui.core.Widget.contains(this, target) &&
        !qx.ui.core.Widget.contains(this._listPopup, target)
      ) {
        this._hideList();
      }
    }

  }
});
