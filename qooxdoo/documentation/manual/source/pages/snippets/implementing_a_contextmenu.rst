.. _pages/snippets/implementing_a_contextmenu#how_to_implement_a_context-menu:

How to implement a context-menu?
********************************

Implementing a context-menu is as easy as never before. 

::

    var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas);
    container.setPadding(20);
    this.getRoot().add(container);

    ...

    var list = new qx.ui.form.List;
    list.setContextMenu(this.getContextMenu());
    container.add(list);

    ...

    getContextMenu : function()
    {
       var menu = new qx.ui.menu.Menu;

       var cutButton = new qx.ui.menu.Button("Cut", "icon/16/actions/edit-cut.png", this._cutCommand);
       var copyButton = new qx.ui.menu.Button("Copy", "icon/16/actions/edit-copy.png", this._copyCommand);
       var pasteButton = new qx.ui.menu.Button("Paste", "icon/16/actions/edit-paste.png", this._pasteCommand);

       cutButton.addListener("execute", this.debugButton);
       copyButton.addListener("execute", this.debugButton);
       pasteButton.addListener("execute", this.debugButton);

       menu.add(cutButton);
       menu.add(copyButton);
       menu.add(pasteButton);

       return menu;
    }

This little code snippet is taken from the `online demo <http://demo.qooxdoo.org/%{version}/demobrowser/#widget~Menu.html>`_. Just right-click at the list.

