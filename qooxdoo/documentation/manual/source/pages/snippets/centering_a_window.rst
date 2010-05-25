.. _pages/snippets/centering_a_window#how_to_center_a_window_on_screen:

How to center a window on screen?
*********************************

Here is the solution:

::

    var win = new qx.ui.window.Window();
    ....
    // first solution
    win.addListener("resize", function(){
      this.center();
    }, win);

    // second solution
    win.addListener("resize", win.center);

    this.getRoot().add(win);
    win.open();

This solution works even if we don't know the real size of the window, because it depends on its content.

Before the window is shown and know its real size, we place it at the center. We use the ``resize`` event instead of the ``appear`` event to prevent any flickering, because when using the ``appear`` event the window is already visible and then moved to the center. With the ``resize`` you can center the window right after the inserting in the DOM (the widget resizes) and avoid any flickering.