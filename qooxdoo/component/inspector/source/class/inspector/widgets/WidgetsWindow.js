/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/Tango/22/actions/view-refresh.png)
#asset(qx/icon/Tango/22/actions/document-properties.png)
************************************************************************ */

/**
 * This class represents the widget finder window.
 *
 * The widget finder offers a insight into the hierarchical structure
 * of the current document. Therefore a tree shows all widgets added to
 * the document, which is the root element in a qooxdoo GUI.
 */
qx.Class.define("inspector.widgets.WidgetsWindow", {

  extend : inspector.components.AbstractWindow,


  construct : function() {
    // call the constructor of the superclass
    this.base(arguments, "Widgets");

    // create and add the reload button
    this._reloadButton = new qx.ui.toolbar.Button(null,
        "icon/22/actions/view-refresh.png");
    this._reloadButton.setToolTipText("Reload the window.");
    this._toolbar.add(this._reloadButton);
    // add the event listener for the reload
    this._reloadButton.addListener("click", function() {
      this.load();
    }, this);

    this._toolbar.addSpacer();

    // create and add the widget structure toggle button
    this._structureToggle = new qx.ui.toolbar.CheckBox(null,
        "icon/22/actions/document-properties.png");
    this._structureToggle.setToolTipText("Display internal widget structure.");
    this._toolbar.add(this._structureToggle);
    this._structureToggle.setValue(false);

    // initialize tree
    this._tree = new qx.ui.tree.Tree();
    this._tree.setDecorator(null);
    this._tree.setRootOpenClose(true);
    this.add(this._tree, {flex: 1});

    this._tree.addListener("changeSelection", function(e) {
      if (e.getData()[0]) {
        var widget = e.getData()[0].getUserData("instance");
        qx.core.Init.getApplication().select(widget, this);
      }
    }, this);


  },


  members : {

    setInitSizeAndPosition: function() {
      var left = qx.bom.Viewport.getWidth() - this.getWidth();
      var height = parseInt((qx.bom.Viewport.getHeight() - 30) / 3);
      this.moveTo(left, 30 + height);
      this.setHeight(height);
    },


    select: function(widget) {
      this._selectWidgetInTheTree(widget);
    },


    getSelection: function() {
      // get the selected element
      var selectedElement = this._tree.getSelection()[0];
      // return the id if an element is selected
      if (selectedElement != null) {
        return selectedElement.getUserData("instance");
      }
      // return null otherwise
      return null;
    },



    load: function(win) {
      if (win == undefined) {
        this._iFrameWindow = qx.core.Init.getApplication().getIframeWindowObject();
      } else {
        this._iFrameWindow = win;
      }

      var remoteAppRoot = this._iFrameWindow.qx.core.Init.getApplication().getRoot();
      // create a new root folder
      var rootFolder = new qx.ui.tree.TreeFolder(
        remoteAppRoot.classname + " [" + remoteAppRoot.toHashCode() + "]"
      );
      // store the root application with the folder
      rootFolder.setUserData("instance", remoteAppRoot);
      this._tree.setRoot(rootFolder);

      // refill the tree
      this._fillTree(remoteAppRoot, rootFolder, 2);
    },




    _fillTree: function(parentWidget, parentTreeFolder, recursive)  {
      // get the current items of the tree folder
      var items = parentTreeFolder.getItems(false, true);

      var kids = this._structureToggle.isValue() ? "_getChildren" : "getChildren";

      // ignore all objects without children (spacer e.g.)
      if (parentWidget[kids] == undefined) {
        if (kids === "getChildren") {
          kids = "_getChildren";

          if (parentWidget[kids] == undefined) {
            return;
          }
        } else {
          return;
        }
      }

      // if parent widget contains no more widgets
      if (parentWidget[kids]().length == 0) {
        if (items.length > 1) {
          for (var m = 0; m < items.length; m++) {
            // check if the selection is on a folder which should be deleted
            if (items[m + 1] == this._tree.getSelection()[0]) {
              this._tree.resetSelection();
            }
            // remove all child folders
            parentTreeFolder.removeAt(0);
          }
        }
      }

      // get all components of the inspector application
      var components = qx.core.Init.getApplication().getExcludes();
      // separate index necessary because the components of the inspector are omitted in the tree view
      var i = 0;
      // reduce the recursive calls
      recursive--;

      // visit all children
      for (var k = 0; k < parentWidget[kids]().length; k++) {

        // get the current child
        var childWidget = parentWidget[kids]()[k];

        // check if the childwidget is a component of this application
        var cont = false;
        for (var j = 0; j < components.length; j++) {
          if (childWidget == components[j]) {
            cont = true;
            break;
          }
        }
        // if the child widget is a widget of the application, ignore it
        if (cont) {
            continue;
        }

        // if no folder exists at this spot of the tree
        if (items[i] == null) {

          // create a new folder
          var childTreeFolder = new qx.ui.tree.TreeFolder(childWidget.classname + " [" + childWidget.toHashCode() + "]");
          childTreeFolder.setIcon(this._getIconPath(childWidget.classname));
          // add the folder to the tree
          parentTreeFolder.addAt(childTreeFolder, i);

          // append the widget instance to the tree folder
          childTreeFolder.setUserData('instance', childWidget);
          // append the id of the widget to the tree folder
          childTreeFolder.setUserData('id', childWidget.toHashCode());

          // add the highlight listener to the tree elements
          childTreeFolder.addListener("changeOpen", this._treeOpenHandler, this);

        } else {
          // if the folder is the same
          if (items[i].getLabel() == childWidget.classname + " [" + childWidget.toHashCode() + "]") {
            // keep it
            var childTreeFolder = items[i];
          } else {

            // check if the selection is on a folder which should be deleted
            if (parentTreeFolder.getItems()[i] != null) {
              if (parentTreeFolder.getItems()[i] == this._tree.getSelection()[0]) {
                this._tree.resetSelection();
              }
            }

            // remove it
            parentTreeFolder.removeAt(i);

            // create a new folder
            var childTreeFolder = new qx.ui.tree.TreeFolder(childWidget.classname + " [" + childWidget.toHashCode() + "]");
            // add the folder to the tree at the former position
            parentTreeFolder.addAt(childTreeFolder, i);

            // append the widget instance to the tree folder
            childTreeFolder.setUserData('instance', childWidget);
            // append the id of the widget to the tree folder
            childTreeFolder.setUserData('id', childWidget.toHashCode());

            // add the listeners to the tree elements
            childTreeFolder.addListener("changeOpen", this._treeOpenHandler, this);
          }
        }
        // if the recursive flag is set
        if (recursive > 0) {
          // visit the children of the current child
          this._fillTree(childWidget, childTreeFolder, recursive);
        }
        // if the last child of the folder has been created
        if (i + 1 == parentWidget[kids]().length) {
          // get the new child folders of the current parent
          var newItems = parentTreeFolder.getItems(false, true);
          // if there are more folders than should be
          if (newItems.length - 2 != i) {
            // go threw all dispensable folders an delete them
            for (var l = i + 1; l < newItems.length; l++) {
              parentTreeFolder.removeAt(i + 1);
            }
          }
        }
        // count up the separate index
        i++;
      }
    },



    _treeOpenHandler: function(e) {
      // if the folder is open
      if (e.getData()) {
        // get the selected widget
        var selectedWidget = e.getTarget().getUserData('instance');
        // load the following two hierarchy layers of the tree
        this._fillTree(selectedWidget, e.getTarget(), 2);
      }
    },



    _getIconPath: function (element) {
      switch (element) {
        case "qx.ui.basic.Image":
          return "inspector/images/components/image.png";

        case "qx.ui.basic.Label":
          return "inspector/images/components/label.png";

        case "qx.ui.basic.Atom":
          return "inspector/images/components/atom.png";

        case "qx.ui.tree.Tree":
        case "qx.ui.treevirtual.TreeVirtual":
          return "inspector/images/components/tree.png";

        case "qx.ui.menu.Menu":
          return "inspector/images/components/menu.png";

        case "qx.ui.form.Button":
        case "qx.ui.menu.Button":
        case "qx.ui.menubar.Button":
        case "qx.ui.pageview.buttonview.Button":
        case "qx.ui.pageview.radioview.Button":
        case "qx.ui.pageview.tabview.Button":
        case "qx.ui.toolbar.Button":
          return "inspector/images/components/button.png";

        case "qx.ui.layout.CanvasLayout":
        case "qx.ui.layout.DockLayout":
        case "qx.ui.layout.FlowLayout":
        case "qx.ui.layout.GridLayout":
        case "qx.ui.menu.Layout":
          return "inspector/images/components/layout.png";

        case "qx.ui.layout.VBox":
          return "inspector/images/components/verticallayout.png";

        case "qx.ui.layout.HBox":
          return "inspector/images/components/horizontallayout.png";

        case "qx.ui.toolbar.ToolBar":
        case "qx.ui.menubar.MenuBar":
          return "inspector/images/components/toolbar.png";

        case "qx.ui.window.Window":
          return "inspector/images/components/window.png";

        case "qx.ui.groupbox.Groupbox":
        case "qx.ui.groupbox.CheckGroupBox":
        case "qx.ui.groupbox.RadioGroupBox":
          return "inspector/images/components/groupbox.png";

        case "qx.ui.form.Spinner":
          return "inspector/images/components/spinner.png";

        case "qx.ui.form.ComboBox":
          return "inspector/images/components/combobox.png";

        case "qx.ui.form.TextField":
          return "inspector/images/components/textfield.png";

        case "qx.ui.form.TextArea":
          return "inspector/images/components/textarea.png";

        case "qx.ui.splitpane.SplitPane":
          return "inspector/images/components/splitpane.png";

        case "qx.ui.table.Table":
          return "inspector/images/components/table.png";

        case "qx.ui.form.CheckBox":
          return "inspector/images/components/checkbox.png";

        case "qx.ui.form.RadioButton":
          return "inspector/images/components/radiobutton.png";

        default:
          return null;
      }
    },



    _selectWidgetInTheTree: function (widget) {
      // get the current iframe window object
      this._iFrameWindow = qx.core.Init.getApplication().getIframeWindowObject();
      // check for null references
      if (!(widget instanceof this._iFrameWindow.qx.ui.core.Widget)) {
        return;
      }

      // create a array of parents
      var parents = [];
      // save the parents in that array
      var w = widget;
      if (this._structureToggle.isValue()) {
        // internal widget structure
        while(w.getLayoutParent() != null) {
          parents.push(w);
          w = w.getLayoutParent();
        }
      }
      else {
       // external widget structure
        while ( w.getParent != undefined && w.getParent() != null
                || w.getLayoutParent() != null ) {
          if (w.getParent != undefined && w.getParent() != null) {
            parents.push(w);
            w = w.getParent();
          }
          // use layout parent as a fallback if there is no external parent
          else if (w.getLayoutParent() != null) {
            parents.push(w);
            w = w.getLayoutParent();
          }

        }
      }
      // Go backwards threw all parents
      for (var i = parents.length - 1; i > 0; i--) {
        // open the folder of that parent
        this._openFolder(parents[i]);
      }

      this._tree.getRoot().setOpen(true);

      var id = widget.toHashCode();
      // get all items of the tree
      var items = this._tree.getItems(true, true);
      // flag that signals if the element has been found
      var elementFound = false;
      // check the root element of the tree
      if (this._tree.getRoot().getUserData("instance").toHashCode() == id) {
        // select the root of the tree
        this._tree.resetSelection();
        this._tree.addToSelection(this._tree.getRoot());
        return;
      }
      // for every element
      for (var i = 0; i < items.length; i++) {
        // if the element was found
        if (items[i].getUserData('id') == id) {
          // mark it as found
          elementFound = true;
          // select in in the tree
          this._tree.resetSelection();
          this._tree.addToSelection(items[i]);
          // stop searching for the element
          break;
        }
      }
      // if the element could not be found
      if (!elementFound) {
        // delete the selection in the tree
        this._tree.resetSelection();
      }
    },



    _openFolder: function(widget) {
      var id = widget.toHashCode();
      // get all items of the tree
      var items = this._tree.getItems(true, true);
      // check the root element of the tree
      if (this._tree.getRoot().getUserData("instance").toHashCode() == id) {
        // select the root of the tree
        this._tree.resetSelection();
        this._tree.addToSelection(this._tree.getRoot());
        // tell the inspector class that the widget has changed
        // TODO: the following line appears to be old 0.7 code
        // this._inspector.setWidget(qx.ui.core.ClientDocument.getInstance(), this);
        return;
      }
      // for every element
      for (var i = 0; i < items.length; i++) {
        // if the element was found
        if (items[i].getUserData('id') == id) {
          // select in in the tree
          items[i].setOpen(true);
          // stop searching for the element
          break;
        }
      }
    }

  },

  destruct : function()
  {
    this._iFrameWindow = null;
    this._disposeObjects("_reloadButton", "_structureToggle", "_tree");
  }
});
