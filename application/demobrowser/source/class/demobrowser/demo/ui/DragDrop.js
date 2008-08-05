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
      root.add(source, { left : 20, top : 40 });

      for (var i=0; i<20; i++) {
        source.add(new qx.ui.form.ListItem("Item " + i, "icon/16/places/folder.png"));
      }

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
        this.debug("Related of droprequest: " + e.getRelatedTarget());

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





      // ****************************************************************


      // Create simple target

      var labelSimple = new qx.ui.basic.Label("Simple Target");
      root.add(labelSimple, { left : 140, top: 20 });

      var targetSimple = new qx.ui.form.List;
      targetSimple.setDroppable(true);
      targetSimple.setSelectionMode("multi");
      root.add(targetSimple, { left : 140, top: 40 });

      targetSimple.addListener("drop", function(e)
      {
        this.debug("Related of drop: " + e.getRelatedTarget());

        // Move items from source to target
        var items = e.getData("items");
        for (var i=0, l=items.length; i<l; i++) {
          this.add(items[i]);
        }
      });



      // ****************************************************************



      // Text Field uses value

      var labelSimple = new qx.ui.basic.Label("TextArea Target");
      root.add(labelSimple, { left : 260, top: 20 });

      var textareaTarget = new qx.ui.form.TextArea;
      textareaTarget.setDroppable(true);
      textareaTarget.setHeight(100);
      root.add(textareaTarget, { left : 260, top: 40 });

      // Serialize content to text, items are left in the list
      textareaTarget.addListener("drop", function(e)
      {
        this.debug("Related of drop: " + e.getRelatedTarget());

        this.setValue(e.getData("value").replace(/,/g, "\n"));
      });





      // ****************************************************************

      var labelBoth = new qx.ui.basic.Label("Reorderable");
      root.add(labelBoth, { left : 500, top: 20 });

      var both = new qx.ui.form.List;
      both.setDraggable(true);
      both.setDroppable(true);
      both.setSelectionMode("multi");
      root.add(both, { left : 500, top : 40 });

      for (var i=0; i<20; i++) {
        both.add(new qx.ui.form.ListItem("Item " + i, "icon/16/places/folder.png"));
      }


      // Create drag indicator
      var indicator = new qx.ui.core.Widget;
      indicator.setDecorator(new qx.ui.decoration.Single().set({
        top : [ 1, "solid", "#33508D" ]
      }));
      indicator.setHeight(0);
      indicator.setOpacity(0.5);
      indicator.setLayoutProperties({left: -1000, top: -1000});
      this.getRoot().add(indicator);


      // Just add a move action
      both.addListener("dragstart", function(e) {
        e.addAction("move");
      });

      both.addListener("dragend", function(e)
      {
        // Move indicator away
        indicator.setDomPosition(-1000, -1000);
      });

      both.addListener("drag", function(e)
      {
        var orig = e.getOriginalTarget();
        var origCoords = orig.getContainerLocation();

        indicator.setWidth(orig.getBounds().width);
        indicator.setDomPosition(origCoords.left, origCoords.top);
      });

      both.addListener("dragover", function(e)
      {
        // Stop when the dragging comes from outside
        if (e.getRelatedTarget()) {
          e.preventDefault();
        }
      });

      both.addListener("drop", function(e)
      {
        var sel = this.getSortedSelection();
        var orig = e.getOriginalTarget();

        for (var i=0, l=sel.length; i<l; i++)
        {
          this.addBefore(sel[i], orig);

          // recover selection as it get lost during child move
          this.addToSelection(sel[i]);
        }
      });
    }
  }
});
