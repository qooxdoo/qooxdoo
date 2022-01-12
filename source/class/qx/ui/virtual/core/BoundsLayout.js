qx.Class.define("qx.ui.virtual.core.BoundsLayout", {
  extend: qx.ui.layout.Abstract,

  construct() {
    super();
    this.__itemBounds = {};
  },

  members: {
    __itemBounds: null,

    /**
     * @Override
     */
    _computeSizeHint() {
      let computed = {
        height: 0,
        width: 0,
        minHeight: 0,
        minWidth: 0
      };

      this._getLayoutChildren().forEach(child => {
        let hint = child.getSizeHint();

        // Sum up heights
        computed.height += hint.height;
        computed.minHeight += hint.minHeight;

        let margin = child.getMarginLeft() + child.getMarginRight();
        computed.width = hint.width + margin;
        computed.minWidth = hint.minWidth + margin;
      });

      return computed;
    },

    renderLayout(availWidth, availHeight, padding) {
      this._getLayoutChildren().forEach(child => {
        let { left, top, width, height } = this.__itemBounds[
          child.toHashCode()
        ] || { left: 0, top: 0, width: availWidth, height: availHeight };
        let hint = child.getSizeHint();
        if (height > hint.maxHeight) {
          height = hint.maxHeight;
        }
        if (width > hint.maxWidth) {
          width = hint.maxWidth;
        }
        child.renderLayout(left, top, width, height);
      });
    },

    setItemBounds(item, left, top, width, height) {
      if (!left && !top && !width && !height) {
        delete this.__itemBounds[item.toHashCode()];
        return;
      }

      if (qx.core.Environment.get("qx.debug")) {
        var msg = "Something went wrong with the layout of " + item + "!";
        this.assertInteger(left, "Wrong 'left' argument. " + msg);
        this.assertInteger(top, "Wrong 'top' argument. " + msg);
        this.assertInteger(width, "Wrong 'width' argument. " + msg);
        this.assertInteger(height, "Wrong 'height' argument. " + msg);
      }

      this.__itemBounds[item.toHashCode()] = { left, top, width, height };
    },

    getItemBounds(item) {
      return this.__itemBounds[item.toHashCode()] || null;
    },

    clearItemBounds(item) {
      delete this.__itemBounds[item.toHashCode()];
    }
  }
});
