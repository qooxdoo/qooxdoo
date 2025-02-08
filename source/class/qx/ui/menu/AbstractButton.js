/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The abstract menu button class is used for all type of menu content
 * for example normal buttons, checkboxes or radiobuttons.
 *
 * @childControl icon {qx.ui.basic.Image} icon of the button
 * @childControl label {qx.ui.basic.Label} label of the button
 * @childControl shortcut {qx.ui.basic.Label} shows if specified the shortcut
 * @childControl arrow {qx.ui.basic.Image} shows the arrow to show an additional widget (e.g. popup or submenu)
 */
qx.Class.define("qx.ui.menu.AbstractButton", {
  extend: qx.ui.core.Widget,
  include: [qx.ui.core.MExecutable],
  implement: [qx.ui.form.IExecutable],
  type: "abstract",

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct() {
    super();

    // Use hard coded layout
    this._setLayout(new qx.ui.menu.ButtonLayout());

    // Add listeners
    this.addListener("tap", this._onTap);
    this.addListener("keypress", this._onKeyPress);

    // Add command listener
    this.addListener("changeCommand", this._onChangeCommand, this);
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    // overridden
    blockToolTip: {
      refine: true,
      init: true
    },

    /** The label text of the button */
    label: {
      check: "String",
      apply: "_applyLabel",
      nullable: true,
      event: "changeLabel"
    },

    /** Whether a sub menu should be shown and which one */
    menu: {
      check: "qx.ui.menu.Menu",
      apply: "_applyMenu",
      nullable: true,
      dereference: true,
      event: "changeMenu"
    },

    /** The icon to use */
    icon: {
      check: "String",
      apply: "_applyIcon",
      themeable: true,
      nullable: true,
      event: "changeIcon"
    },

    /** Indicates whether the label for the command (shortcut) should be visible or not. */
    showCommandLabel: {
      check: "Boolean",
      apply: "_applyShowCommandLabel",
      themeable: true,
      init: true,
      event: "changeShowCommandLabel"
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl(id, hash) {
      var control;

      switch (id) {
        case "icon":
          control = new qx.ui.basic.Image();
          control.setAnonymous(true);
          this._add(control, { column: 0 });
          break;

        case "label":
          control = new qx.ui.basic.Label();
          control.setAnonymous(true);
          this._add(control, { column: 1 });
          break;

        case "shortcut":
          control = new qx.ui.basic.Label();
          control.setAnonymous(true);
          if (!this.getShowCommandLabel()) {
            control.exclude();
          }
          this._add(control, { column: 2 });
          break;

        case "arrow":
          control = new qx.ui.basic.Image();
          control.setAnonymous(true);
          this._add(control, { column: 3 });
          break;
      }

      return control || super._createChildControlImpl(id);
    },

    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: {
      selected: 1
    },

    /*
    ---------------------------------------------------------------------------
      LAYOUT UTILS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the dimensions of all children
     *
     * @return {Array} Preferred width of each child
     */
    getChildrenSizes() {
      var iconWidth = 0,
        labelWidth = 0,
        shortcutWidth = 0,
        arrowWidth = 0;

      if (this._isChildControlVisible("icon")) {
        var icon = this.getChildControl("icon");
        iconWidth =
          icon.getMarginLeft() +
          icon.getSizeHint().width +
          icon.getMarginRight();
      }

      if (this._isChildControlVisible("label")) {
        var label = this.getChildControl("label");
        labelWidth =
          label.getMarginLeft() +
          label.getSizeHint().width +
          label.getMarginRight();
      }

      if (this._isChildControlVisible("shortcut")) {
        var shortcut = this.getChildControl("shortcut");
        shortcutWidth =
          shortcut.getMarginLeft() +
          shortcut.getSizeHint().width +
          shortcut.getMarginRight();
      }

      if (this._isChildControlVisible("arrow")) {
        var arrow = this.getChildControl("arrow");
        arrowWidth =
          arrow.getMarginLeft() +
          arrow.getSizeHint().width +
          arrow.getMarginRight();
      }

      return [iconWidth, labelWidth, shortcutWidth, arrowWidth];
    },

    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for tap
     *
     * @param e {qx.event.type.Pointer} pointer event
     */
    _onTap(e) {
      if (e.isLeftPressed()) {
        this.execute();
        qx.event.Timer.once(
          qx.ui.menu.Manager.getInstance().hideAll,
          qx.ui.menu.Manager.getInstance(),
          0
        );
      }

      // right click
      else {
        // only prevent contextmenu event if button has no further context menu.
        if (!this.getContextMenu()) {
          qx.ui.menu.Manager.getInstance().preventContextMenuOnce();
        }
      }
    },

    /**
     * Event listener for keypress event
     *
     * @param e {qx.event.type.KeySequence} keypress event
     */
    _onKeyPress(e) {
      this.execute();
    },

    /**
     * Event listener for command changes. Updates the text of the shortcut.
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onChangeCommand(e) {
      var command = e.getData();

      // do nothing if no command is set
      if (command == null) {
        return;
      }

      if (qx.core.Environment.get("qx.dynlocale")) {
        var oldCommand = e.getOldData();
        if (!oldCommand) {
          this.__changeLocaleCommandListenerId = qx.locale.Manager.getInstance().addListener(
            "changeLocale",
            this._onChangeLocale,
            this
          );
        }
        if (!command && this.__changeLocaleCommandListenerId) {
          qx.locale.Manager.getInstance().removeListenerById(
            this.__changeLocaleCommandListenerId
          );
        }
      }

      var cmdString = command != null ? command.toString() : "";
      this.getChildControl("shortcut").setValue(cmdString);
    },

    /**
     * Update command string on locale changes
     */
    _onChangeLocale: qx.core.Environment.select("qx.dynlocale", {
      true(e) {
        var command = this.getCommand();
        if (command != null) {
          this.getChildControl("shortcut").setValue(command.toString());
        }
      },

      false: null
    }),

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyIcon(value, old) {
      if (value) {
        this._showChildControl("icon").setSource(value);
      } else {
        this._excludeChildControl("icon");
      }
    },

    // property apply
    _applyLabel(value, old) {
      if (value) {
        this._showChildControl("label").setValue(value);
      } else {
        this._excludeChildControl("label");
      }
    },

    // property apply
    _applyMenu(value, old) {
      if (old) {
        old.removeListener("changeVisibility", this._onMenuChange, this);
        old.resetOpener();
        old.removeState("submenu");
      }

      if (value) {
        this._showChildControl("arrow");

        value.addListener("changeVisibility", this._onMenuChange, this);
        value.setOpener(this);
        value.addState("submenu");
      } else {
        this._excludeChildControl("arrow");
      }

      // ARIA attrs
      const contentEl = this.getContentElement();
      if (!contentEl) {
        return;
      }
      if (value) {
        contentEl.setAttribute("aria-haspopup", "menu");
        contentEl.setAttribute("aria-expanded", value.isVisible());
        contentEl.setAttribute(
          "aria-controls",
          value.getContentElement().getAttribute("id")
        );
      } else {
        contentEl.removeAttribute("aria-haspopup");
        contentEl.removeAttribute("aria-expanded");
        contentEl.removeAttribute("aria-controls");
      }
    },

    /**
     * Listener for visibility property changes of the attached menu
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onMenuChange(e) {
      // ARIA attrs
      this.getContentElement().setAttribute(
        "aria-expanded",
        this.getMenu().isVisible()
      );
    },

    // property apply
    _applyShowCommandLabel(value, old) {
      if (value) {
        this._showChildControl("shortcut");
      } else {
        this._excludeChildControl("shortcut");
      }
    }
  },

  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct() {
    this.removeListener("changeCommand", this._onChangeCommand, this);

    if (this.getMenu()) {
      if (!qx.core.ObjectRegistry.inShutDown) {
        this.getMenu().destroy();
      }
    }

    if (qx.core.Environment.get("qx.dynlocale") && this.__changeLocaleCommandListenerId) {
      qx.locale.Manager.getInstance().removeListenerById(
        this.__changeLocaleCommandListenerId
      );
    }
  }
});
