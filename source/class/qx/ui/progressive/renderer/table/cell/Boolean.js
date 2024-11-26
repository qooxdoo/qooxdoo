/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2008 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Carsten Lergenmueller (carstenl)
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Table Cell Boolean Renderer.
 */
qx.Class.define("qx.ui.progressive.renderer.table.cell.Boolean", {
  extend: qx.ui.progressive.renderer.table.cell.Icon,

  construct() {
    super();

    this._resolveImages();

    // dynamic theme switch
    if (qx.core.Environment.get("qx.dyntheme")) {
      this.__changeThemeBooleanCellListenerId = qx.theme.manager.Meta.getInstance().addListener(
        "changeTheme",
        this._resolveImages,
        this
      );
    }
  },

  properties: {
    /**
     * Whether to add code which will toggle the checkbox on/off.  (There is
     * not yet code here to generate an event when this occurs, so it's not
     * yet very useful.)
     */
    allowToggle: {
      check: "Boolean",
      init: false
    }
  },

  members: {
    _iconUrlTrue: null,
    _iconUrlFalse: null,

    /**
     * Resolve the boolean images using the alias and resource manager.
     */
    _resolveImages() {
      var aliasManager = qx.util.AliasManager.getInstance();
      var resourceManager = qx.util.ResourceManager.getInstance();
      var boolTrueImg = aliasManager.resolve(
        "decoration/table/boolean-true.png"
      );

      var boolFalseImg = aliasManager.resolve(
        "decoration/table/boolean-false.png"
      );

      this._iconUrlTrue = resourceManager.toUri(boolTrueImg);
      this._iconUrlFalse = resourceManager.toUri(boolFalseImg);
    },

    _getDefaultImageData(cellInfo) {
      return {
        imageWidth: 11,
        imageHeight: 11
      };
    },

    // overridden
    _identifyImage(cellInfo) {
      var imageData = this._getDefaultImageData(cellInfo);

      switch (cellInfo.cellData) {
        case true:
          imageData.url = this._iconUrlTrue;
          imageData.extras = "celldata='1' ";
          break;

        case false:
          imageData.url = this._iconUrlFalse;
          imageData.extras = "celldata='0' ";
          break;

        default:
          imageData.url = null;
          break;
      }

      if (this.getAllowToggle()) {
        // Toggle the boolean value if clicked
        imageData.extras +=
          'onclick="' +
          "var node = this.attributes.getNamedItem('celldata'); " +
          "var value = node.nodeValue; " +
          "var src; " +
          "if (value == '0') " +
          "{";

        if (
          qx.core.Environment.get("css.alphaimageloaderneeded") &&
          /\.png$/i.test(this._iconUrlTrue)
        ) {
          imageData.extras +=
            "  this.src='" +
            this.getBlankImage() +
            "'; " +
            "  var loader = 'DXImageTransform.Microsoft.AlphaImageLoader'; " +
            "  var filters = this.filters.item(loader); " +
            "  filters.src='" +
            this._iconUrlTrue +
            "'; " +
            "  filters.sizingMethod = 'scale'; ";
        } else {
          imageData.extras += "  this.src='" + this._iconUrlTrue + "'; ";
        }

        imageData.extras += "  node.nodeValue='1'; " + "} " + "else " + "{";

        if (
          qx.core.Environment.get("css.alphaimageloaderneeded") &&
          /\.png$/i.test(this._iconUrlFalse)
        ) {
          imageData.extras +=
            "  this.src='" +
            this.getBlankImage() +
            "'; " +
            "  var loader = 'DXImageTransform.Microsoft.AlphaImageLoader'; " +
            "  var filters = this.filters.item(loader); " +
            "  filters.src='" +
            this._iconUrlFalse +
            "'; " +
            "  filters.sizingMethod = 'scale'; ";
        } else {
          imageData.extras += "  this.src='" + this._iconUrlFalse + "'; ";
        }

        imageData.extras += "  node.nodeValue='0'; " + "}";

        imageData.extras +=
          // IE doesn't allow setNamedItem() if not explicitly an "attribute"
          "try { " +
          "  this.attributes.setNamedItem(node); " +
          "} catch (e) { " +
          "  var namedItem = document.createAttribute('celldata'); " +
          "  namedItem.value = node.nodeValue; " +
          "  this.attributes.setNamedItem(namedItem); " +
          "}" +
          '"';
      }

      return imageData;
    },

    // overridden
    _getCellStyle(cellInfo) {
      var ret = super._getCellStyle(cellInfo);
      return ret;
    }
  },

  destruct() {
    this._iconUrlTrue = this._iconUrlFalse = null;

    // remove dynamic theme listener
    if (qx.core.Environment.get("qx.dyntheme") && this.__changeThemeBooleanCellListenerId) {
      qx.theme.manager.Meta.getInstance().removeListenerById(
        this.__changeThemeBooleanCellListenerId
      );
    }
  }
});
