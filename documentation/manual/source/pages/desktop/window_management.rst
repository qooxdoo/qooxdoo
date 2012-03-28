Window Management
=================

Window is a widget used to show dialogs or to realize a MDI (Multiple Document Interface) applications. Windows can only be added to ``qx.ui.window.Desktop`` widgets, or to widgets which implement the ``qx.ui.window.IDesktop`` interface.  

Each Desktop widget must have a ``qx.ui.window.Manager``. If none is provided, the default window manager (``qx.ui.window.Window#DEFAULT_MANAGER_CLASS``) is used. The desktop uses the manager to handle the contained windows. 

The manager takes care of windows z-index order. Windows can be normal (default), always on top or modal. Always on top windows stay on top of normal windows and modal windows appear in front of all other windows. If there are a bunch of windows open and we close one, the manager will activate the window that is higher in the z-index order stack.

Let's see this in action. We'll create a tabview with one page, create a desktop widget for the page, and add different types of windows. You can see how the opened windows stack on each other and when you close one, the highest z-index order window will get activated.

::

    var root = this.getRoot();
    var tabView = new qx.ui.tabview.TabView();
    var page = new qx.ui.tabview.Page("Desktop");
    var windowManager = new qx.ui.window.Manager();
    var desktop = new qx.ui.window.Desktop(windowManager);
    var aWindow = null;
    
    page.setLayout(new qx.ui.layout.Grow());
    page.add(desktop);
    tabView.add(page);
    root.add(tabView, {edge: 0});
    
    //create 3 normal windows and add them to the page's desktop
    for (var i=0; i<3; i++)
    {
      aWindow = new qx.ui.window.Window("Normal Window #" +i).set({
        width:300
      });
      desktop.add(aWindow);
      aWindow.open();
    }
    
    //create 3 alwaysOnTop windows and add them to the page's desktop
    for (var i=0; i<3; i++)
    {
      aWindow = new qx.ui.window.Window("AlwaysOnTop Window #" +i).set({
        width:300
      });
      aWindow.setAlwaysOnTop(true);
      desktop.add(aWindow);
      aWindow.open();
    }
    
    //create a modal window and add it to the page's desktop
    aWindow = new qx.ui.window.Window("Modal Window #" +i).set({
      width:300
    });
    aWindow.setModal(true);
    desktop.add(aWindow);
    aWindow.open();


Like I said, windows can be added to widgets which implement the IDesktop interface. This interface is implemented by ``qx.ui.window.MDesktop`` mixin. You can use this mixin to make a custom widget behave like a Desktop. This is exactly what the superclass of all root widgets (``qx.ui.root.Abstract``) does. This is why we can add windows to a root widget.

::

    var win = new qx.ui.window.Window("First Window");
    var root = this.getRoot();
    root.add(win);
    win.open();


Related documentation
---------------------
`Window widget <http://manual.qooxdoo.org/%{version}/pages/widget/window.html>`_


Demos and API
-------------
To find out more, you can check the `desktop demo <http://demo.qooxdoo.org/%{version}/demobrowser/index.html#widget~Desktop.html>`_ and the `API reference <http://demo.qooxdoo.org/%{version}/apiviewer/index.html#qx.ui.window>`_. 
