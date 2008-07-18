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

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/actions/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Menu",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var box = new qx.ui.layout.HBox();
      box.setSpacing(20);

      var container = new qx.ui.container.Composite(box).set({
        padding: [48, 20]
      })
      this.getRoot().add(container);

      container.add(this.getButton1());
    },


    getButton1 : function()
    {
      var button = new qx.ui.form.Button("Menu Test");


      var optionMenu = new qx.ui.menu.Menu;

      optionMenu.add(new qx.ui.menu.Button("Option 1"));
      optionMenu.add(new qx.ui.menu.Button("Option 2"));
      optionMenu.add(new qx.ui.menu.Button("Option 3"));

      var actionMenu = new qx.ui.menu.Menu;

      actionMenu.add(new qx.ui.menu.Button("Action 1"));
      actionMenu.add(new qx.ui.menu.Button("Action 2"));
      actionMenu.add(new qx.ui.menu.Button("Action 3"));



      var cutCommand = new qx.event.Command("Ctrl+X");
      var copyCommand = new qx.event.Command("Ctrl+C");
      var pasteCommand = new qx.event.Command("Ctrl+P");


      var menu = new qx.ui.menu.Menu();

      menu.add(new qx.ui.menu.Button("Revert", "icon/16/actions/edit-undo.png"));
      menu.add(new qx.ui.menu.Button("Recover", "icon/16/actions/edit-redo.png"));
      menu.add(new qx.ui.menu.Separator);
      menu.add(new qx.ui.menu.Button("Cut", "icon/16/actions/edit-cut.png", cutCommand));
      menu.add(new qx.ui.menu.Button("Copy", "icon/16/actions/edit-copy.png", copyCommand));
      menu.add(new qx.ui.menu.Button("Paste", "icon/16/actions/edit-paste.png", pasteCommand));
      menu.add(new qx.ui.menu.Separator);
      menu.add(new qx.ui.menu.Button("Options", "icon/16/actions/system-search.png", null, optionMenu));
      menu.add(new qx.ui.menu.Button("Actions", "icon/16/actions/contact-new.png", null, actionMenu));
      menu.add(new qx.ui.menu.Separator);
      menu.add(new qx.ui.menu.Button("Print", "icon/16/actions/document-print.png"));

      button.addListener("execute", function(e)
      {
        menu.show();
        menu.activate();

        var buttonLocation = this.getContainerLocation();
        menu.moveTo(buttonLocation.left, buttonLocation.bottom);
      });

      return button;
    }
  }
});
