/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>
     * Fabian Jakobs (fjakobs)
       <fabian dot jakobs at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#embed(icon/16/network.png)
#embed(icon/16/mail-new.png)
#embed(icon/16/mail-send.png)
#embed(icon/16/appointment.png)

************************************************************************ */


/**
 * A small example how a webmail application can look and feel using qooxdoo.
 */
qx.OO.defineClass("webmail.Application", qx.component.AbstractApplication,
function () {
  qx.component.AbstractApplication.call(this);
});


/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

qx.Proto.main = function(e)
{
  var doc = qx.ui.core.ClientDocument.getInstance();

  var dockLayout = new qx.ui.layout.DockLayout;

  dockLayout.setLocation(20, 48);
  dockLayout.setDimension(700, 500);
  dockLayout.setBackgroundColor("white");
  dockLayout.setBorder(qx.renderer.border.BorderPresets.getInstance().black);

  doc.add(dockLayout);

  var menubar = new qx.ui.menubar.MenuBar;
  var toolbar = new qx.ui.toolbar.ToolBar;
  var tree = new qx.ui.tree.Tree("Inbox");
  var status = new qx.ui.basic.Atom("Status", "icon/16/network.png");

  tree.setWidth(200);
  tree.setBorder(qx.renderer.border.BorderPresets.getInstance().inset);
  tree.add(new qx.ui.tree.TreeFolder("Drafts"));
  tree.add(new qx.ui.tree.TreeFolder("Sent"));
  tree.add(new qx.ui.tree.TreeFolder("Trash"));
  tree.add(new qx.ui.tree.TreeFolder("Junk"));

  status.setWidth(null);
  status.setBorder(qx.renderer.border.BorderPresets.getInstance().thinInset);
  status.setHorizontalChildrenAlign("left");
  status.setPadding(2, 4);
  status.setBackgroundColor("threedface");

  dockLayout.addTop(menubar);
  dockLayout.addTop(toolbar);
  dockLayout.addBottom(status);
  dockLayout.addLeft(tree);



  var btns = [
    { text : "New", icon : "icon/16/mail-new.png" },
    { text : "Send/Receive", icon : "icon/16/mail-send.png" },
    { text : "Adressbook", icon : "icon/16/appointment.png" }
  ];

  for (var i=0; i<btns.length; i++) {
    toolbar.add(new qx.ui.toolbar.Button(btns[i].text, btns[i].icon));
  };



  var filemnu = new qx.ui.menu.Menu;
  var editmnu = new qx.ui.menu.Menu;
  var optimnu = new qx.ui.menu.Menu;
  var helpmnu = new qx.ui.menu.Menu;

  filemnu.add(new qx.ui.menu.Button("New Mail"));
  filemnu.add(new qx.ui.menu.Button("Exit"));

  editmnu.add(new qx.ui.menu.Button("Cut"));
  editmnu.add(new qx.ui.menu.Button("Copy"));
  editmnu.add(new qx.ui.menu.Button("Paste"));

  optimnu.add(new qx.ui.menu.Button("View"));
  optimnu.add(new qx.ui.menu.Button("Settings"));

  helpmnu.add(new qx.ui.menu.Button("Help"));
  helpmnu.add(new qx.ui.menu.Button("About"));

  var filemn = new qx.ui.menubar.Button("File", filemnu);
  var editmn = new qx.ui.menubar.Button("Edit", editmnu);
  var optimn = new qx.ui.menubar.Button("Options", optimnu);
  var helpmn = new qx.ui.menubar.Button("Help", helpmnu);

  menubar.add(filemn, editmn, optimn, new qx.ui.basic.HorizontalSpacer, helpmn);
  doc.add(filemnu, editmnu, optimnu, helpmnu);



  var ld = [];
  var lt = [ "Image", "Text", "PDF", "Illustration", "Document" ];

  for (var i=0, t; i<333; i++)
  {
    t=Math.round(Math.random()*4);
    ld.push({ subject : { text : "Subject " + i }, from : { text : "qooxdoo User" }, date : { text : "01/26/2006" }});
  };

  var lc =
  {
    subject : { label : "Subject", width : 200, type : "text" },
    from : { label : "From", width : 100, type : "text" },
    date: { label : "Date", width : 100, type : "text" }
  };

  var view = new qx.ui.listview.ListView(ld, lc);

  view.setLocation(220, 95);
  view.setDimension(499, 430);
  view.setBorder(qx.renderer.border.BorderPresets.getInstance().inset);

  doc.add(view);
};