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
     * Jonathan Weiß (jonathan_rass)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * A form widget which allows a single selection. Looks somewhat like
 * a normal button, but opens a list of items to select when clicking on it.
 *
 * Keep in mind that the SelectBox widget has always a selected item (due to the
 * single selection mode). Right after adding the first item a <code>changeSelection</code>
 * event is fired.
 *
 * <pre class='javascript'>
 * var selectBox = new qx.ui.form.SelectBox();
 *
 * selectBox.addListener("changeSelection", function(e) {
 *   // ...
 * });
 *
 * // now the 'changeSelection' event is fired
 * selectBox.add(new qx.ui.form.ListItem("Item 1");
 * </pre>
 *
 * @childControl spacer {qx.ui.core.Spacer} flexible spacer widget
 * @childControl atom {qx.ui.basic.Atom} shows the text and icon of the content
 * @childControl arrow {qx.ui.basic.Image} shows the arrow to open the popup
 */
qx.Class.define("qx.ui.form.SelectBox",
{
  extend : qx.ui.form.AbstractSelectBox,
  implement : [
    qx.ui.core.ISingleSelection,
    qx.ui.form.IModelSelection
  ],
  include : [qx.ui.core.MSingleSelectionHandling, qx.ui.form.MModelSelection],


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
    this.addListener("mouseover", this._onMouseOver, this);
    this.addListener("mouseout", this._onMouseOut, this);
    this.addListener("click", this._onClick, this);
    this.addListener("mousewheel", this._onMouseWheel, this);
    this.addListener("keyinput", this._onKeyInput, this);
    this.addListener("changeSelection", this.__onChangeSelection, this);
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
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    /** {qx.ui.form.ListItem} instance */
    __preSelectedItem : null,


    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id, hash)
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
          control.setCenter(false);
          control.setAnonymous(true);

          this._add(control, {flex:1});
          break;

        case "arrow":
          control = new qx.ui.basic.Image();
          control.setAnonymous(true);

          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },

    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates : {
      focused : true
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS FOR SELECTION API
    ---------------------------------------------------------------------------
    */


    /**
     * Returns the list items for the selection.
     *
     * @return {qx.ui.form.ListItem[]} List itmes to select.
     */
    _getItems : function() {
      return this.getChildrenContainer().getChildren();
    },

    /**
     * Returns if the selection could be empty or not.
     *
     * @return {Boolean} <code>true</code> If selection could be empty,
     *    <code>false</code> otherwise.
     */
    _isAllowEmptySelection: function() {
      return this.getChildrenContainer().getSelectionMode() !== "one";
    },

    /**
     * Event handler for <code>changeSelection</code>.
     *
     * @param e {qx.event.type.Data} Data event.
     */
    __onChangeSelection : function(e)
    {
      var listItem = e.getData()[0];

      var list = this.getChildControl("list");
      if (list.getSelection()[0] != listItem) {
        if(listItem) {
          list.setSelection([listItem]);
        } else {
          list.resetSelection();
        }
      }

      this.__updateIcon();
      this.__updateLabel();
    },


    /**
     * Sets the icon inside the list to match the selected ListItem.
     */
    __updateIcon : function()
    {
      var listItem = this.getChildControl("list").getSelection()[0];
      var atom = this.getChildControl("atom");
      var icon = listItem ? listItem.getIcon() : "";
      icon == null ? atom.resetIcon() : atom.setIcon(icon);
    },

    /**
     * Sets the label inside the list to match the selected ListItem.
     */
    __updateLabel : function()
    {
      var listItem = this.getChildControl("list").getSelection()[0];
      var atom = this.getChildControl("atom");
      var label = listItem ? listItem.getLabel() : "";
      var format = this.getFormat();
      if (format != null) {
        label = format.call(this, listItem);
      }

      // check for translation
      if (label && label.translate) {
        label = label.translate();
      }
      label == null ? atom.resetLabel() : atom.setLabel(label);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */


    /**
     * Listener method for "mouseover" event
     * <ul>
     * <li>Adds state "hovered"</li>
     * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
     * </ul>
     *
     * @param e {Event} Mouse event
     */
    _onMouseOver : function(e)
    {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }

      if (this.hasState("abandoned"))
      {
        this.removeState("abandoned");
        this.addState("pressed");
      }

      this.addState("hovered");
    },

    /**
     * Listener method for "mouseout" event
     * <ul>
     * <li>Removes "hovered" state</li>
     * <li>Adds "abandoned" and removes "pressed" state (if "pressed" state is set)</li>
     * </ul>
     *
     * @param e {Event} Mouse event
     */
    _onMouseOut : function(e)
    {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }

      this.removeState("hovered");

      if (this.hasState("pressed"))
      {
        this.removeState("pressed");
        this.addState("abandoned");
      }
    },

    /**
     * Toggles the popup's visibility.
     *
     * @param e {qx.event.type.Mouse} Mouse event
     */
    _onClick : function(e) {
      this.toggle();
    },

    /**
     * Event handler for mousewheel event
     *
     * @param e {qx.event.type.Mouse} Mouse event
     */
    _onMouseWheel : function(e)
    {
      if (this.getChildControl("popup").isVisible()) {
        return;
      }

      var direction = e.getWheelDelta("y") > 0 ? 1 : -1;
      var children = this.getSelectables();
      var selected = this.getSelection()[0];

      if (!selected) {
        selected = children[0];
      }

      var index = children.indexOf(selected) + direction;
      var max = children.length - 1;

      // Limit
      if (index < 0) {
        index = 0;
      } else if (index >= max) {
        index = max;
      }

      this.setSelection([children[index]]);

      // stop the propagation
      // prevent any other widget from receiving this event
      // e.g. place a selectbox widget inside a scroll container widget
      e.stopPropagation();
      e.preventDefault();
    },

    // overridden
    _onKeyPress : function(e)
    {
      var iden = e.getKeyIdentifier();
      if(iden == "Enter" || iden == "Space")
      {
        // Apply pre-selected item (translate quick selection to real selection)
        if (this.__preSelectedItem)
        {
          this.setSelection([this.__preSelectedItem]);
          this.__preSelectedItem = null;
        }

        this.toggle();
      }
      else
      {
        this.base(arguments, e);
      }
    },

    /**
     * Forwards key event to list widget.
     *
     * @param e {qx.event.type.KeyInput} Key event
     */
    _onKeyInput : function(e)
    {
      // clone the event and re-calibrate the event
      var clone = e.clone();
      clone.setTarget(this._list);
      clone.setBubbles(false);

      // forward it to the list
      this.getChildControl("list").dispatchEvent(clone);
    },

    // overridden
    _onListMouseDown : function(e)
    {
      // Apply pre-selected item (translate quick selection to real selection)
      if (this.__preSelectedItem)
      {
        this.setSelection([this.__preSelectedItem]);
        this.__preSelectedItem = null;
      }
    },

    // overridden
    _onListChangeSelection : function(e)
    {
      var current = e.getData();
      var old = e.getOldData();

      // Remove old listeners for icon and label changes.
      if (old && old.length > 0)
      {
        old[0].removeListener("changeIcon", this.__updateIcon, this);
        old[0].removeListener("changeLabel", this.__updateLabel, this);
      }


      if (current.length > 0)
      {
        // Ignore quick context (e.g. mouseover)
        // and configure the new value when closing the popup afterwards
        var popup = this.getChildControl("popup");
        var list = this.getChildControl("list");
        var context = list.getSelectionContext();

        if (popup.isVisible() && (context == "quick" || context == "key"))
        {
          this.__preSelectedItem = current[0];
        }
        else
        {
          this.setSelection([current[0]]);
          this.__preSelectedItem = null;
        }

        // Add listeners for icon and label changes
        current[0].addListener("changeIcon", this.__updateIcon, this);
        current[0].addListener("changeLabel", this.__updateLabel, this);
      }
      else
      {
        this.resetSelection();
      }
    },

    // overridden
    _onPopupChangeVisibility : function(e)
    {
      this.base(arguments, e);

      // Synchronize the current selection to the list selection
      // when the popup is closed. The list selection may be invalid
      // because of the quick selection handling which is not
      // directly applied to the selectbox
      var popup = this.getChildControl("popup");
      if (!popup.isVisible())
      {
        var list = this.getChildControl("list");

        // check if the list has any children before selecting
        if (list.hasChildren()) {
          list.setSelection(this.getSelection());
        }
      } else {
        // ensure that the list is never biger that the max list height and
        // the available space in the viewport
        var distance = popup.getLayoutLocation(this);
        var viewPortHeight = qx.bom.Viewport.getHeight();
        // distance to the bottom and top borders of the viewport
        var toTop = distance.top;
        var toBottom = viewPortHeight - distance.bottom;
        var availableHeigth = toTop > toBottom ? toTop : toBottom;

        var maxListHeight = this.getMaxListHeight();
        var list = this.getChildControl("list")
        if (maxListHeight == null || maxListHeight > availableHeigth) {
          list.setMaxHeight(availableHeigth);
        } else if (maxListHeight < availableHeigth) {
          list.setMaxHeight(maxListHeight);
        }
      }
    }

  },


  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */


  destruct : function() {
    this.__preSelectedItem = null;
  }
});
