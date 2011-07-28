/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#asset(playground/*)
#ignore(require)
#ignore(ace)

************************************************************************ */

/**
 * Container for the examples.
 */
qx.Class.define("playground.view.Samples",
{
  extend : qx.ui.container.Composite,


  construct : function()
  {
    this.base(arguments);

    // layout stuff
    var layout = new qx.ui.layout.VBox();
    this.setLayout(layout);
    this.setDecorator("main");

    // caption
    var caption = new qx.ui.basic.Label(this.tr("Samples")).set({
      font       : "bold",
      padding    : 5,
      allowGrowX : true,
      allowGrowY : true
    });
    this.add(caption);

    this.add(this._createList(), {flex: 1});
    if (qx.core.Environment.get("html.storage.local")) {
      this.add(this._createToolbar());
    }
  },


  events : {

    "selectSample" : "qx.event.type.Data",

    "save" : "qx.event.type.Event",

    "delete" : "qx.event.type.Event",

    "rename" : "qx.event.type.Event",
    
    "beforeSelectSample" : "qx.event.type.Event"
  },


  properties : {
    model : {
      event : "changeModel",
      apply : "_applyModel"
    },

    mode : {
      check : "String",
      apply : "_applyMode",
      init : ""
    },

    currentSample : {
      apply : "_applyCurrentSample",
      nullable : true
    }
  },


  members :
  {
    __list : null,
    __deleteButton : null,
    __renameButton : null,


    select : function(sample) {
      this.__list.getSelection().setItem(0, sample);
    },


    selectByCode : function(code) {
      var model = this.__list.getModel();
      for (var i=0; i < model.length; i++) {
        if (model.getItem(i).getCode() == code) {
          this.select(model.getItem(i));
          return;
        }
      };
    },


    _createList : function() {
      this.__list = new qx.ui.list.List();
      this.__list.setDecorator("separator-vertical");
      this.__list.setLabelPath("name");

      this.__list._manager.detatchMouseEvents();

      var oldHandler = this.__list._manager.handleMouseDown;
      var self = this;
      this.__list._manager.handleMouseDown = function(e) {
        var changeOk = self.fireEvent("beforeSelectSample", qx.event.type.Event, [false, true]);
        if (changeOk) {
          oldHandler.call(self.__list._manager, e);
        }
      };
      this.__list._manager.attachMouseEvents();

      this.__list.setDelegate({
        filter : function(data) {
          return data.getMode() == self.getMode();
        },
        group : function(data) {
          if (data.getCategory() == "static") {
            return qx.locale.Manager.tr("Static");
          } else {
            return qx.locale.Manager.tr("User");
          }
        }
      });

      this.__list.getSelection().addListener("change", function() {
        var sample = this.__list.getSelection().getItem(0);
        if (sample) {
          this.fireDataEvent("selectSample", sample);
        }
      }, this);

      return this.__list;
    },


    _createToolbar : function() {
      // toolbar
      var toolbar = new qx.ui.toolbar.ToolBar();
      toolbar.setDecorator("separator-vertical");

      // save button
      var saveButton = new qx.ui.toolbar.Button(
        null, "icon/16/devices/drive-harddisk.png"
      );
      toolbar.add(saveButton);
      saveButton.setToolTipText(this.tr("Save"));
      saveButton.addListener("execute", function() {
        this.fireEvent("save");
      }, this);

      // delete button
      this.__deleteButton = new qx.ui.toolbar.Button(
        null, "icon/16/places/user-trash.png"
      );
      toolbar.add(this.__deleteButton);
      this.__deleteButton.setToolTipText(this.tr("Delete"));
      this.__deleteButton.addListener("execute", function() {
        this.fireEvent("delete");
      }, this);

      // rename button
      this.__renameButton = new qx.ui.toolbar.Button(
        null, "icon/16/actions/insert-text.png"
      );
      toolbar.add(this.__renameButton);
      this.__renameButton.setToolTipText(this.tr("Rename"));
      this.__renameButton.addListener("execute", function() {
        this.fireEvent("rename");
      }, this);

      return toolbar;
    },


    // property apply
    _applyCurrentSample : function(value) {
      this.select(value);
      // only change the state of the buttons of they are available
      if (this.__deleteButton && this.__renameButton) {
        if (value && value.getCategory() != "static") {
          this.__deleteButton.setEnabled(true);
          this.__renameButton.setEnabled(true);
        } else {
          this.__deleteButton.setEnabled(false);
          this.__renameButton.setEnabled(false);
        }
      }
    },


    // property apply
    _applyModel : function(value) {
      if (value) {
        this.__list.setModel(value);
      }
    },


    // property apply
    _applyMode : function(value) {
      this.__list.refresh();
    }
  }
});