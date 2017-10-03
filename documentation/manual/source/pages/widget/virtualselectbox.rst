.. _pages/widget/virtualwidgets#virtualselectbox:

Virtual SelectBox
*****************
The virtual SelectBox acts like the :doc:`selectbox`, but is based on the framework's virtual infrastructure.

.. _pages/widget/virtualselectbox#preview_image:

Preview Image
-------------

|widget/virtualselectbox.png|

.. |widget/virtualselectbox.png| image:: /pages/widget/virtualselectbox.png

.. _pages/widget/virtualselectbox#features:

Features
--------
* Pointer and keyboard support.
* Items with plain text and/or icons
* Ellipsis: If the label does not fit into the widget's bounds an ellipsis (”...”) is rendered at the end of the label.
* Supports filtering, sorting, grouping, data binding and custom rendering like the :doc:`virtuallist`.

**Pointer and keyboard behavior:**

+------------------+----------+-----------------------------------+----------------------------------------+
|                  |          |                                   |                                        |
+==================+==========+===================================+========================================+
|                  | keyboard | **open drop-down**                | key down; key up; space; enter         |
+------------------+----------+-----------------------------------+----------------------------------------+
|                  |          | **close drop-down**               | esc; enter                             |
+------------------+----------+-----------------------------------+----------------------------------------+
|                  | pointer  | **open drop-down**                | tap on widget                          |
+------------------+----------+-----------------------------------+----------------------------------------+
|                  |          | **close drop-down**               | tap on item; tap outside drop-down     |
+------------------+----------+-----------------------------------+----------------------------------------+
| drop-down closed | keyboard | **select next**                   | not possible                           |
+------------------+----------+-----------------------------------+----------------------------------------+
|                  |          | **select previous**               | not possible                           |
+------------------+----------+-----------------------------------+----------------------------------------+
|                  |          | **select first**                  | not possible                           |
+------------------+----------+-----------------------------------+----------------------------------------+
|                  |          | **select last**                   | not possible                           |
+------------------+----------+-----------------------------------+----------------------------------------+
|                  | pointer  | **select next**                   | not possible                           |
+------------------+----------+-----------------------------------+----------------------------------------+
|                  |          | **select previous**               | not possible                           |
+------------------+----------+-----------------------------------+----------------------------------------+
| drop-down open   | keyboard | **select next**                   | key down then enter                    |
+------------------+----------+-----------------------------------+----------------------------------------+
|                  |          | **select previous**               | key up then enter                      |
+------------------+----------+-----------------------------------+----------------------------------------+
|                  |          | **select first**                  | page up then enter                     |
+------------------+----------+-----------------------------------+----------------------------------------+
|                  |          | **select last**                   | page down then enter                   |
+------------------+----------+-----------------------------------+----------------------------------------+
|                  | pointer  | **select next**                   | tap on item                            |
+------------------+----------+-----------------------------------+----------------------------------------+
|                  |          | **select previous**               | tap on item                            |
+------------------+----------+-----------------------------------+----------------------------------------+
|                  |          | **wrap in list**                  | no                                     |
+------------------+----------+-----------------------------------+----------------------------------------+
|                  |          | **preselect**                     | pointer over; key up; key down         |
+------------------+----------+-----------------------------------+----------------------------------------+
|                  |          | **select drop-down item on open** | yes                                    |
+------------------+----------+-----------------------------------+----------------------------------------+

.. _pages/widget/virtualselectbox#description:

Description
-----------

The ``qx.ui.form.VirtualSelectBox`` is based on the virtual infrastructure. It can be used to select one item and uses the :doc:`virtuallist` as a drop-down.

Using the virtual infrastructure has considerable advantages when there is a huge amount of model items to render: Widgets are created only for visible items and reused. This saves both creation time and memory.

The virtual SelectBox uses the same `qx.ui.list.core.IListDelegate <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.list.core.IListDelegate>`_ interface as the :doc:`virtuallist` to configure the SelectBox's behavior (item and group renderer configuration, filtering, sorting, grouping, etc.).

.. note::
  Only widget based rendering for list and group items is supported.

.. _pages/widget/virtualselectbox#codeexample:

Code Example
------------

Here's an example. We create a simple SelectBox example with 2500 items, sort the items (ascending), select the 20th item and log each selection change.

::

    //create the model data
    var rawData = [];
    for (var i = 0; i < 2500; i++) {
      rawData[i] = "Item No " + i;
    }
    var model = qx.data.marshal.Json.createModel(rawData);

    //create the SelectBox
    var selectBox = new qx.ui.form.VirtualSelectBox(model);

    //configure the SelectBox's behavior
    var delegate = {
      sorter : function(a, b) {
        return a > b ? 1 : a < b ? -1 : 0;
      }
    };
    selectBox.setDelegate(delegate);

    //Pre-Select "Item No 20"
    selectBox.getSelection().push(model.getItem(20));

    //log selection changes
    selectBox.getSelection().addListener("change", function(e) {
      this.debug("Selection: " + selectBox.getSelection().getItem(0));
    }, this);

.. _pages/widget/virtualselectbox#demos:

Demos
-----
Here are some links that demonstrate the usage of the widget:

* `SelectBox demo <http://demo.qooxdoo.org/%{version}/demobrowser/#virtual~SelectBox.html>`_

.. _pages/widget/virtualselectbox#api:

API
---
| Here is a link to the API of the widget:
| `qx.ui.form.VirtualSelectBox <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.form.VirtualSelectBox>`_

