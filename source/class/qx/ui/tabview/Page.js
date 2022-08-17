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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * A page is the way to add content to a {@link TabView}. Each page gets a
 * button to switch to the page. Only one page is visible at a time.
 *
 * @childControl button {qx.ui.tabview.TabButton} tab button connected to the page
 */
qx.Class.define("qx.ui.tabview.Page", {
  extend: qx.ui.container.Composite,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Initial label of the tab
   * @param icon {String} Initial icon of the tab
   */
  construct(label, icon) {
    super();

    this._createChildControl("button");

    // init
    if (label != null) {
      this.setLabel(label);
    }

    if (icon != null) {
      this.setIcon(icon);
    }

    // ARIA attrs
    const btn = this.getButton();
    const pageId = "page-" + this.toHashCode();
    const btnId = "btn-" + pageId + btn.toHashCode();
    const contentEl = this.getContentElement();
    contentEl.setAttribute("id", pageId);
    contentEl.setAttribute("role", "tabpanel");
    contentEl.setAttribute("aria-labelledBy", btnId);
    contentEl.setAttribute("aria-expanded", false);

    const btnContentEl = btn.getContentElement();
    btnContentEl.setAttribute("id", btnId);
    btnContentEl.setAttribute("role", "tab");
    btnContentEl.setAttribute("aria-selected", false);
    btnContentEl.setAttribute("aria-controls", pageId);
    btn.addListener("changeValue", this._onBtnChangeValue, this);
  },

  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /**
     * Fired by {@link qx.ui.tabview.TabButton} if the close button is tapped.
     */
    close: "qx.event.type.Event"
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    // overridden
    appearance: {
      refine: true,
      init: "tabview-page"
    },

    /** The label/caption/text of the Page's button. */
    label: {
      check: "String",
      init: "",
      apply: "_applyLabel"
    },

    /** Any URI String supported by qx.ui.basic.Image to display an icon in Page's button. */
    icon: {
      check: "String",
      init: "",
      apply: "_applyIcon",
      nullable: true
    },

    /** Indicates if the close button of a TabButton should be shown. */
    showCloseButton: {
      check: "Boolean",
      init: false,
      apply: "_applyShowCloseButton"
    },

    /** Allows the tab to be excluded from the display */
    tabVisibility: {
      init: "visible",
      check: ["visible", "excluded"],
      nullable: false,
      apply: "_applyTabVisibility",
      event: "changeTabVisibility"
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  /* eslint-disable @qooxdoo/qx/no-refs-in-members */

  members: {
    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: {
      barTop: 1,
      barRight: 1,
      barBottom: 1,
      barLeft: 1,
      firstTab: 1,
      lastTab: 1
    },

    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyIcon(value, old) {
      var btn = this.getChildControl("button");
      if (value) {
        btn.setIcon(value);
        btn._showChildControl("icon");
      } else {
        btn._excludeChildControl("icon");
      }
    },

    // property apply
    _applyLabel(value, old) {
      this.getChildControl("button").setLabel(value);
    },

    // overridden
    _applyEnabled(value, old) {
      super._applyEnabled(value, old);

      // delegate to non-child widget button
      // since enabled is inheritable value may be null
      var btn = this.getChildControl("button");
      value == null ? btn.resetEnabled() : btn.setEnabled(value);
    },

    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl(id, hash) {
      var control;

      switch (id) {
        case "button":
          control = new qx.ui.tabview.TabButton();
          control.setAllowGrowX(true);
          control.setAllowGrowY(true);

          control.setUserData("page", this);
          control.addListener("close", this._onButtonClose, this);
          control.setVisibility(this.getTabVisibility());
          break;
      }

      return control || super._createChildControlImpl(id);
    },

    /**
     * Tab Change Listener
     * @param {*} e
     */
    _onBtnChangeValue(e) {
      const val = e.getData();
      this.getContentElement().setAttribute("aria-expanded", val, true); // Set third argument to true -> direct Update
      this.getButton().getContentElement().setAttribute("aria-selected", val);
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyShowCloseButton(value, old) {
      this.getChildControl("button").setShowCloseButton(value);
    },

    // property apply
    _applyTabVisibility(newValue, oldValue) {
      this.getButton().setVisibility(newValue);
    },

    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Fires an "close" event when the close button of the TabButton of the page
     * is tapped.
     */
    _onButtonClose() {
      this.fireEvent("close");
    },

    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * By default, widgets are added to `this`
     *
     * @return {qx.ui.core.Widget} the widget to add to
     */
    getChildrenContainer() {
      return this;
    },

    /**
     * Returns the button used within this page. This method is used by
     * the TabView to access the button.
     *
     * @return {qx.ui.form.RadioButton} The button associated with this page.
     */
    getButton() {
      return this.getChildControl("button");
    }
  }
});
