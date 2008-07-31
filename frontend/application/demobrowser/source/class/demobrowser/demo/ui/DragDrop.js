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


      // Create source list

      var labelSource = new qx.ui.basic.Label("Source");
      root.add(labelSource, { left : 20, top: 20 });

      var source = new qx.ui.form.List;
      source.setDragable(true);
      source.setSelectionMode("multi");
      source.setDragSelection(false);

      source.addListener("dragstart", function(e)
      {
        e.addData("value", this.getValue());
        e.addData("items", this.getSelection());
        e.addAction("copy");
      });

      for (var i=0; i<20; i++) {
        source.add(new qx.ui.form.ListItem("Item " + i));
      }
      root.add(source, { left : 20, top : 40 });



      // Create simple target

      var labelSimple = new qx.ui.basic.Label("Simple Target");
      root.add(labelSimple, { left : 150, top: 20 });

      var targetSimple = new qx.ui.form.List;
      targetSimple.setDropable(true);
      targetSimple.setSelectionMode("multi");
      root.add(targetSimple, { left : 150, top: 40 });

      targetSimple.addListener("dragdrop", function(e)
      {
        var items = e.getData("items");
        for (var i=0, l=items.length; i<l; i++) {
          this.add(items[i]);
        }
      });



      // Create blocked target
      // Block types using a preventDefault on dragover

      var labelBlocked = new qx.ui.basic.Label("Blocked Target");
      root.add(labelBlocked, { left : 280, top: 20 });

      var targetIgnore = new qx.ui.form.List;
      targetIgnore.setDropable(true);
      targetIgnore.setSelectionMode("multi");
      root.add(targetIgnore, { left : 280, top: 40 });

      targetIgnore.addListener("dragover", function(e)
      {
        if (!e.supportsType("sometype")) {
          e.preventDefault();
        }
      });

      targetIgnore.addListener("dragdrop", function(e)
      {
        var items = e.getData("items");
        for (var i=0, l=items.length; i<l; i++) {
          this.add(items[i]);
        }
      });




      // Text Field uses value

      var labelSimple = new qx.ui.basic.Label("TextArea Target");
      root.add(labelSimple, { left : 410, top: 20 });

      var textareaTarget = new qx.ui.form.TextArea;
      textareaTarget.setDropable(true);
      textareaTarget.setHeight(100);
      root.add(textareaTarget, { left : 410, top: 40 });

      textareaTarget.addListener("dragdrop", function(e) {
        this.setValue(e.getData("value").replace(/,/g, "\n"));
      });

    }
  }
});
