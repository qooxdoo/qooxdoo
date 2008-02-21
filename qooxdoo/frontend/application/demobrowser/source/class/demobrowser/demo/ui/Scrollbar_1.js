/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.ui.Scrollbar_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);

      doc = new qx.ui.root.Application(document);
      doc.setTextColor("black");
      doc.setBackgroundColor("white");

      var vbar = new qx.ui.core.ScrollBar("vertical");
      vbar.setHeight(200);
      vbar.setWidth(20);
      doc.add(vbar, 230, 10);

      var hbar = new qx.ui.core.ScrollBar("horizontal");
      hbar.setHeight(20);
      hbar.setWidth(200);
      doc.add(hbar, 10, 230);
    }
  }
});
