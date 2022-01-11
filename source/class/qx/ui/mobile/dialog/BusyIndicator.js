/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * The widget displays a busy indicator.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var busyIndicator = new qx.ui.mobile.dialog.BusyIndicator("Please wait");
 *   this.getRoot().add(busyIndicator);
 * </pre>
 *
 * This example create a widget to display the busy indicator.
 */
qx.Class.define("qx.ui.mobile.dialog.BusyIndicator", {
  extend: qx.ui.mobile.basic.Atom,

  /**
   * @param label {String} Label to use
   */
  construct(label) {
    // the image passed as second argument is a blank 1px transparent png
    super(label, qx.ui.mobile.basic.Image.PLACEHOLDER_IMAGE);

    this.addListener("appear", this._onAppear, this);
    this.addListener("disappear", this._onDisappear, this);
  },

  properties: {
    /**
     * The spinner css class to use.
     */
    spinnerClass: {
      apply: "_applySpinnerClass",
      nullable: false,
      check: "String",
      init: "spinner"
    }
  },

  statics: {
    SPINNER_ANIMATION: null
  },

  members: {
    __animationHandle: null,

    /**
     * Listener for appear event.
     */
    _onAppear() {
      this.__animationHandle = qx.bom.element.Animation.animate(
        this.getIconWidget().getContainerElement(),
        qx.ui.mobile.dialog.BusyIndicator.SPINNER_ANIMATION
      );
    },

    /**
     * Handler for disappear event.
     */
    _onDisappear() {
      this.__animationHandle.stop();
    },

    // overridden
    _createIconWidget(iconUrl) {
      var iconWidget = super._createIconWidget(iconUrl);
      iconWidget.addCssClass(this.getSpinnerClass());
      return iconWidget;
    },

    // property apply
    _applySpinnerClass(value, old) {
      if (old) {
        this.getIconWidget().removeCssClass(old);
      }
      if (value) {
        this.getIconWidget().addCssClass(value);
      }
    }
  },

  destruct() {
    this.removeListener("appear", this._onAppear, this);
    this.removeListener("disappear", this._onDisappear, this);

    if (this.__animationHandle) {
      this.__animationHandle.stop();
    }

    this.__animationHandle = null;
  },

  defer() {
    qx.ui.mobile.dialog.BusyIndicator.SPINNER_ANIMATION = {
      duration: 750,
      timing: "linear",
      origin: "center center",
      repeat: "infinite",
      keyFrames: {
        0: {
          rotate: "0deg"
        },

        100: {
          rotate: "359deg"
        }
      }
    };
  }
});
