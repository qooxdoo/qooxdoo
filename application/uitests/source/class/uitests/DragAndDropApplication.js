/* ************************************************************************

   Copyright:

   License:

   Authors:

 ************************************************************************ */

/**
 * This is the main application class of your custom application "dragndrop"
 *
 * @asset(qx/icon/Tango/16/actions/document-print.png)
 */
qx.Class.define("uitests.DragAndDropApplication", {
  extend: qx.application.Standalone,

  members: {
    main: function() {
      this.base(arguments);

      if (qx.core.Environment.get("qx.debug")) {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      uitests.TestRunner.runAll(qx.test.Promise, [ "testAsyncEventHandlers" ], function() {
        uitests.TestRunner.runAll(qx.test.event.Utils, this.__init, this);
      }, this);
    },

    __init: function() {
      var doc = this.getRoot();
      var tb = new qx.ui.toolbar.ToolBar();
      var btn = new qx.ui.toolbar.Button("Click Me", "qx/icon/Tango/16/actions/document-print.png");
      btn.addListener("execute", function() {
        var win = new qx.ui.window.Window("Test Window");
        win.open();
      }, this);
      tb.add(btn);
      doc.add(tb, { left: 10, top: 10, right: 10 });

      var root = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      doc.add(root, { left: 10, top: 100, right: 10, bottom: 10 });

      var compSource = new qx.ui.container.Composite(new qx.ui.layout.VBox(6));
      root.add(compSource);
      compSource.add(new qx.ui.basic.Label("Simple Source"));
      var lstSource = new qx.ui.form.List().set({ draggable: true, selectionMode: "multi" });
      compSource.add(lstSource);

      for (var i = 0; i < 20; i++)
        lstSource.add(new qx.ui.form.ListItem("Item " + i, "icon/16/places/folder.png"));

      var cbxCancelDragstart = new qx.ui.form.CheckBox("Cancel dragstart").set({ value: false });
      compSource.add(cbxCancelDragstart);

      var cbxRejectDragstart = new qx.ui.form.CheckBox("Reject dragstart").set({ value: false });
      compSource.add(cbxRejectDragstart);

      lstSource.addListener("dragstart", function(e) {
        this.debug("lstSource: dragstart");
        return new qx.Promise((resolve, reject) => {
          if (cbxCancelDragstart.getValue()) {
            e.preventDefault();
          }
          if (cbxRejectDragstart.getValue()) {
            reject();
            return;
          }

          if (!e.getDefaultPrevented()) {
            // Register supported types
            e.addType("value");
            e.addType("items");

            // Register supported actions
            e.addAction("copy");
            e.addAction("move");
          }

          resolve();
        });
      });

      lstSource.addListener("droprequest", function(e) {
        this.debug("lstSource: droprequest");
        return new qx.Promise((resolve, reject) => {
          this.debug("Related of droprequest: " + e.getRelatedTarget());

          var action = e.getCurrentAction();
          var type = e.getCurrentType();
          var result;
          var selection = this.getSelection();
          var dragTarget = e.getDragTarget();
          if (selection.length === 0) {
            selection.push(dragTarget);
          } else if (selection.indexOf(dragTarget) == -1) {
            selection = [ dragTarget ];
          }

          switch (type) {
          case "items":
            result = selection;

            if (action == "copy") {
              var copy = [];
              for (var i = 0, l = result.length; i < l; i++) {
                copy[i] = result[i].clone();
              }
              result = copy;
            }
            break;

          case "value":
            result = selection[0].getLabel();
            break;
          }

          // Remove selected items on move
          if (action == "move") {
            for (var i = 0, l = selection.length; i < l; i++) {
              this.remove(selection[i]);
            }
          }

          // Add data to manager
          e.addData(type, result);
          resolve();
        });
      });

      var compTarget = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      root.add(compTarget);
      compTarget.add(new qx.ui.basic.Label("Simple Target"));

      var lstTargetSimple = new qx.ui.form.List().set({ droppable: true, selectionMode: "multi" });
      compTarget.add(lstTargetSimple);

      lstTargetSimple.addListener("drop", function(e) {
        this.debug("lstTargetSimple: drop");
        return new qx.Promise((resolve, reject) => {
          this.debug("Related of drop: " + e.getRelatedTarget());

          // Move items from lstSource to target
          var items = e.getData("items");
          for (var i=0, l=items.length; i<l; i++) {
            this.add(items[i]);
          }
          resolve();
        });
      });

      lstTargetSimple.addListener("dragover", function(e) {
        this.debug("lstTargetSimple: dragover");
        return new qx.Promise((resolve, reject) => {
          if (!e.supportsType("items") || cbxCancelDragover.getValue()) {
            e.preventDefault();
          }
          resolve();
        });
      });

      var cbxCancelDragover = new qx.ui.form.CheckBox("Cancel dragover").set({ value: false });
      compSource.add(cbxCancelDragover);
    }
  }
});
