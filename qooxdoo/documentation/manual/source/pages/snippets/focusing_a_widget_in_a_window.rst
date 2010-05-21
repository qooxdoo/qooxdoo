How to set the focus to a widget in a window?
*********************************************

Here is the solution:

::
    var win = new qx.ui.window.Window();
    var field = new qx.ui.form.TextField;
    win.add(field)
    ...
    win.addListener("appear",function() {
      field.focus();
    }, win);
    this.getRoot().add(win);
    win.open();

We must set the focus in the appear event of the window (before the window is shown).  Otherwise it doesn't work.

