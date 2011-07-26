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

qx.Class.define("qxc.ui.logpane.Application",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);

      var view = new qxc.ui.logpane.LogView();
      this.getRoot().add(view, {edge: 0});
      view.fetch();

      window.setInterval(function() {
        qx.log.Logger.debug(new Date() + " printing new log message.");
        view.fetch();
      }, 1000);
    }
  }
});