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
 * Widget responsible for hosting the run code.
 */
qx.Class.define("playground.view.MobilePlayArea",
{
  extend : playground.view.PlayArea,

  members :
  {
    // overridden
    init : function(app)
    {
      qx.html.Element.flush();

      var playRootEl = this._dummy.getContentElement().getDomElement();

      // hotfix for chrome bug
      playRootEl.style["background"] = "none";

      this._playRoot = new qx.ui.mobile.core.Root(playRootEl);

      var self = this;
      qx.ui.mobile.page.Page.getManager()._getRoot = function() {
        return self._playRoot;
      };

      this._playApp = new qx.application.Mobile();
      this._playApp.getRoot = function() {
        return self._playRoot;
      };
    },


    // overridden
    reset : function(beforeReg, afterReg, code) {
      return; // TODO
      var ch = this._playRoot.getChildren();
      var i = ch.length;
      while(i--)
      {
        if (ch[i]) {
          ch[i].destroy();
        }
      }

      // flush the dispose queue to get the ui controlls disposed
      qx.ui.core.queue.Dispose.flush();
    }
  }
});