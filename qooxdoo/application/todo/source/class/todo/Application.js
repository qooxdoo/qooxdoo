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
 * This is the main application class of your custom application "todo"
 */
qx.Class.define("todo.Application",
{
  extend : qx.application.Native,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      var store = new qx.data.store.Offline("qx-todo");
      // initialize the data
      var model = store.getModel();
      if (model == null) {
        model = qx.data.marshal.Json.createModel([{done: false, name: "My first ToDo"}], true);
        store.setModel(model);
      }

      this.__updateView(model);

      var self = this;
      // add button
      var addButton = document.getElementById("add");
      qx.bom.Event.addNativeListener(addButton, "click", function() {
        var name = prompt("Task name") || "";
        self.__add(model, name);
      });


      // clear button
      var clearButton = document.getElementById("clear");
      qx.bom.Event.addNativeListener(clearButton, "click", function() {
        self.__clear(model);
      });
    },


    __updateView : function(model) {
      var tasks = document.getElementById("tasks");
      tasks.innerHTML = "";

      var data = qx.util.Serializer.toNativeObject(model);
      var list = qx.bom.Template.get("task-list", {tasks: data});
      tasks.appendChild(list);

      for (var i=0; i < list.children.length; i++) {
        var checkbox = list.children[i].children[0];
        checkbox.$$model = model.getItem(i);
        qx.bom.Event.addNativeListener(checkbox, "change", this.__onChange);
      };
    },


    __clear : function(model) {
      for (var i = model.length -1; i >= 0; i--) {
        var task = model.getItem(i);
        if (task.getDone()) {
          model.remove(task);
        }
      }
      this.__updateView(model);
    },


    __add : function(model, name) {
      var task = qx.data.marshal.Json.createModel({done: false, name: name}, true);
      model.push(task);
      this.__updateView(model);
    },


    __onChange : function(e) {
      var el = e.target;
      el.$$model.setDone(el.checked);
    }
  }
});
