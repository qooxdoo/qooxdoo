qx.Class.define("selectbox.Issue9569Application", {
  extend: qx.application.Standalone,
  
  members: {
    main: function() {
      this.base(arguments);

      if (qx.core.Environment.get("qx.debug")) {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      // Document is the application root
      var doc = this.getRoot();
      
      
      /**
       * The test of Tree is because of a previously fixed bug [1], the fix for which had to be changed as
       * part of fixing the bug in [2].
       * 
       * The UI test you need to perform is to select an item in the tree and use the keyboard to navigate up
       * and down the tree without any issues.
       * 
       * Once the tree works you need to switch between the items of the drop down and confirm that the
       * console reports that the selection of the model selection and the controller.selection are correctly
       * changed, ie that when the "-" option is selected the selection of both is correctly reported as
       * an empty array.
       *  
       * 
       * [1] https://github.com/qooxdoo/qooxdoo/issues/3852 (Keyboard navigation broken when using the model property (BZ#3748))
       * [2] https://github.com/qooxdoo/qooxdoo/issues/9569 (new `null` value feature in list controller does not work with modelSelection)
       */

      var tree = new qx.ui.tree.Tree().set({
        width : 200,
        height : 400
      });
      this.getRoot().add(tree);

      var root = new qx.ui.tree.TreeFolder("root");
      root.setOpen(true);
      tree.setRoot(root);

      var te1_2 = new qx.ui.tree.TreeFolder("Workspace");
      te1_2.setOpen(true);
      root.add(te1_2);

      var te1_2_1 = new qx.ui.tree.TreeFile("Windows (C:)");

      // Funny behaviour:
      te1_2_1.setModel('My model...');

      var te1_2_2 = new qx.ui.tree.TreeFile("Documents (D:)");
      te1_2.add(te1_2_1, te1_2_2);



      // Create a button
      var model = new qx.data.Array();
      model.push(qx.data.marshal.Json.createModel({name: 'Test 1', id: 1}));
      model.push(qx.data.marshal.Json.createModel({name: 'Test 2', id: 2}));
      var box = new qx.ui.form.SelectBox();
      box.getChildControl("list").setQuickSelection(false);
      var controller = new qx.data.controller.List(model, box, "name");
      controller.set({
        allowNull: true,
        nullValueTitle: '-'
      });

      // Add button to document at fixed coordinates
      doc.add(box,
        {
          left : 300,
          top  : 50
        });

      function descItem(item) {
        if (item === null)
          return "(null)";
        if (typeof item.getName === "function")
          return item.getName();
        return item + "";
      }
      
      // Add an event listener
      box.getModelSelection().addListener("change", function(e) {
        let data = e.getData();
        if (data.removed)
          console.log("model selection changed, removed [" + data.removed.map(descItem).join(", ") + "]");
        if (data.added)
          console.log("model selection changed, added [" + data.added.map(descItem).join(", ") + "]");
      });

      // Add an event listener
      controller.getSelection().addListener("change", function(e) {
        let data = e.getData();
        if (data.removed)
          console.log("controller.selection changed, removed [" + data.removed.map(descItem).join(", ") + "]");
        if (data.added)
          console.log("controller.selection changed, added [" + data.added.map(descItem).join(", ") + "]");
      });
    }
  }
});
