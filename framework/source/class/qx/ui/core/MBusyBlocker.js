/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 Yeshua Rodas, http://yybalam.net

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Yeshua Rodas (yybalam)

************************************************************************ */

/**
 * This mixin extend MBlocker mixin for attach and show a BusyIndicator (a single gif or a popup)
 * meanwhile the widget that include this widget is blocked.
 *
 * If is alloes to show a BusyIndicator popup, then is posible to set a caption
 * on {@link #block} method call.
 *
 * @asset(qx/loading66.gif)
 */
qx.Mixin.define("qx.ui.core.MBusyBlocker", {
  include : [qx.ui.core.MBlocker],

  construct : function() {
    this.block = this.__block;
    this.unblock = this.__unblock;
    this._createBlocker = this.__createBlocker;
  },

  properties: {
    allowBusyPopup: {
      check: "Boolean",
      init: false
    }
  },

  members: {
    __popup: null,

    /**
     * Template method for creating the blocker item.
     * @return {qx.ui.core.Blocker} The blocker to use.
     */
    __createBlocker : function() {
      var blocker = new qx.ui.core.Blocker(this);
      blocker.setColor("#D6D6D6");
      blocker.setOpacity(0.6);

      if(!this.getAllowBusyPopup()) {
        blocker.getBlockerElement().setStyle('text-align','center');

        //The helper allow to set loading image at center vertically.
        var helper = new qx.html.Element('span');
        helper.setStyles({
          'text-align': 'center',
          'display': 'inline-block',
          'height': '100%',
          'vertical-align': 'middle'
        });

        var loadingImage = new qx.html.Element('img');
        loadingImage.setAttribute('src', qx.util.ResourceManager.getInstance().toUri('qx/loading66.gif'));
        loadingImage.setStyle('vertical-align', 'middle');

        blocker.getBlockerElement().add(helper);
        blocker.getBlockerElement().add(loadingImage);
      }

      return blocker;
    },

    /**
     * Block all events from this widget by placing a transparent overlay widget,
     * and shown a loading gif or a BusyIndicator popup whethever allowBusyPopup is set.
     * Also which receives all events, exactly over the widget.
     */
    __block: function(busyCaption) {
      if(this instanceof qx.ui.window.Window) {
        this.getBlocker().getBlockerElement().setStyle('z-index', this.getZIndex() + 100);
      }

      this.getBlocker().block();

      if(this.getAllowBusyPopup()) {
        busyCaption = busyCaption || false;

        var popup = this._getPopup();

        if(busyCaption) {
          popup.setCaption(busyCaption);
        }

        popup.show()

        // center respect to widget:
        var myBounds = this.getBounds();
        var pHint = popup.getSizeHint();

        var left  = this.getLayoutProperties().left + Math.round((myBounds.width - pHint.width) / 2);
        var top  = this.getLayoutProperties().top + Math.round((myBounds.height - pHint.height) / 2);

        if(top < 0) top = 0;

        popup.moveTo(left, top);
      }
    },

    __unblock: function() {
      if (this.__blocker) {
        if(this.getAllowBusyPopup()) this._getPopup().hide();
        this.__blocker.unblock();
      }
    },

    _getPopup: function() {
      if(this.getAllowBusyPopup() && !this.__popup) this.__popup = new qx.ui.popup.BusyIndicator();
      return this.__popup;
    }
  }
});
