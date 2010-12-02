.. _pages/widget/virtualwidgets#virtuallist:

Virtual List
************
The virtual List is a widget which based on the virtual infrastructure from the framework.

.. _pages/widget/virtuallist#preview_image:

Preview Image
-------------

|widget/virtuallist.png|

.. |widget/virtuallist.png| image:: /pages/widget/virtuallist.png

.. _pages/widget/virtuallist#description:

Description
-----------

The ``qx.ui.list.List`` is based on the virtual infrastructure and supports filtering, sorting, grouping, single selection, multi selection, data binding and custom rendering.
 
Using the virtual infrastructure has considerable advantages when there is a huge amount of model items to render because the virtual infrastructure only creates widgets for visible items and reuses them. This saves both creation time and memory.

With the `qx.ui.list.core.IListDelegate <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.list.core.IListDelegate>`_ interface it is possible to configure the list's behavior (item and group renderer configuration, filtering, sorting, grouping, etc.).

.. note::
  At the moment we only support widget based rendering for list and group items, but we are planing also to support HTML based rendering in a future release.

.. _pages/widget/virtuallist#codeexample:

Code Example
------------

Here's an example. We create a simple list example with 2500 items, sorting the items ascending, selecting the 20th item and we log each selection change.

::

    //create the model data
    var rawData = [];
    for (var i = 0; i < 2500; i++) {
      rawData[i] = "Item No " + i;
    }
    var model = qx.data.marshal.Json.createModel(rawData);
     
    //create the list
    var list = new qx.ui.list.List(model);
     
    //configure the lists's behavior
    var delegate = {
      sorter : function(a, b) {
        return a > b ? 1 : a < b ? -1 : 0;
      }
    };
    list.setDelegate(delegate);
     
    //Pre-Select "Item No 20"
    list.getSelection().push(model.getItem(20));
    
    //log selection changes
    list.getSelection().addListener("change", function(e) {
      this.debug("Selection: " + list.getSelection().getItem(0));
    }, this);

.. _pages/widget/virtuallist#demos:

Demos
-----
Here are some links that demonstrate the usage of the widget:

* `Example for the virtual List widget <http://demo.qooxdoo.org/%{version}/demobrowser/#virtual~List.html>`_
* `Example shows the filtering feature <http://demo.qooxdoo.org/%{version}/demobrowser/#virtual~ListWithFilter.html>`_
* `Example shows the custom rendering <http://demo.qooxdoo.org/%{version}/demobrowser/#virtual~ExtendedList.html>`_
* `Example shows the grouping feature <http://demo.qooxdoo.org/%{version}/demobrowser/#virtual~GroupedList.html>`_

.. _pages/widget/virtuallist#api:

API
---
| Here is a link to the API of the widget:
| `qx.ui.indicator.progressbar <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.list.List>`_

