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

************************************************************************ */

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
    this._listPopup = new qx.ui.popup.Popup(new qx.ui.layout.VBox());
    this._list = new qx.ui.form.List();
    this._list.setFocusable(false);
    this._list.setKeepFocus(true);
    this._list.setHeight(null);
    this._list.setWidth(null);
    this._list.setMaxHeight(200);   // TODO Client height
    this._listPopup.add(this._list);


    this._list.addListener("change", function(e)
    {
      if (e.getData().length > 0) {
        this.setSelectedItem(e.getData()[0]);
      }
    }, this);


    this.addListener("resize", function(e) {
      this._list.setMinWidth(e.getData().width);
    });


    this.addListener("click", this._showList, this);
    this.addListener("keypress", this._onKeyPress);
    this._listPopup.addListener("mouseup", this._hideList, this);
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


    getChildrenContainer : function() {
      return this._list;
    },


    _showList : function()
    {
      var leftPos = qx.bom.element.Location.getLeft(this.getContainerElement().getDomElement(), "box");
      var topPos = qx.bom.element.Location.getBottom(this.getContainerElement().getDomElement(), "box");
      this._listPopup.moveTo(leftPos, topPos);
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

      // Hide the list always on escape
      if (identifier == "Escape" || identifier == "Tab")
      {
        this._hideList();
        return;
      }

      // forward the rest of the events to the list
      this._list.handleKeyPress(e);
    }
  }
});
