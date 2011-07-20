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

************************************************************************ */
/**
 * Widget responsible for hosting the run code for mobile apps.
 */
qx.Class.define("playground.view.MobilePlayArea",
{
  extend : playground.view.RiaPlayArea,

  members :
  {
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

      var self = this;
      qx.ui.mobile.page.Page.getManager()._getRoot = function() {
        return self._playRoot;
      };

      this._playApp = new qx.application.Mobile();
      this._playApp.getRoot = function() {
        return self._playRoot;
      };

      this._initialized = true;
    },


    // overridden
    reset : function(beforeReg, afterReg, code) {
      this._playRoot.removeAll();
      var manager = qx.ui.mobile.page.Page.getManager();
      if (manager) {
        qx.ui.mobile.page.Page.setManager(null);
        manager.dispose();
      }
      qx.ui.mobile.page.Page.setManager(new qx.ui.mobile.page.manager.Animation(this._playRoot));
    }
  }
});