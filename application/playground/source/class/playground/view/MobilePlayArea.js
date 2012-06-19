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
/* ************************************************************************

#asset(qx/mobile/icon/android/*)
#asset(qx/mobile/icon/ios/*)
#asset(qx/mobile/icon/common/*)

************************************************************************ */
/**
 * Widget responsible for hosting the run code for mobile apps.
 */
qx.Class.define("playground.view.MobilePlayArea",
{
  extend : playground.view.RiaPlayArea,

  members :
  {
    // Page manager
    __manager : null,


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