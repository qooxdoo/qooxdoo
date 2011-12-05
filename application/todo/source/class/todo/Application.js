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
        var checkbox = item.childNodes[1];
        qx.bom.Event.addNativeListener(checkbox, "change", self.__onChange);
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

      // clear button
      var clearButton = document.getElementById("clear");
      qx.bom.Event.addNativeListener(clearButton, "click", function() {
        self.__clear(model);
      });
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
     * Handler for changes of the checkbox.
     */
    __onChange : function(e) {
      var el = e.target;
      el.parentNode.$$model.setDone(el.checked);
    }
  }
});