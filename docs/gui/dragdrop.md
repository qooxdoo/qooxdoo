Drag & Drop
===========

Drag & Drop is one of the essential technologies in today's applications. An operation must have a starting point (e.g. where the pointer was tapped), may have any number of intermediate steps (widgets that the pointer moves over during a drag), and must either have an end point (the widget above which the pointer was released), or be canceled.

qooxdoo comes with a powerful event-based layer which supports drag&drop with full data exchange capabilities. Every widget can be configured to cooperate with drag&drop be it as sender (draggable), receiver (droppable) or both. A sender (drag target) can send data to any receiver (drop target).

You may like to see an example first:

-   [Drag&Drop for Lists](http://demo.qooxdoo.org/%{version}/demobrowser/#ui~DragDrop.html)

Basics
------

To enable Drag & Drop the properties [draggable](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.Widget~draggable) and [droppable](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.Widget~droppable) must be enabled on the specific widgets. For list type sources or targets it's often enough to make the top-level widget drag- or droppable e.g. the list instead of the list items.

    var dragTarget = new qx.ui.form.List();
    dragTarget.setDraggable(true);

    var dropTarget = new qx.ui.form.List();
    dropTarget.setDroppable(true);

The basic drag&drop should start working with these properties enabled, but it will show the no-drop cursor over all potential targets. To fix this one needs to register actions (and optionally data types) supported by the drag target. This can be done during the `dragstart` event which is fired on the drag target:

    dragTarget.addListener("dragstart", function(e) {
      e.addAction("move");
    });

The drop target can then add a listener to react for the `drop` event.

    dropTarget.addListener("drop", function(e) {
      alert(e.getRelatedTarget());
    });

The listener now shows an alert box which should present the identification ID (classname + hash code) of the drag target. Theoretically this could already be used to transfer data from A to B.

A common need is to retrieve information from the model of the specific list item which was dragged from `dragTarget` which is an instance of `qx.ui.form.List`. This can be easily accomplished in the `drop` event handler, using the event argument which provides a manager which provides the actual drag target (the `qx.ui.form.ListItem`).

    dropTarget.addListener("drop", function(e) {
      var listItem = e.getManager().getDragTarget();
      var model = listItem.getModel();
      ...
    });

Data Handling
-------------

qooxdoo also supports advanced data handling in drag&drop sessions. The basic idea is to register the supported drag data types and then let the drop target choose which one to handle (if any at all).

To register some types write a listener for `dragstart`:

    source.addListener("dragstart", function(e) {
      e.addAction("move");

      e.addType("qx/list-items");
      e.addType("html/list");
    });

This is basically only the registration for the types which could theoretically be delivered to the target. The IDs used are just strings. They have no special meaning. They could be identical to typical mime-types like `text/plain` but there is no need for this.

The preparation of the data (if not directly available) is done lazily by the `droprequest` event which will explained later. The next step is to let the target work with the incoming data. The following code block appends all the dropped children to the end of the list.

    target.addListener("drop", function(e) {
      var items = e.getData("qx/list-items");
      for (var i=0, l=items.length; i<l; i++) {
        this.add(items[i]);
      }
    });

The last step needed to get the thing to fly is to prepare the data for being dragged around. This might look like the following example:

    source.addListener("droprequest", function(e)
    {
      var type = e.getCurrentType();

      if (type == "qx/list-items")
      {
        var items = this.getSelection();

        // Add data to manager
        e.addData(type, items);
      }
      else if (type == "html/list")
      {
        // TODO: support for HTML markup
      }
    });

### Support Multiple Actions

One thing one might consider is to add support for multiple actions. In the above example it would be imaginable to copy or move the items around. To make this possible one could add all supported actions during the `drag` event. This might look like the following:

    source.addListener("dragstart", function(e)
    {
      // Register supported actions
      e.addAction("copy");
      e.addAction("move");

      // Register supported types
      e.addType("qx/list-items");
      e.addType("html/list");
    });

The action to use is modifiable by the user through pressing of modifier keys during the drag&drop process. The preparation of the data is done through the `droprequest` as well. Here one can use the action (call `e.getCurrentAction()` to get the selected action) to apply different modifications on the original data. A modified version of the code listed above might look like the following:

    source.addListener("droprequest", function(e)
    {
      var action = e.getCurrentAction();
      var type = e.getCurrentType();
      var result;

      if (type === "qx/list-items")
      {
        result = this.getSelection();

        if (action == "copy")
        {
          var copy = [];
          for (var i=0, l=result.length; i<l; i++) {
            copy[i] = result[i].clone();
          }
          result = copy;
        }
      }
      else if (case == "html/list")
      {
        // TODO: support for HTML markup
      }

      // Remove selected items on move
      if (action == "move")
      {
        var selection = this.getSelection();
        for (var i=0, l=selection.length; i<l; i++) {
          this.remove(selection[i]);
        }
      }

      // Add data to manager
      e.addData(type, result);
    });

As known from major operating systems, exactly three actions are supported:

-   `move`
-   `copy`
-   `alias`

which could be combined in any way the developer likes. qooxdoo renders a matching cursor depending on the currently selected action during the drag&drop sequence. The event `dragchange` is fired on the source widget on every change of the currently selected action. It is also fired on the target and is cancelable which enables the developers to allow only certain actions on targets.

Runtime checks
--------------

There are a few other pleasantries. For example it is possible for `droppable` widgets to ignore a specific incoming data type. This can be done by preventing the default action on the incoming `dragover` event:

    target.addListener("dragover", function(e)
    {
      if (someRunTimeCheck()) {
        e.preventDefault();
      }
    });

This could be used to dynamically accept or disallow specific types of drop events depending on the application status or any other given condition. The user then gets a `nodrop` cursor to signal that the hovered target does not accept the data. To query the source object for supported types or actions one would call the methods `supportsAction` or `supportsType` on the incoming event object.

Something comparable is possible during the `dragstart` event:

    source.addListener("dragstart", function(e)
    {
      if (someRunTimeCheck()) {
        e.preventDefault();
      }
    });

This prevents the dragging of data from the source widget when some runtime condition is not solved. This is especially useful to call some external functionality to check whether a desired action is possible. In this case it might also depend on the other properties of the source widget e.g. in a mail program it is possible to drag the selection of the tree to another folder, with one exception: the inbox. This could easily be solved with such a feature.

Drag Session
------------

During the drag session the `drag` event is fired for every move of the pointer. This event may be used to "attach" an image or widget to the pointer to indicate the type of data or object dragged around. It may also be used to render a line during a reordering drag&drop session (see next paragraph). It supports the methods `getDocumentLeft` and `getDocumentTop` known from the `pointermove` event. This data may be used for the positioning of a cursor.

When hovering a widget the `dragover` event is fired on the "interim" target. When leaving the widget the `dragleave` event is fired. The `dragover` is cancelable and has information about the related target (the source widget) through `getRelatedTarget` on the incoming event object.

Another quite useful event is the `dragend` event which is fired at every end of the drag session. This event is fired in both cases, when the transaction has modified anything or not. It is fired when pressing Escape or stopping the session any other way as well.

A typical sequence of events could look like this:

-   `dragstart` on source (once)
-   `drag` on source (pointer move)
-   `dragover` on target (pointer over)
-   `dragchange` on source (action change)
-   `dragleave` on target (pointer out)
-   `drop` on target (once)
-   `droprequest` on source (normally once)
-   `dragend` on source (once)

Reordering Items
----------------

Items may also be reordered inside one widget using the drag&drop API. This action is normally not directly data related and may be used without adding any types to the drag&drop session.

    reorder.addListener("dragstart", function(e) {
      e.addAction("move");
    });

    reorder.addListener("drop", function(e)
    {
      // Using the selection sorted by the original index in the list
      var sel = this.getSortedSelection();

      // This is the original target hovered
      var orig = e.getOriginalTarget();

      for (var i=0, l=sel.length; i<l; i++)
      {
        // Insert before the marker
        this.addBefore(sel[i], orig);

        // Recover selection as it gets lost during child move
        this.addToSelection(sel[i]);
      }
    });
