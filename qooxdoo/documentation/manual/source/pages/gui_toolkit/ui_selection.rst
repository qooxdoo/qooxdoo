.. _pages/ui_selection#selection_handling:

Selection Handling
******************

The framework contains a couple of widgets which support selection handling. These are divided into widgets that support ``Single Selection`` and others that support ``Multi Selection``. A widget which supports multi selection also supports single selection.

Here is a list of widgets which support single and/or multi selection:

* Multi Selection:
  
  * `Tree <http://demo.qooxdoo.org/1.2.x/demobrowser/#widget~Tree.html>`_ `(API) <http://demo.qooxdoo.org/1.2.x/apiviewer/#qx.ui.tree.Tree>`__
  * `List <http://demo.qooxdoo.org/1.2.x/demobrowser/#widget~List.html>`_ `(API) <http://demo.qooxdoo.org/1.2.x/apiviewer/#qx.ui.form.List>`__

* Single Selection:
  
  * `SelectBox <http://demo.qooxdoo.org/1.2.x/demobrowser/#widget~SelectBox.html>`_ `(API) <http://demo.qooxdoo.org/1.2.x/apiviewer/#qx.ui.form.SelectBox>`__
  * `RadioGroup <http://demo.qooxdoo.org/1.2.x/demobrowser/#widget~RadioButton.html>`_ `(API) <http://demo.qooxdoo.org/1.2.x/apiviewer/#qx.ui.form.RadioGroup>`__
  * `TabView <http://demo.qooxdoo.org/1.2.x/demobrowser/#widget~TabView.html>`_ `(API) <http://demo.qooxdoo.org/1.2.x/apiviewer/#qx.ui.tabview.TabView>`__
  * `Stack <http://demo.qooxdoo.org/1.2.x/demobrowser/#widget~StackContainer.html>`_ `(API) <http://demo.qooxdoo.org/1.2.x/apiviewer/#qx.ui.container.Stack>`__

.. _pages/ui_selection#what_was_wrong_with_the_old_api_in_0.8.x:

What was wrong with the old API in 0.8.x?
=========================================

The  `old selection API <http://qooxdoo.org/documentation/0.8/ui_selection>`_ had different methods for single and multi selection and partially different events, because an interface describing the specification was missing. To offer a consistend API an interface specification was needed. The standardization has shown, that having only one interface for single and multi selection is not enough, because it would be possible to have different events for multi and single selection (remember all multi selection widgets also supports single selection).

One possible solution was to have the same methods and events for single and multi selection. This is possible if the single and multi selection both work with arrays. Due to that fact it is possible to change widgets without having to worry about the selection method, because the method and event names don't change.

.. _pages/ui_selection#selection_interfaces:

Selection Interfaces
====================
|Selection API Interfaces|

.. |Selection API Interfaces| image:: /pages/gui_toolkit/new_selection_api.png

.. _pages/ui_selection#event:

Event
-----
Both selections fire a ``changeSelection`` event if the selection has changed. Listeners can register the event to be notified about the changes. The event contains an array with the new selected widgets. If the array is empty no widgets are selected. 

::

    list.addListener("changeSelection", function(e)
    {
      var selection = e.getData();
      for (var i = 0; i < selection.lenght; i++) {
        this.debug("Selected item: " + selection[i]);
      }
    }, this);

.. _pages/ui_selection#selection_methods:

Selection Methods
-----------------
The ``ISingleSelection`` interface specifies the methods for single selection handling. Since the methods of the single selecting interface are re-used, the ``IMultiSelection`` only extends the interface with methods for multi selection handling.

The re-using of the methods requires a uniform handling for setting and getting the current selection. This has been achieved by using an array for the selection handling, see ``setSelection`` and ``getSelection``.

.. _pages/ui_selection#single_selection_methods:

Single Selection
================
The listed single selection widgets above implement the ``ISingleSelection``. To implement the behavior they use the `MSingleSelectionHandling <http://demo.qooxdoo.org/1.2.x/apiviewer/#qx.ui.core.MSingleSelectionHandling>`_ mixin. The mixin offers the methods for selection handling and it also initialize the manager for selection management.

The widget itself configures the mixin for allowing an empty selection or not. Dependent on the configuration, the ``resetSelection`` clears the current selection (empty array) or selects the first selectable element.

The user interactions (mouse and keyboard) are managed from the widget, which only calls the selection methods if the user interaction has an effect on the selection. So the selection management and the user interaction handling are separated. This is one thing that has changed with the new selection API.

.. _pages/ui_selection#multi_selection_methods:

Multi Selection
===============
The multi selection implementation has hardly changed. The widgets supporting multiselection, also listed above, have already used a mixin called `MSelectionHandling <http://demo.qooxdoo.org/1.2.x/apiviewer/#qx.ui.core.MSelectionHandling>`_ for selection handling. It offers, like the mixin for the single selection, the methods for selection and initializes the selection manager. The mixin has only been changed to be conform to the new ``IMultiSelection`` interface.

.. _pages/ui_selection#selection_modes:

Selection Modes
---------------
Due to the small changes the configuration for the selection mode hasn't changed. The widgets also suport the property ``selectionMode`` with these different modes:

* **single:** Only one element or none at all can be selected.
* **one:** Exactly one item is selected if possible. The first selectable item is selected per default.
* **multi:**  Multiple items can be selected by using the modifier keys together with mouse or keyboard actions. This type also allows empty selections.
* **adaptive:** Easy Web-2.0 selection mode: multiple items can be selected without modifier keys. Empty selections are possible.

.. note::

    *Multi* and *Adaptive* selections are dealing with **selection ranges**, *Single* and *One* are dealing with one **selected item**.

::

    list.setSelectionMode("multi");

.. _pages/ui_selection#selection_options:

Selection Options
-----------------
This options change the way a selection is created or modified. Per default items can be selected by holding down the mouse button and hovering them or by holding down the modifier key and pressing the arrow keys to traverse them.

* **Quick:** One item can be selected by hovering it (no need to click on it or hit keys) Only possible for modes *single* and *one*.
* **Drag:** Multiselection of items through dragging the mouse in pressed states. Only possible for the modes *multi* and *additive*.

::

    list.setDragSelection(true);

.. _pages/ui_selection#how_to_use_the_selection_api:

How to use the selection API
=============================

.. _pages/ui_selection#single_selection:

Single Selection
----------------

The example below shows how to use the single selection API, this example uses the `SelectBox <http://demo.qooxdoo.org/1.2.x/apiviewer/#qx.ui.form.SelectBox>`__ widget:

::

    // creates the SelectBox
    var selectBox = new qx.ui.form.SelectBox();
    this.getRoot().add(selectBox, {top: 20, left: 20});

    // registers the listener
    selectBox.addListener("changeSelection", function(event) {
      this.debug("Selected (event): " + event.getData()[0].getLabel());
    }, this);

    // creates the items and select one of them
    for (var i = 0; i < 10; i++)
    {
      var item = new qx.ui.form.ListItem("ListItem" + i);
      selectBox.add(item);

      if (i == 5) {
        selectBox.setSelection([item]);
      }
    }

    this.debug("Selected (selectBox): " + selectBox.getSelection()[0].getLabel());

The output should be:

::

    (1) Selected (event): ListItem0
    (2) Selected (event): ListItem5
    (3) Selected (selectBox): ListItem5

The SelectBox's implemention doesn't allow empty selections, so if the first item is added to the SelectBox it will be selected (1). (2) occurs, due to the selection and (3) from ``getSelection``.

.. _pages/ui_selection#multi_selection:

Multi Selection
---------------

The next example uses the `List <http://demo.qooxdoo.org/1.2.x/apiviewer/#qx.ui.form.List>`__ widget:

::

    // creates the List and sets the selection mode
    var list = new qx.ui.form.List();
    list.setSelectionMode("multi");
    this.getRoot().add(list, {top: 20, left: 20});

    // registers the listener
    list.addListener("changeSelection", function(event) {
      this.debug("Selection (event): " + event.getData());
    }, this);

    // creates the items
    for (var i = 0; i < 10; i++)
    {
      var item = new qx.ui.form.ListItem("ListItem" + i);
      list.add(item);
    }

    // sets selection
    list.setSelection([list.getChildren()[1], list.getChildren()[4]]);

    this.debug("Selection (list): " + list.getSelection());

The output could look like this:

::

    (1) Selection (event): qx.ui.form.ListItem[1p],qx.ui.form.ListItem[2a]
    (2) Selection (list): qx.ui.form.ListItem[1p],qx.ui.form.ListItem[2a]

.. _pages/ui_selection#how_to_migrate_from_the_0.8.x_to_the_1.2.x_selection_api:

How to migrate from the 0.8.x to the 1.2.x selection API
========================================================

.. note::

    The old selection API is set to deprecated. This mean that the old selection API can still be used, but deprecation warnings occur in the source version of the application. So the old code runs with using the old selection API, but in the future the deprecated methods will be removed, so please change as soon as possible to the new selection API. 

By changing the framework applications, like the `Demo Browser <http://demo.qooxdoo.org/1.2.x/demobrowser/>`_, to the new selection API, useful steps have been found:

(1) Search the source code for only one widget that uses the old selection API.
(2) Replace the old method/event with the new one, but only for the classes that contain a reference from the widget.
(3) Run ``generate.py source``, start the application and test your changes.
(4) If the application runs without errors go to step one and choose the next widget, otherwise fix the problem.
(5) If you have searched for all widgets and renamed the old methods/events in these classes, search for the old method/event names in the complete source code and rename them if they are really using the old API.
(6) Run ``generate.py source``, start your application and test your changes again.
(7) If there are no errors or deprecation warnings while testing your code, you have finished the migration.

.. _pages/ui_selection#what_does_rename_the_method/event_mean:

What does 'rename' the method/event mean?
-----------------------------------------

It means to replace the old method/event names with the new method/event names, but don't forget to customize the **method parameter** and **return values**!!! If you only rename the method/event-names you will get many errors!!!

The examples below show some use cases, for renaming the old methods/events. 

All examples started with step (1) searching for ``qx.ui.form.SelectBox``. We found the variable ``__group`` that references a ``SelectBox`` instance.

.. _pages/ui_selection#example_for_renaming_setselected_to_setselection:

Example for renaming 'setSelected' to 'setSelection'
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

::

    this.__group.setSelected(firstItem);

      /*
       * To rename this method, we have to change the method 'setSelected'
       * to 'setSelection' and putting the 'firstItem' into an array.
       */

      this.__group.setSelection([firstItem]);

.. _pages/ui_selection#example_renaming_getselected_to_getselection:

Example renaming 'getSelected' to 'getSelection'
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

::

    var selectedGroup = this.__group.getSelected();

      /*
       * To rename this method, we have to change the method 'getSelected'
       * to 'getSelection' and select the first element from the returned array.
       */

      var selectedGroup = this.__group.getSelection()[0];

.. _pages/ui_selection#example_renaming_changeselected_to_changeselection:

Example renaming 'changeSelected' to 'changeSelection'
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

::

    this.__group.addListener("changeSelected", function(event) {
        var selectedGroup = event.getData();
      });

      /*
       * To rename that event, we have to change the event 'changeSelected'
       * to 'changeSelection' and select the first element from the data array.
       */

      this.__group.addListener("changeSelection", function(event) {
        var selectedGroup = event.getData()[0];
      });

.. note::

    Be careful with mindless renaming methods and events, because an error only occurs if the code part is executed.

    So if you are not sure that the method or event is the right to rename, then add a **TODO** comment and rename it later, by trying to execute this code part, if this is relay a old method/event a deprecation warning occurs. 

