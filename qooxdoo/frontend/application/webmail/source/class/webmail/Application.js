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
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#embed(qx.icontheme/16/categories/applications-internet.png)
#embed(qx.icontheme/16/actions/mail.png)
#embed(qx.icontheme/16/actions/system-run.png)
#embed(qx.icontheme/16/apps/accessories-notes.png)

************************************************************************ */

/**
 * A small example how a webmail application can look and feel using qooxdoo.
 */
qx.Class.define("webmail.Application",
{
  extend : qx.application.Gui,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    main : function()
    {
      this.base(arguments);

      var doc = qx.legacy.ui.core.ClientDocument.getInstance();

      var dockLayout = new qx.legacy.ui.layout.DockLayout;

      dockLayout.setLocation(0, 0);
      //dockLayout.setDimension(800, 600);
      dockLayout.setRight(0);
      dockLayout.setBottom(0);
      dockLayout.setBackgroundColor("white");

      doc.add(dockLayout);

      var menubar = new qx.legacy.ui.menubar.MenuBar;
      var toolbar = new qx.legacy.ui.toolbar.ToolBar;
      var tree = new qx.legacy.ui.tree.Tree("Inbox");
      var status = new qx.legacy.ui.basic.Atom("Status", "icon/16/categories/applications-internet.png");

      tree.setWidth(200);
      tree.setHeight(null);
      tree.setPadding(5);
      tree.setBorder("inset");
      tree.add(new qx.legacy.ui.tree.TreeFolder("Drafts"));
      tree.add(new qx.legacy.ui.tree.TreeFolder("Sent"));
      tree.add(new qx.legacy.ui.tree.TreeFolder("Trash"));
      tree.add(new qx.legacy.ui.tree.TreeFolder("Junk"));

      status.setWidth(null);
      status.setBorder("inset-thin");
      status.setHorizontalChildrenAlign("left");
      status.setPadding(2, 4);
      status.setBackgroundColor("background");

      dockLayout.addTop(menubar);
      dockLayout.addTop(toolbar);
      dockLayout.addBottom(status);
      dockLayout.addLeft(tree);

      var btns = [
      {
        text : "New",
        icon : "icon/16/actions/mail.png"
      },
      {
        text : "Send/Receive",
        icon : "icon/16/actions/system-run.png"
      },
      {
        text : "Adressbook",
        icon : "icon/16/apps/accessories-notes.png"
      } ];

      for (var i=0; i<btns.length; i++) {
        toolbar.add(new qx.legacy.ui.toolbar.Button(btns[i].text, btns[i].icon));
      }

      var filemnu = new qx.legacy.ui.menu.Menu;
      var editmnu = new qx.legacy.ui.menu.Menu;
      var optimnu = new qx.legacy.ui.menu.Menu;
      var helpmnu = new qx.legacy.ui.menu.Menu;

      filemnu.add(new qx.legacy.ui.menu.Button("New Mail"));
      filemnu.add(new qx.legacy.ui.menu.Button("Exit"));

      editmnu.add(new qx.legacy.ui.menu.Button("Cut"));
      editmnu.add(new qx.legacy.ui.menu.Button("Copy"));
      editmnu.add(new qx.legacy.ui.menu.Button("Paste"));

      optimnu.add(new qx.legacy.ui.menu.Button("View"));
      optimnu.add(new qx.legacy.ui.menu.Button("Settings"));

      helpmnu.add(new qx.legacy.ui.menu.Button("Help"));
      helpmnu.add(new qx.legacy.ui.menu.Button("About"));

      var filemn = new qx.legacy.ui.menubar.Button("File", filemnu);
      var editmn = new qx.legacy.ui.menubar.Button("Edit", editmnu);
      var optimn = new qx.legacy.ui.menubar.Button("Options", optimnu);
      var helpmn = new qx.legacy.ui.menubar.Button("Help", helpmnu);

      menubar.add(filemn, editmn, optimn, new qx.legacy.ui.basic.HorizontalSpacer, helpmn);
      doc.add(filemnu, editmnu, optimnu, helpmnu);

      var ld = [];
      var lt = [ "Image", "Text", "PDF", "Illustration", "Document" ];

      for (var i=0, t; i<333; i++)
      {
        t = Math.round(Math.random() * 4);

        ld.push(
        {
          subject : { text : "Subject " + i },
          from    : { text : "qooxdoo User" },
          date    : { text : "01/26/2006" }
        });
      }

      var lc =
      {
        subject :
        {
          label : "Subject",
          width : 200,
          type  : "text"
        },

        from :
        {
          label : "From",
          width : 100,
          type  : "text"
        },

        date :
        {
          label : "Date",
          width : 100,
          type  : "text"
        }
      };

      var view = new qx.legacy.ui.listview.ListView(ld, lc);
      view.setBorder("inset");
      dockLayout.add(view);
    }
  }
});
