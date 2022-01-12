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
 * The Row layer renders row background colors.
 */
qx.Class.define("qx.ui.virtual.layer.Column", {
  extend: qx.ui.virtual.layer.AbstractBackground,

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    // overridden
    appearance: {
      refine: true,
      init: "column-layer"
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    // overridden
    _fullUpdate(firstRow, firstColumn) {
      var html = [];

      let rowSizes = this.getPane().getRowSizes();
      let columnSizes = this.getPane().getColumnSizes();
      var height = qx.lang.Array.sum(rowSizes.map(s => s.outerHeight));

      var column = firstColumn;
      var childIndex = 0;

      for (var x = 0; x < columnSizes.length; x++) {
        var color = this.getColor(column);
        var backgroundColor = color ? "background-color:" + color + ";" : "";

        var decorator = this.getBackground(column);
        var styles = decorator
          ? qx.bom.element.Style.compile(decorator.getStyles())
          : "";

        html.push(
          "<div style='",
          "position: absolute;",
          "top: 0;",
          "left:",
          columnSizes[x].left,
          "px;",
          "width:",
          columnSizes[x].width,
          "px;",
          "height:",
          height,
          "px;",
          backgroundColor,
          styles,
          "'>",
          "</div>"
        );

        childIndex++;

        column += 1;
      }

      var el = this.getContentElement().getDomElement();
      // hide element before changing the child nodes to avoid
      // premature reflow calculations
      el.style.display = "none";
      el.innerHTML = html.join("");

      el.style.display = "block";

      this._height = height;
    },

    updateLayerWindow(firstRow, firstColumn) {
      let rowSizes = this.getPane().getRowSizes();
      let columnSizes = this.getPane().getColumnSizes();
      if (
        firstColumn !== this.getFirstColumn() ||
        columnSizes.length !== this.getPane().getColumnSizes().length ||
        this._height < qx.lang.Array.sum(rowSizes.map(s => s.outerHeight))
      ) {
        this._fullUpdate(firstRow, firstColumn);
      }
    },

    // overridden
    setColor(index, color) {
      super.setColor(index, color);

      var firstColumn = this.getFirstColumn();
      var lastColumn = firstColumn + this.getPane().getColumnSizes().length - 1;
      if (index >= firstColumn && index <= lastColumn) {
        this.updateLayerData();
      }
    }
  }
});
