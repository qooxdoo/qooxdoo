/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

/**
 * @tag showcase
 *
 * @asset(qx/icon/${qx.icontheme}/16/places/folder.png)
 */
qx.Class.define("demobrowser.demo.ui.DragDrop",
{
  extend : qx.application.Standalone,

  members :
  {
    __list : null,
    __currentListItem : null,

    main: function()
    {
      this.base(arguments);

      var root = this.getRoot();


      // ****************************************************************


      var scroller = new qx.ui.container.Scroll();

      var box = new qx.ui.layout.Basic();
      var container = new qx.ui.container.Composite(box).set({
        allowStretchY : false,
        allowStretchX : false
      });

      scroller.add(container);
      root.add(scroller, {edge : 0});

      // Create source list

      var labelSource = new qx.ui.basic.Label("Source");
      container.add(labelSource, { left : 20, top: 20 });

      var source = new qx.ui.form.List();
      source.setDraggable(true);
      source.setSelectionMode("multi");
      container.add(source, { left : 20, top : 40 });

      for (var i=0; i<20; i++) {
        source.add(new qx.ui.form.ListItem("Item " + i, "icon/16/places/folder.png"));
      }

      var check = new qx.ui.form.CheckBox("Enable drag");
      check.setValue(true);
      container.add(check, { left : 20, top : 260 });

      source.addListener("dragstart", function(e)
      {
        // dragstart is cancelable, you can put any runtime checks
        // here to dynamically disallow the drag feature on a widget
        if (!check.isValue()) {
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
        var selection = this.getSelection();
        var dragTarget = e.getDragTarget();
        if (selection.length === 0) {
          selection.push(dragTarget);
        } else if (selection.indexOf(dragTarget) == -1) {
          selection = [dragTarget];
        }

        switch(type)
        {
          case "items":
            result = selection;

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
            result = selection[0].getLabel();
            break;
        }

        // Remove selected items on move
        if (action == "move")
        {
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
      container.add(labelSimple, { left : 140, top: 20 });

      var targetSimple = new qx.ui.form.List();
      targetSimple.setDroppable(true);
      targetSimple.setSelectionMode("multi");
      container.add(targetSimple, { left : 140, top: 40 });

      targetSimple.addListener("drop", function(e)
      {
        this.debug("Related of drop: " + e.getRelatedTarget());

        // Move items from source to target
        var items = e.getData("items");
        for (var i=0, l=items.length; i<l; i++) {
          this.add(items[i]);
        }
      });

      targetSimple.addListener("dragover", function(e)
      {
        if (!e.supportsType("items")) {
          e.preventDefault();
        }
      });



      // ****************************************************************


      // Create target for copies of even elements

      var labelEven = new qx.ui.basic.Label("Copy Even Items");
      container.add(labelEven, { left : 260, top: 20 });

      var targetEven = new qx.ui.form.List();
      targetEven.setDroppable(true);
      container.add(targetEven, { left : 260, top: 40 });

      targetEven.addListener("drop", function(e)
      {
        this.debug("Related of drop: " + e.getRelatedTarget());

        // Move items from source to target
        var items = e.getData("items");
        for (var i=0, l=items.length; i<l; i++) {
          this.add(items[i]);
        }
      });

      targetEven.addListener("dragover", function(e)
      {
        if (!e.supportsType("items")) {
          e.preventDefault();
        }
        // accept only even items
        var item = e.getRelatedTarget().getSelection()[0] || e.getDragTarget();
        if (item.getLabel().substr(5) % 2 == 1) {
          e.preventDefault();
        }
      });

      targetEven.addListener("dragchange", function(e) {
        // only accept the copy action
        if (e.getCurrentAction() != "copy") {
          e.preventDefault();
        }
      });


      // ****************************************************************




      // Text Field uses value
      labelSimple = new qx.ui.basic.Label("TextArea Target");
      container.add(labelSimple, { left : 380, top: 20 });

      var textareaTarget = new qx.ui.form.TextArea();
      textareaTarget.setDroppable(true);
      textareaTarget.setHeight(100);
      container.add(textareaTarget, { left : 380, top: 40 });

      // Serialize content to text, items are left in the list
      textareaTarget.addListener("drop", function(e)
      {
        this.debug("Related of drop: " + e.getRelatedTarget());

        this.setValue(e.getData("value").replace(/,/g, "\n"));
      });

      textareaTarget.addListener("dragover", function(e)
      {
        if (!e.supportsType("value")) {
          e.preventDefault();
        }
      });



      // ****************************************************************

      var labelBoth = new qx.ui.basic.Label("Reorderable");
      container.add(labelBoth, { left : 600, top: 20 });

      var both = this.__list = new qx.ui.form.List();
      both.setDraggable(true);
      both.setDroppable(true);
      both.setSelectionMode("multi");
      container.add(both, { left : 600, top : 40 });

      for (var i=0; i<20; i++) {
        both.add(new qx.ui.form.ListItem("Item " + i, "icon/16/places/folder.png"));
      }


      // Create drag indicator
      var indicator = new qx.ui.core.Widget();
      indicator.setDecorator(new qx.ui.decoration.Decorator().set({
        widthTop: 1,
        styleTop: "solid",
        colorTop: "black"
      }));
      indicator.setHeight(0);
      indicator.setOpacity(0.5);
      indicator.setZIndex(100);
      indicator.setLayoutProperties({left: -1000, top: -1000});
      indicator.setDroppable(true);
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

        // store the current listitem - if the user drops on the indicator
        // we can use this item instead of calculating the position of the
        // indicator
        if (orig instanceof qx.ui.form.ListItem) {
          qx.core.Init.getApplication().__currentListItem = orig;
        }

        if (!qx.ui.core.Widget.contains(this, orig) && orig != indicator) {
          return;
        }

        var origCoords = orig.getContentLocation();

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

      both.addListener("drop", function(e) {
        this.__reorderList(e.getOriginalTarget(), e.getDragTarget());
      }, this);

      indicator.addListener("drop", function(e) {
        this.__reorderList(this.__currentListItem);
      }, this);
    },


    __reorderList : function(listItem, reorderItem)
    {

      // Only continue if the target is a list item.
      if (listItem.classname != "qx.ui.form.ListItem") {
        return ;
      }

      var sel = this.__list.getSortedSelection();
      if (sel.length === 0) {
        sel = [reorderItem];
      } else if (sel.indexOf(reorderItem) == -1) {
        sel = [reorderItem];
      }

      for (var i = 0, l = sel.length; i < l; i++) {
        this.__list.addBefore(sel[i], listItem);
      }
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeObjects("__list");
  }
});
