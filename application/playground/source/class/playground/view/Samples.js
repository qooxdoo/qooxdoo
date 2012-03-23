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

    // list
    this.add(this._createList(), {flex: 1});

    // toolbar
    this.add(this._createToolbar());

    // make sure we are on a white background
    this.setBackgroundColor("white");
  },


  events : {
    /** Change event which signals the change of an example.*/
    "selectSample" : "qx.event.type.Data",

    /** Event triggered by the save button. */
    "save" : "qx.event.type.Event",

    /** Event triggered by the save as button. */
    "saveAs" : "qx.event.type.Event",

    /** Event triggered by the delete button. */
    "delete" : "qx.event.type.Event",

    /** Event triggered by the rename button. */
    "rename" : "qx.event.type.Event",

    /** Cancelable event fired before the selection changes. */
    "beforeSelectSample" : "qx.event.type.Event"
  },


  properties : {
    /** Model property which contains the data for showing the examples. */
    model : {
      check : "qx.data.IListData",
      event : "changeModel",
      apply : "_applyModel"
    },

    /** Storage for the application mode. */
    mode : {
      check : "String",
      apply : "_applyMode",
      init : ""
    },

    /** Storage for the current selected sample, if any. */
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


    /**
     * Selects the given example. If non is given, the selection will be
     * removed.
     * @param sample {qx.core.Obejct} The sample to select.
     */
    select : function(sample) {
      this.__list.getSelection().setItem(0, sample);
    },


    /**
     * Selects a sample by the given code.
     * @param code {String} The code which the sample contains.
     */
    selectByCode : function(code) {
      var model = this.__list.getModel();
      for (var i=0; i < model.length; i++) {
        if (model.getItem(i).getCode() == code) {
          this.select(model.getItem(i));
          return;
        }
      };
    },


    /**
     * Creating helper which is responsible for creating the list.
     */
    _createList : function() {
      // create and configure the list
      this.__list = new qx.ui.list.List();
      this.__list.setAppearance("sample-list");
      this.__list.setLabelPath("name");

      // CARFULL: HACK TO GET THE SELECTION PREVENTED
      this.__list._manager.detatchMouseEvents();
      // store the old hous handler
      var oldHandler = this.__list._manager.handleMouseDown;
      var self = this;
      // attach a new handler function
      this.__list._manager.handleMouseDown = function(e) {
        // fire the cancleable event
        var changeOk = self.fireEvent("beforeSelectSample", qx.event.type.Event, [false, true]);
        if (changeOk) {
          // if not canceled, execute the original handler
          oldHandler.call(self.__list._manager, e);
        }
      };
      this.__list._manager.attachMouseEvents();
      // ////////////////////////////////////////////

      // set the delegate
      this.__list.setDelegate({
        // filder: only show samples for the current mode
        filter : function(data) {
          return data.getMode() == self.getMode();
        },
        // group the samples by category
        group : function(data) {
          if (data.getCategory() == "static") {
            return qx.locale.Manager.tr("Static");
          } else {
            return qx.locale.Manager.tr("User");
          }
        }
      });

      // selection change handler
      this.__list.getSelection().addListener("change", function() {
        var sample = this.__list.getSelection().getItem(0);
        if (sample) {
          this.fireDataEvent("selectSample", sample);
        }
      }, this);

      return this.__list;
    },


    /**
     * Helper for creating the toolbar.
     */
    _createToolbar : function() {
      // crate and initialize the toolbar
      var toolbar = new qx.ui.toolbar.ToolBar();
      toolbar.setDecorator("separator-vertical");
      toolbar.setBackgroundColor("white");

      // save button
      var saveButton = new qx.ui.toolbar.Button(
        null, "icon/16/actions/document-save.png"
      );
      toolbar.add(saveButton);
      saveButton.setToolTipText(this.tr("Save"));
      saveButton.addListener("execute", function() {
        this.fireEvent("save");
      }, this);

      // save as button
      var saveAsButton = new qx.ui.toolbar.Button(
        null, "icon/16/actions/document-save-as.png"
      );
      toolbar.add(saveAsButton);
      saveAsButton.setToolTipText(this.tr("Save As"));
      saveAsButton.addListener("execute", function() {
        this.fireEvent("saveAs");
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
        null, "icon/16/actions/format-text-direction-ltr.png"
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
      // refresh is needed because the filter has changed
      this.__list.refresh();
    }
  }
});