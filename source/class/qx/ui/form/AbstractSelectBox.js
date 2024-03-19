/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Sebastian Werner (wpbasti)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Basic class for a selectbox like lists. Basically supports a popup
 * with a list and the whole children management.
 *
 * @childControl list {qx.ui.form.List} list component of the selectbox
 * @childControl popup {qx.ui.popup.Popup} popup which shows the list
 *
 */
qx.Class.define("qx.ui.form.AbstractSelectBox", {
  extend: qx.ui.core.Widget,
  include: [qx.ui.core.MRemoteChildrenHandling, qx.ui.form.MForm],

  implement: [qx.ui.form.IForm],

  type: "abstract",

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct() {
    super();

    // set the layout
    var layout = new qx.ui.layout.HBox();
    this._setLayout(layout);
    layout.setAlignY("middle");

    // ARIA attrs
    const contentEl = this.getContentElement();
    contentEl.setAttribute("role", "button");
    contentEl.setAttribute("aria-haspopup", "listbox");
    contentEl.setAttribute("aria-expanded", false);

    // Register listeners
    this.addListener("keypress", this._onKeyPress);
    this.addListener("blur", this._onBlur, this);

    // register the resize listener
    this.addListener("resize", this._onResize, this);
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    // overridden
    focusable: {
      refine: true,
      init: true
    },

    // overridden
    width: {
      refine: true,
      init: 120
    },

    /**
     * The maximum height of the list popup. Setting this value to
     * <code>null</code> will set cause the list to be auto-sized.
     */
    maxListHeight: {
      check: "Number",
      apply: "_applyMaxListHeight",
      nullable: true,
      init: 200
    },

    /**
     * Formatter which format the value from the selected <code>ListItem</code>.
     * Uses the default formatter {@link #_defaultFormat}.
     */
    format: {
      check: "Function",
      init(item) {
        return this._defaultFormat(item);
      },
      nullable: true
    },

    /**
     * Whether the field is read only
     */
    readOnly: {
      check: "Boolean",
      event: "changeReadOnly",
      apply: "_applyReadOnly",
      init: false
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    // overridden
    _createChildControlImpl(id, hash) {
      var control;

      switch (id) {
        case "list": {
          control = new qx.ui.form.List().set({
            focusable: false,
            keepFocus: true,
            height: null,
            width: null,
            maxHeight: this.getMaxListHeight(),
            selectionMode: "one",
            quickSelection: true
          });

          this.bind("readOnly", control, "readOnly");

          const listId = "list-" + control.toHashCode();
          const childrenContainerEl = control
            .getChildrenContainer()
            .getContentElement();
          childrenContainerEl.setAttribute("id", listId);
          childrenContainerEl.setAttribute("role", "listbox");
          this.getContentElement().setAttribute("aria-owns", listId);

          control.addListener("addItem", this._onListAddItem, this);
          control.addListener(
            "changeSelection",
            this._onListChangeSelection,
            this
          );

          control.addListener(
            "pointerdown",
            this.__onListPointerDownImpl,
            this
          );

          control.getChildControl("pane").addListener("tap", this.close, this);
          break;
        }
        case "popup":
          control = new qx.ui.popup.Popup(new qx.ui.layout.VBox());
          control.setAutoHide(false);
          control.setKeepActive(true);
          control.add(this.getChildControl("list"));

          control.addListener(
            "changeVisibility",
            this._onPopupChangeVisibility,
            this
          );

          break;
      }

      return control || super._createChildControlImpl(id);
    },

    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyMaxListHeight(value, old) {
      this.getChildControl("list").setMaxHeight(value);
    },

    _applyReadOnly() {
      // no-op
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
    getChildrenContainer() {
      return this.getChildControl("list");
    },

    /*
    ---------------------------------------------------------------------------
      LIST STUFF
    ---------------------------------------------------------------------------
    */

    /**
     * Shows the list popup.
     */
    open() {
      var popup = this.getChildControl("popup");

      popup.placeToWidget(this, true);
      popup.show();
    },

    /**
     * Hides the list popup.
     */
    close() {
      var popup = this.getChildControl("popup", true);
      if (popup && popup.isVisible()) {
        popup.hide();
      }
    },

    /**
     * Toggles the popup's visibility.
     */
    toggle() {
      var isListOpen = this.getChildControl("popup").isVisible();
      if (isListOpen) {
        this.close();
      } else {
        this.open();
      }
    },

    /*
    ---------------------------------------------------------------------------
      FORMAT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Return the formatted label text from the <code>ListItem</code>.
     * The formatter removes all HTML tags and converts all HTML entities
     * to string characters when the rich property is <code>true</code>.
     *
     * @param item {qx.ui.form.IListItem} The list item to format.
     * @return {String} The formatted text.
     */
    _defaultFormat(item) {
      var valueLabel = item ? item.getLabel() : "";
      var rich = item ? item.getRich() : false;

      if (rich) {
        valueLabel = valueLabel.replace(/<[^>]+?>/g, "");
        valueLabel = qx.bom.String.unescape(valueLabel);
      }

      return valueLabel;
    },

    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Handler for the blur event of the current widget.
     *
     * @param e {qx.event.type.Focus} The blur event.
     */
    _onBlur(e) {
      this.close();
    },

    /**
     * Reacts on special keys and forwards other key events to the list widget.
     *
     * @param e {qx.event.type.KeySequence} Keypress event
     */
    _onKeyPress(e) {
      // get the key identifier
      var identifier = e.getKeyIdentifier();
      var listPopup = this.getChildControl("popup");

      // disabled pageUp and pageDown keys
      if (
        listPopup.isHidden() &&
        (identifier == "PageDown" || identifier == "PageUp")
      ) {
        e.stopPropagation();
      }

      // hide the list always on escape and tab
      else if (
        !listPopup.isHidden() &&
        (identifier == "Escape" || identifier == "Tab")
      ) {
        this.close();
        e.stop();
      }

      // forward the rest of the events to the list
      else {
        this.getChildControl("list").handleKeyPress(e);
      }
    },

    /**
     * Updates list minimum size.
     *
     * @param e {qx.event.type.Data} Data event
     */
    _onResize(e) {
      this.getChildControl("popup").setMinWidth(e.getData().width);
    },

    /**
     * Sets ARIA attributes on the item
     *
     * @param e {qx.event.type.Data} Data Event
     */
    _onListAddItem(e) {
      const item = e.getData();
      const contentEl = item.getContentElement();
      contentEl.setAttribute("id", "list-item-" + item.toHashCode());
      contentEl.setAttribute("role", "option");
      const ariaSelected = contentEl.getAttribute("aria-selected");
      // aria-selected may be already set from changeSelection listener
      if (ariaSelected === null || ariaSelected === undefined) {
        contentEl.setAttribute("aria-selected", false);
      }
    },

    /**
     * Syncs the own property from the list change
     *
     * @param e {qx.event.type.Data} Data Event
     */
    _onListChangeSelection(e) {
      throw new Error("Abstract method: _onListChangeSelection()");
    },

    __onListPointerDownImpl(e) {
      if (this.getReadOnly()) {
        return;
      }
      this._onListPointerDown(e);
    },
    /**
     * Redirects pointerdown event from the list to this widget.
     *
     * @param e {qx.event.type.Pointer} Pointer Event
     */
    _onListPointerDown(e) {
      throw new Error("Abstract method: _onListPointerDown()");
    },

    /**
     * Redirects changeVisibility event from the list to this widget.
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onPopupChangeVisibility(e) {
      const visible = e.getData() == "visible";
      visible ? this.addState("popupOpen") : this.removeState("popupOpen");

      // ARIA attrs
      this.getContentElement().setAttribute("aria-expanded", visible);
    }
  }
});
