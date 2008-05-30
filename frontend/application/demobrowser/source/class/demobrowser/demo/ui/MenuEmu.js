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

/**
 * Proof of concept that the grid can be used for menus.
 */
qx.Class.define("demobrowser.demo.ui.MenuEmu",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var MenuItem = demobrowser.demo.layout.MenuEmu_MenuItem;
      var Menu = demobrowser.demo.layout.MenuEmu_Menu;

      this.getRoot().setPadding(20);

      var layout = new qx.ui.layout.Grid();
      layout.setColumnFlex(0, 0);
      layout.setSpacing(20);

      var container = new qx.ui.container.Composite(layout);

      var menu = new Menu();
      menu.add(new MenuItem("New", "Ctrl-N"));
      menu.add(new MenuItem("Close", "Ctrl-W"));
      menu.add(new MenuItem("Save", "Ctrl-S"));
      menu.add(new MenuItem("Save as"));
      menu.add(new MenuItem("Abracadabra"));
      container.add(menu, {row: 0, column: 0});

      var menu = new Menu();
      menu.add(new MenuItem("New", "Ctrl-N"));
      menu.add(new MenuItem("Abracadabra -  very long text"));
      menu.add(new MenuItem("Close", "Ctrl-W"));
      menu.add(new MenuItem("Save", "Ctrl-S"));
      menu.add(new MenuItem("Save as"));
      container.add(menu, {row: 0, column: 1});

      var menu = new Menu();
      menu.add(new MenuItem("New", "Ctrl-N"));
      menu.add(new MenuItem("Save", "Ctrl-S"));
      menu.add(new MenuItem("Save as"));
      menu.add(new MenuItem("Close ...", "Ctrl-W"));
      container.add(menu, {row: 1, column: 0});

      this.getRoot().add(container, {edge:0});
    }
  }
});
