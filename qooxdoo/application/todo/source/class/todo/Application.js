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

      var model;
      if (qx.core.Environment.get("html.storage.local")) {
        var store = new qx.data.store.Offline("qx-todo");
        // initialize the data
        model = store.getModel();
      }

      if (model == null) {
        model = qx.data.marshal.Json.createModel([{done: false, name: "My first ToDo"}], true);
        store && store.setModel(model);
      }

      var self = this;

      // data binding
      var target = document.getElementById("tasks");
      var controller = new qx.data.controller.website.List(model, target, "task");
      controller.setDelegate({configureItem : function(item) {
        var checkbox = item.children[0];
        qx.bom.Event.addNativeListener(checkbox, "change", self.__onChange);
      }});

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


    __clear : function(model) {
      model.forEach(function(item) {
        if (item.getDone()) {
          model.remove(item);
        }
      });
    },


    __add : function(model, name) {
      var task = qx.data.marshal.Json.createModel(
        {done: false, name: name}
      , true);
      model.push(task);
    },


    __onChange : function(e) {
      var el = e.target;
      el.parentNode.$$model.setDone(el.checked);
    }
  }
});
