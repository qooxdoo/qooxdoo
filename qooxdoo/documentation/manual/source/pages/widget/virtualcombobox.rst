.. _pages/widget/virtualwidgets#virtualcombobox:

Virtual ComboBox
*****************
The virtual ComboBox has the same act like the :doc:`combobox`, but the virtual ComboBox is based on the virtual infrastructure from the framework.

.. _pages/widget/virtualcombobox#preview_image:

Preview Image
-------------

|widget/virtualcombobox.png|

.. |widget/virtualcombobox.png| image:: /pages/widget/virtualcombobox.png

.. _pages/widget/virtualcombobox#features:

Features
--------
* Mouse and keyboard support.
* Items with plane text and/or icons
* Ellipsis: If the label does not fit into the widget bounds an ellipsis (”...”) is rendered at the end of the label.
* Supports filtering, sorting, grouping, data binding and custom rendering like the :doc:`virtuallist`.

**Mouse and keyboard behavior:**

+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  |          |                                   |                                                     |
+==================+==========+===================================+=====================================================+
|                  | keyboard | **open drop-down**                | key down; key up;                                   |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  |          | **close drop-down**               | esc; enter                                          |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  | mouse    | **open drop-down**                | click on arrow button                               |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  |          | **close drop-down**               | click on item; click outside drop-down              |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
| drop-down closed | keyboard | **select next**                   | not possible                                        |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  |          | **select previous**               | not possible                                        |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  |          | **select first**                  | not possible                                        |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  |          | **select last**                   | not possible                                        |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  | mouse    | **select next**                   | not possible                                        |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  |          | **select previous**               | not possible                                        |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
| drop-down open   | keyboard | **select next**                   | key down then enter                                 |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  |          | **select previous**               | key up then enter                                   |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  |          | **select first**                  | page up then enter                                  |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  |          | **select last**                   | page down then enter                                |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  | mouse    | **select next**                   | click on item                                       |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  |          | **select previous**               | click on item                                       |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  |          | **wrap in list**                  | no                                                  |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  |          | **preselect**                     | mouse over; key up; key down                        |
+------------------+----------+-----------------------------------+-----------------------------------------------------+
|                  |          | **select drop-down item on open** | yes, first item in the list which begins with value |
+------------------+----------+-----------------------------------+-----------------------------------------------------+

.. _pages/widget/virtualcombobox#description:

Description
-----------

The ``qx.ui.form.VirtualComboBox`` is based on the virtual infrastructure. The virtual SelectBox is like a :doc:`textfield`, but it has a :doc:`virtuallist` as drop-down. The drop-down can be used to predefine some values which the user can use or not. 
 
Using the virtual infrastructure has considerable advantages when there is a huge amount of model items to render because the virtual infrastructure only creates widgets for visible items and reuses them. This saves both creation time and memory.

The virtual ComboBox uses the same `qx.ui.list.core.IListDelegate <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.list.core.IListDelegate>`_ interface like the :doc:`virtuallist` to configure the ComboBox's behavior (item and group renderer configuration, filtering, sorting, grouping, etc.).

.. note::
  At the moment we only support widget based rendering for list and group items, but we are planing also to support HTML based rendering in a future release.

.. _pages/widget/virtualcombobox#codeexample:

Code Example
------------

Here's an example. We create a simple ComboBox example with 2500 items, sorting the items ascending and logs each value change.

::

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

.. _pages/widget/virtualcombobox#demos:

Demos
-----
Here are some links that demonstrate the usage of the widget:

* `ComboBox demo <http://demo.qooxdoo.org/%{version}/demobrowser/#virtual~ComboBox.html>`_

.. _pages/widget/virtualcombobox#api:

API
---
| Here is a link to the API of the widget:
| `qx.ui.form.VirtualComboBox <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.form.VirtualComboBox>`_

