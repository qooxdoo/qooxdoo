Virtual ComboBox
================

The virtual ComboBox acts like the regular combobox, but is based on the
framework's virtual infrastructure.

Preview Image
-------------

![widget/virtualcombobox.png](/pages/widget/virtualcombobox.png)

Features
--------

-   Pointer and keyboard support.
-   Items with plain text and/or icons
-   Ellipsis: If the label does not fit into the widget's bounds an
    ellipsis (”...”) is rendered at the end of the label.
-   Supports filtering, sorting, grouping, data binding and custom
    rendering like the virtuallist.

**Pointer and keyboard behavior:**

  ----------- ------ --------------------- --------------------------------
              keyboa **open drop-down**    key down; key up;
              rd                           

                     **close drop-down**   esc; enter

              pointe **open drop-down**    tap on arrow button
              r                            

                     **close drop-down**   tap on item; click outside
                                           drop-down

  drop-down   keyboa **select next**       not possible
  closed      rd                           

                     **select previous**   not possible

                     **select first**      not possible

                     **select last**       not possible

              pointe **select next**       not possible
              r                            

                     **select previous**   not possible

  drop-down   keyboa **select next**       key down then enter
  open        rd                           

                     **select previous**   key up then enter

                     **select first**      page up then enter

                     **select last**       page down then enter

              pointe **select next**       tap on item
              r                            

                     **select previous**   tap on item

                     **wrap in list**      no

                     **preselect**         pointer over; key up; key down

                     **select drop-down    yes, first item in the list
                     item on open**        which begins with value
  ----------- ------ --------------------- --------------------------------

Description
-----------

The `qx.ui.form.VirtualComboBox` is based on the virtual infrastructure.
The virtual SelectBox has both a textfield and a virtuallist drop-down.
The drop-down can be used to predefine values which the user can select.

Using the virtual infrastructure has considerable advantages when there
is a huge amount of model items to render: Widgets are created only for
visible items and reused. This saves both creation time and memory.

The virtual ComboBox uses the same
[qx.ui.list.core.IListDelegate](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.list.core.IListDelegate)
interface as the virtuallist to configure the ComboBox's behavior (item
and group renderer configuration, filtering, sorting, grouping, etc.).

> **note**

> Only widget based rendering for list and group items is supported.

Code Example
------------

Here's an example. We create a simple ComboBox example with 2500 items,
sorting the items (ascending) and log each value change.

    //create the model data
    var rawData = [];
    for (var i = 0; i < 2500; i++) {
      rawData[i] = "Item No " + i;
    }
    var model = qx.data.marshal.Json.createModel(rawData);

    //create the SelectBox
    var comboBox = new qx.ui.form.VirtualComboBox(model);

    //configure the ComboBox's behavior
    var delegate = {
      sorter : function(a, b) {
        return a > b ? 1 : a < b ? -1 : 0;
      }
    };
    comboBox.setDelegate(delegate);

    //log value changes
    comboBox.addListener("changeValue", function(e) {
      this.debug("Value: " + e.getData());
    }, this);

Demos
-----

Here are some links that demonstrate the usage of the widget:

-   [ComboBox
    demo](http://demo.qooxdoo.org/%{version}/demobrowser/#virtual~ComboBox.html)

API
---

Here is a link to the API of the widget:\
[qx.ui.form.VirtualComboBox](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.form.VirtualComboBox)
