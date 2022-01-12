/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Abstract base class for the {@link Row} and {@link Column} layers.
 */
qx.Class.define("qx.ui.virtual.layer.AbstractBackground", {
  extend: qx.ui.virtual.layer.Abstract,

  construct() {
    super();
    this._setLayout(new qx.ui.layout.Basic());
  },

  properties: {
    /** Whether the list has a header */
    hasHeader: {
      init: false,
      check: "Boolean",
      apply: "_applyHasHeader"
    },

    /** Default appearance for spans */
    spanAppearance: {
      init: null,
      check: "String",
      nullable: true,
      apply: "_applySpanAppearance"
    }
  },

  members: {
    /** @type{String[]} colour overrides */
    __customColors: null,

    /** @type {Map<Integer, Boolean>} selected rows, indexes by rowIndex */
    __selectedRows: null,

    /** @type {Map<Integer, String>} appearance name overrides by row, indexed by rowIndex */
    __spanAppearances: null,

    /**
     * Sets a row as selected
     * @param rowIndex {Integer} the zero based row index
     * @param selected {Boolean} whether selected or not
     */
    setSelected(rowIndex, selected) {
      let wasSelected = this.isSelected(rowIndex);
      if (selected) {
        if (!this.__selectedRows) this.__selectedRows = {};
        this.__selectedRows[rowIndex] = true;
      } else {
        if (this.__selectedRows) delete this.__selectedRows[rowIndex];
      }
      if (wasSelected != selected) this.updateLayerData();
    },

    /**
     * Returns whether a row is selected or not
     *
     * @param rowIndex {Integer} zero based row index
     * @return {Boolean}
     */
    isSelected(rowIndex) {
      if (this.__selectedRows === null) return false;
      return !!this.__selectedRows[rowIndex];
    },

    /**
     * Apply for `spanAppearance`
     */
    _applySpanAppearance(value) {
      this.updateLayerData();
    },

    /**
     * Sets the color for the given index
     *
     * @param index {Integer} Index to set the color for
     * @param color {Color|null} the color to set. A value of <code>null</code>
     *    will reset the color.
     */
    setColor(index, color) {
      if (color) {
        this.__customColors[index] =
          qx.theme.manager.Color.getInstance().resolve(color);
      } else {
        delete this.__customColors[index];
      }
    },

    /**
     * Clear all colors set using {@link #setColor}.
     */
    clearCustomColors() {
      this.__customColors = {};
      this.updateLayerData();
    },

    /**
     * Get the color at the given index
     *
     * @param index {Integer} The index to get the color for.
     * @return {Color} The color at the given index
     */
    getColor(index) {
      return this.__customColors[index] || null;
    },

    /**
     * Apply for `hasHeader`
     */
    _applyHasHeader() {
      this.updateLayerData();
    },

    /**
     * Sets the appearance for the given index
     *
     * @param index {Integer} Index to set the color for
     * @param appearance {String} the appearance to set. A value of
     *    <code>null</code> will reset the appearance.
     */
    setIndividualSpanAppearance(index, appearance) {
      if (appearance) {
        if (!this.__spanAppearances) this.__spanAppearances = {};
        this.__spanAppearances[index] = appearance;
      } else if (this.__spanAppearances) {
        delete this.__spanAppearances[index];
      }
      this.updateLayerData();
    },

    /**
     * Get the appearance which has been manually set at the given index
     *
     * @param index {Integer} The index to get the appearance for.
     * @return {String} The appearance at the given index
     */
    getIndividualSpanAppearance(index) {
      return (this.__spanAppearances && this.__spanAppearances[index]) || null;
    },

    /**
     * Get the appearance to use at the given index
     *
     * @param index {Integer} The index to get the appearance for.
     * @return {String?} The appearance at the given index, null if default is to be used
     */
    getSpanAppearanceFor(index) {
      if (this.isHasHeader()) {
        if (index == 0) return null;
        index--;
      }
      return (
        (this.__spanAppearances && this.__spanAppearances[index]) ||
        this.getSpanAppearance() ||
        null
      );
    }
  },

  destruct() {
    this.__customColors = this.__spanAppearances = null;
  }
});
