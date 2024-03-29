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
 * The default list item renderer. Used as the default renderer by the
 * {@link qx.ui.mobile.list.provider.Provider}. Configure the renderer
 * by setting the {@link qx.ui.mobile.list.List#delegate} property.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *
 *   // Create the list with a delegate that
 *   // configures the list item.
 *   var list = new qx.ui.mobile.list.List({
 *     configureItem : function(item, data, row)
 *     {
 *       item.setImage("path/to/image.png");
 *       item.setTitle(data.title);
 *       item.setSubtitle(data.subtitle);
 *     }
 *   });
 * </pre>
 *
 * This example creates a list with a delegate that configures the list item with
 * the given data.
 */
qx.Class.define("qx.ui.mobile.list.renderer.Default", {
  extend: qx.ui.mobile.list.renderer.Abstract,

  construct(layout) {
    super(
      layout ||
        new qx.ui.mobile.layout.HBox().set({
          alignY: "middle"
        })
    );

    this._init();
  },

  members: {
    __image: null,
    __title: null,
    __subtitle: null,
    __rightContainer: null,

    /**
     * Returns the image widget which is used for this renderer.
     *
     * @return {qx.ui.mobile.basic.Image} The image widget
     */
    getImageWidget() {
      return this.__image;
    },

    /**
     * Returns the title widget which is used for this renderer.
     *
     * @return {qx.ui.mobile.basic.Label} The title widget
     */
    getTitleWidget() {
      return this.__title;
    },

    /**
     * Returns the subtitle widget which is used for this renderer.
     *
     * @return {qx.ui.mobile.basic.Label} The subtitle widget
     */
    getSubtitleWidget() {
      return this.__subtitle;
    },

    /**
     * Sets the source of the image widget.
     *
     * @param source {String} The source to set
     */
    setImage(source) {
      this.__image.setSource(source);
    },

    /**
     * Sets the value of the title widget.
     *
     * @param title {String} The value to set
     */
    setTitle(title) {
      if (title && title.translate) {
        this.__title.setValue(title.translate());
      } else {
        this.__title.setValue(title);
      }
    },

    /**
     * Sets the value of the subtitle widget.
     *
     * @param subtitle {String} The value to set
     */
    setSubtitle(subtitle) {
      if (subtitle && subtitle.translate) {
        this.__subtitle.setValue(subtitle.translate());
      } else {
        this.__subtitle.setValue(subtitle);
      }
    },

    /**
     * Inits the widgets for the renderer.
     *
     */
    _init() {
      this.__image = this._createImage();
      this.add(this.__image);

      this.__rightContainer = this._createRightContainer();
      this.add(this.__rightContainer, { flex: 1 });

      this.__title = this._createTitle();
      this.__rightContainer.add(this.__title);

      this.__subtitle = this._createSubtitle();
      this.__rightContainer.add(this.__subtitle);
    },

    /**
     * Creates and returns the right container composite. Override this to adapt the widget code.
     *
     * @return {qx.ui.mobile.container.Composite} the right container.
     */
    _createRightContainer() {
      return new qx.ui.mobile.container.Composite(
        new qx.ui.mobile.layout.VBox()
      );
    },

    /**
     * Creates and returns the image widget. Override this to adapt the widget code.
     *
     * @return {qx.ui.mobile.basic.Image} the image widget.
     */
    _createImage() {
      var image = new qx.ui.mobile.basic.Image();
      image.setAnonymous(true);
      image.addCssClass("list-item-image");
      return image;
    },

    /**
     * Creates and returns the title widget. Override this to adapt the widget code.
     *
     * @return {qx.ui.mobile.basic.Label} the title widget.
     */
    _createTitle() {
      var title = new qx.ui.mobile.basic.Label();
      title.setWrap(false);
      title.addCssClass("list-item-title");
      return title;
    },

    /**
     * Creates and returns the subtitle widget. Override this to adapt the widget code.
     *
     * @return {qx.ui.mobile.basic.Label} the subtitle widget.
     */
    _createSubtitle() {
      var subtitle = new qx.ui.mobile.basic.Label();
      subtitle.setWrap(false);
      subtitle.addCssClass("list-item-subtitle");
      return subtitle;
    },

    // overridden
    reset() {
      this.__image.setSource(null);
      this.__title.setValue("");
      this.__subtitle.setValue("");
    }
  },

  destruct() {
    this._disposeObjects(
      "__image",
      "__title",
      "__subtitle",
      "__rightContainer"
    );
  }
});
