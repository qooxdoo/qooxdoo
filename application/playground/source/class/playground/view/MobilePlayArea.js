/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Widget responsible for hosting the run code for mobile apps.
 *
 * @asset(qx/mobile/icon/android/*)
 * @asset(qx/mobile/icon/ios/*)
 * @asset(qx/mobile/icon/common/*)
 */
qx.Class.define("playground.view.MobilePlayArea",
{
  extend : playground.view.RiaPlayArea,


  construct : function() {
    this.base(arguments);

    this.setBackgroundColor("#d4d4d4");

    var sizeSelect = new qx.ui.form.SelectBox();
    sizeSelect.setMaxHeight(21);
    sizeSelect.setMarginTop(7);
    sizeSelect.setPaddingTop(0);
    sizeSelect.setPaddingBottom(0);
    sizeSelect.add(new qx.ui.form.ListItem("Fit to viewport"));

    var resolutions = [
      [320, 480], [480, 320]
    ];

    for (var i = 0; i < resolutions.length; i++) {
      var res = resolutions[i];
      var item = new qx.ui.form.ListItem(res[0] + " x " + res[1]);
      item.setModel(res);
      sizeSelect.add(item);
    }

    sizeSelect.addListener("changeSelection", function(e) {
      var newRes = e.getData()[0].getModel();
      if (newRes) {
        this.__setFixDimensions(newRes[0], newRes[1]);
      } else {
        this.__setFixDimensions(null, null);
      }
    }, this);

    this._caption.addAt(sizeSelect, 2);
  },


  members :
  {
    // Page manager
    __manager : null,

    /**
     * Sets the dimensions to the given values.
     * @param width {Number} The width to set.
     * @param height {Number} The height to set.
     */
    __setFixDimensions : function(width, height) {
      this._dummy.setMinWidth(width);
      this._dummy.setMinHeight(height);
      this._dummy.setMaxWidth(width);
      this._dummy.setMaxHeight(height);

      this.setMinWidth(width ? width + 2 : null);
      this.setMinHeight(height ? height + 2 : null);
    },


    // overridden
    init : function()
    {
      if (this._initialized) {
        return;
      }

      qx.html.Element.flush();

      var playRootEl = this._dummy.getContentElement().getDomElement();

      // hotfix for chrome bug
      if (qx.core.Environment.get("browser.name") == "chrome") {
        playRootEl.style["background"] = "none";
      }

      this._playRoot = new qx.ui.mobile.core.Root(playRootEl);

      qx.ui.mobile.dialog.Popup.ROOT = this._playRoot;
      qx.ui.mobile.core.Blocker.ROOT = this._playRoot;

      var self = this;

      this._playApp = new qx.application.Mobile();
      this._playApp.getManager = function() {
        return self.__manager;
      };

      this._initialized = true;
    },


    // overridden
    reset : function(beforeReg, afterReg, code) {
      this._playRoot.removeAll();

      if(this.__manager) {
        this.__manager.dispose();
        this.__manager = null;
      }

      this.__manager = new qx.ui.mobile.page.Manager(false, this._playRoot);
    }
  }
});
