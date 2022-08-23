/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2022 Zenesis Limited, https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (johnspackman)

************************************************************************ */

/**
 * A scrolling page uses a `qx.ui.container.Scroll` to make sure that the contents
 * never cause the parent TabView to size outside of it's natural boundaries; a
 * side effect of this is that if you use all `ScrollingPage` and do not use `Page`
 * instances, then the tabview will be very small unless you use a layout which will
 * expand the TabView.
 */
qx.Class.define("qx.ui.tabview.ScrollingPage", {
  extend: qx.ui.tabview.Page,

  /**
   * @param label {String} Initial label of the tab
   * @param icon {String} Initial icon of the tab
   */
  construct(label, icon) {
    super(label, icon);
    this._setLayout(new qx.ui.layout.Grow());
    this.__childContainer = new qx.ui.container.Composite();
    let scroll = new qx.ui.container.Scroll(this.__childContainer);
    this._add(scroll);
  },

  members: {
    /** @type{qx.ui.core.Widget} the container that the user's children are added to */
    __childContainer: null,

    /**
     * Make sure that children are added to the scrolling container
     *
     * @return {qx.ui.core.Widget} the widget to add to
     */
    getChildrenContainer() {
      return this.__childContainer;
    }
  }
});
