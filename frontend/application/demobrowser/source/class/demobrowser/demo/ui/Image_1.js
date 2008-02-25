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

qx.Class.define("demobrowser.demo.ui.Image_1",
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

      w1 = new qx.ui.basic.Image("../../../../../framework/source/resource/icon/CrystalClear/48/apps/utilities-file-archiver.png", 48, 48);
      w2 = new qx.ui.basic.Image("../../../../../framework/source/resource/icon/CrystalClear/48/apps/accessories-clipboard.png", 48, 48);
      w3 = new qx.ui.basic.Image("../../../../../framework/source/resource/icon/CrystalClear/48/apps/accessories-clock.png", 48, 48);
      w4 = new qx.ui.basic.Image("../../../../../framework/source/resource/icon/CrystalClear/48/apps/accessories-date.png", 48, 48);

      layout = new qx.ui.layout.Basic();

      layout.add(w1, 10, 10);
      layout.add(w2, 200, 20);
      layout.add(w3, 350, 50);
      layout.add(w4, 50, 200);

      var container = new qx.ui.core.Widget();
      container.setLayout(layout);

      doc.add(container, 0, 0, 0, 0);
    }
  }
});
