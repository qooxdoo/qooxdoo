/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This is a simple app for storing todos.
 */
qx.Class.define("todo.Application",
{
  extend : qx.application.Native,

  members :
  {
    __id : 0,


    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main : function() {
      // Call super class
      this.base(arguments);

      // create the store and the model
      var model;
      if (qx.core.Environment.get("html.storage.local")) {
        var store = new qx.data.store.Offline("qx-todo");
        // initialize the data
        model = store.getModel();
      }

      // initialize the model
      if (model == null) {
        model = qx.data.marshal.Json.createModel([{done: false, name: "My first ToDo"}], true);
        store && store.setModel(model);
      }

      var self = this;

      // data binding
      var target = document.getElementById("tasks");
      var controller = new qx.data.controller.website.List(model, target, "task");
      controller.setDelegate({configureItem : function(item) {
        // attach a change listener to the checkbox
        var checkbox;
        for (var i = 0; i < item.childNodes.length; i++) {
          if (item.childNodes[i].type == "checkbox") {
            checkbox = item.childNodes[i];
          }
        }
        qx.bom.Event.addNativeListener(
          checkbox, "change", qx.lang.Function.bind(self.__onChange, self, model)
        );
      }, createItem : function(data) {
        // add an automatic id for the label / checkbox connection
        data.id = "task-" + self.__id++;
        return qx.bom.Template.get("task", data);
      }});

      // add button
      var addButton = document.getElementById("add");
      qx.bom.Event.addNativeListener(addButton, "click", function() {
        var name = prompt("Task name", "") || "";
        self.__add(model, name);
      });

      // update the clear button on every model change
      model.addListener("changeBubble", function(e) {
        this.__updateClearButton(model);
      }, this);

      // update the clear button at start manually
      this.__updateClearButton(model);
    },


    /**
     * Clears all checked items from the list.
     * @param model {qx.core.Object} The model object holding the todo's.
     */
    __clear : function(model) {
      for (var i = model.length - 1; i >= 0; i--) {
        var item = model.getItem(i);
        if (item.getDone()) {
          model.remove(item);
        }
      }
    },


    /**
     * Adds a todo with the given name to the given model.
     * @param model {qx.core.Object} The model to add the todo.
     * @param name {String} The name of the todo.
     */
    __add : function(model, name) {
      var task = qx.data.marshal.Json.createModel(
        {done: false, name: name}
      , true);
      model.push(task);
    },


    /**
     * Helper to update the clear button which gets disabled if nothing
     * can be cleard.
     * @param model {qx.data.IListData} The model.
     */
    __updateClearButton : function(model) {
      var disabled = true;
      for (var i=0; i < model.length; i++) {
        if (model.getItem(i).getDone()) {
          disabled = false;
          break;
        }
      };
      this.__disableClearButton(disabled, model);
    },


    /**
     * Helper to disable the clear button. Removing the listener and changing
     * the CSS class.
     * @param disabled {Boolean} <code>true</code>, if the buttons shold be disabled
     * @param model {qx.data.IListData} The model object.
     */
    __disableClearButton : function(disabled, model) {
      var button = document.getElementById("clear");
      var self = this;
      if (disabled) {
        qx.bom.Event.removeNativeListener(button, "click", function() {
          self.__clear(model);
        });
        qx.bom.element.Class.replace(button, "button", "button-disabled");
      } else {
        qx.bom.Event.addNativeListener(button, "click", function() {
          self.__clear(model);
        });
        qx.bom.element.Class.replace(button, "button-disabled", "button");
      }
    },

    /**
     * Handler for changes of the checkbox.
     * @param model {qx.data.IListData} The model
     * @param e {Event} The change event.
     */
    __onChange : function(model, e) {
      var el = qx.bom.Event.getTarget(e);
      el.parentNode.$$model.setDone(el.checked);
    }
  }
});