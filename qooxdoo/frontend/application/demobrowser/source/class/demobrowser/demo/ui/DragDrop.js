/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/places/folder.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.ui.DragDrop",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var root = this.getRoot();


      // ****************************************************************


      // Create source list

      var labelSource = new qx.ui.basic.Label("Source");
      root.add(labelSource, { left : 20, top: 20 });

      var source = new qx.ui.form.List;
      source.setDraggable(true);
      source.setSelectionMode("multi");

      for (var i=0; i<20; i++) {
        source.add(new qx.ui.form.ListItem("Item " + i, "icon/16/places/folder.png"));
      }

      root.add(source, { left : 20, top : 40 });

      var check = new qx.ui.form.CheckBox("Enable drag");
      check.setChecked(true);
      root.add(check, { left : 20, top : 260 });



      source.addListener("dragstart", function(e)
      {
        // dragstart is cancelable, you can put any runtime checks
        // here to dynamically disallow the drag feature on a widget
        if (!check.isChecked()) {
          e.preventDefault();
        }

        // Register supported types
        e.addType("value");
        e.addType("items");

        // Register supported actions
        e.addAction("copy");
        e.addAction("move");
      });



      source.addListener("droprequest", function(e)
      {
        var action = e.getCurrentAction();
        var type = e.getCurrentType();
        var result;

        switch(type)
        {
          case "items":
            result = this.getSelection();

            if (action == "copy")
            {
              var copy = [];
              for (var i=0, l=result.length; i<l; i++) {
                copy[i] = result[i].clone();
              }
              result = copy;
            }
            break;

          case "value":
            result = this.getValue();
            break;
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



      // Optional listener for drag event. This event is fired while moving the
      // mouse in a drag&drop session. It may be used to stop the drag operation
      // or to attach an additional cursor aka feedback widget.
      source.addListener("drag", function(e)
      {
        if (dragStopped)
        {
          dragStopped = false;
          e.preventDefault();
        }
      });





      // Helper to allow dynamic stopping of a drag event
      // when pressing Ctrl+C during the drag

      var dragStopped = false;
      root.addListener("keydown", function(e)
      {
        if (e.isCtrlPressed() && e.getKeyIdentifier() == "C") {
          dragStopped = true;
        }
      });

      cancelLabel = new qx.ui.basic.Label("Try to press Ctrl+C to stop a drag session");
      cancelLabel.setWidth(120);
      cancelLabel.setRich(true);
      root.add(cancelLabel, { left : 20, top: 290 });



      // ****************************************************************


      // Create simple target

      var labelSimple = new qx.ui.basic.Label("Simple Target");
      root.add(labelSimple, { left : 150, top: 20 });

      var targetSimple = new qx.ui.form.List;
      targetSimple.setDroppable(true);
      targetSimple.setSelectionMode("multi");
      root.add(targetSimple, { left : 150, top: 40 });

      targetSimple.addListener("drop", function(e)
      {
        // Move items from source to target
        var items = e.getData("items");
        for (var i=0, l=items.length; i<l; i++) {
          this.add(items[i]);
        }
      });



      // ****************************************************************


      // Create blocked target
      // Block types using a preventDefault on dragover

      var labelBlocked = new qx.ui.basic.Label("Blocked Target");
      root.add(labelBlocked, { left : 280, top: 20 });

      var targetIgnore = new qx.ui.form.List;
      targetIgnore.setDroppable(true);
      targetIgnore.setSelectionMode("multi");
      root.add(targetIgnore, { left : 280, top: 40 });

      targetIgnore.addListener("dragover", function(e)
      {
        // dragover is cancelable. Any widget, even if generally dropable
        // supports it to block the drop when some runtime check delivers
        // some type of false result.
        if (!e.supportsType("sometype")) {
          e.preventDefault();
        }
      });

      targetIgnore.addListener("drop", function(e)
      {
        var items = e.getData("items");
        for (var i=0, l=items.length; i<l; i++) {
          this.add(items[i]);
        }
      });



      // ****************************************************************



      // Text Field uses value

      var labelSimple = new qx.ui.basic.Label("TextArea Target");
      root.add(labelSimple, { left : 410, top: 20 });

      var textareaTarget = new qx.ui.form.TextArea;
      textareaTarget.setDroppable(true);
      textareaTarget.setHeight(100);
      root.add(textareaTarget, { left : 410, top: 40 });

      // Serialize content to text, items are left in the list
      textareaTarget.addListener("drop", function(e) {
        this.setValue(e.getData("value").replace(/,/g, "\n"));
      });
    }
  }
});
