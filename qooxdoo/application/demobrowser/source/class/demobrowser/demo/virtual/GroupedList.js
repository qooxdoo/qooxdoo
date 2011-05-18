/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/categories/system.png)
#asset(qx/icon/${qx.icontheme}/16/categories/office.png)
#asset(qx/icon/${qx.icontheme}/16/emotes/face-laugh.png)

************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.virtual.GroupedList",
{
  extend : qx.application.Standalone,

  members :
  {
    __list : null,

    __listGroupedByName : null,

    __listGroupedByGroup : null,

    main: function()
    {
      this.base(arguments);

      var firstExample = this.createFirstExample();
      var secondExample = this.createSecondExample();
      var thirdExample = this.createThirdExample();

      this.loadData();

      /* ***********************************************
       * Layout and description
       * ********************************************* */
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      this.getRoot().add(container, {edge : 20});

      var description = new qx.ui.basic.Label();
      description.setRich(true);
      description.setWidth(470);
      description.setSelectable(true);
      description.setValue(
        "<b>Grouped List</b><br/>"
        + "Loads the json file <a href='json/persons.json' target='_blank'>"
        + "persons.json</a> and binds the created model to all list widgets. "
        + "The first list shows only the row data and uses a converter for the "
        + "label that concatenates the first and last name. "
        + "The second list sorts the items by last name and groups the items "
        + "by the first letter of the last name. The third list sorts the items "
        + "by first name and groups it by the 'group' model property. The "
        + "third list is configured  to use a customized group item for rendering."
      );
      container.add(description);

      var listContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
      container.add(listContainer, {flex: 1});

      listContainer.add(firstExample);
      listContainer.add(secondExample);
      listContainer.add(thirdExample);
    },

    loadData : function()
    {
      var url = "json/persons.json";
      var store = new qx.data.store.Json(url);
      store.bind("model.persons", this.__list, "model");
      store.bind("model.persons", this.__listGroupedByName, "model");
      store.bind("model.persons", this.__listGroupedByGroup, "model");
    },

    createFirstExample : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

      var title = new qx.ui.basic.Label("Raw List:").set({
        font: "bold"
      });
      container.add(title);

      // Creates the list and configure it
      var list = this.__list = new qx.ui.list.List().set({
        height: 280,
        width: 150,
        labelPath: "firstname",
        labelOptions: {converter: function(data, model) {
          return model ? data + " " + model.getLastname() : "no model...";
        }}
      });
      container.add(list, {top: 20});

      return container;
    },

    createSecondExample : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

      var title = new qx.ui.basic.Label("Grouped by last name:").set({
        font: "bold"
      });
      container.add(title);

      // Creates the list and configure it
      var list = this.__listGroupedByName = new qx.ui.list.List().set({
        height: 280,
        width: 150,
        labelPath: "firstname",
        labelOptions: {converter: function(data, model) {
          return model ? model.getLastname() + ", " + data : "no model...";
        }}
      });
      container.add(list, {top: 20});

      // Creates the delegate for sorting and grouping
      var delegate = {
        // Sorts the model data by last name
        sorter : function(a, b)
        {
          a = a.getLastname();
          b = b.getLastname();

          return a > b ? 1 : a < b ? -1 : 0;
        },

        // Assign the group name for each item (fist char form last name)
        group : function(model) {
          return model.getLastname().charAt(0).toUpperCase();
        }
      };
      list.setDelegate(delegate);

      // Share the selection with the fist list
      list.setSelection(this.__list.getSelection());

      return container;
    },

    createThirdExample : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

      var title = new qx.ui.basic.Label("Grouped by group:").set({
        font: "bold"
      });
      container.add(title);

      // Creates the list and configure it
      var list = this.__listGroupedByGroup = new qx.ui.list.List().set({
        height: 280,
        width: 150,
        labelPath: "firstname",
        labelOptions: {converter: function(data, model) {
          return model ? data + " " + model.getLastname() : "no model...";
        }}
      });
      container.add(list, {top: 20});

      // Creates the delegate for sorting and grouping
      var delegate = {
        // Sorts the model data by last name
        sorter : function(a, b)
        {
          a = a.getLastname();
          b = b.getLastname();

          return a > b ? 1 : a < b ? -1 : 0;
        },

        // Uses the defined group name form the model.
        // When the model doesn't define a group name,
        // The default group name from the list is used.
        group : function(model) {
          return model.getGroup ? model.getGroup() : null;
        },

        // Uses a own group item
        createGroupItem : function() {
          return new qx.ui.form.ListItem();
        },

        // Configures each item
        configureGroupItem : function(item) {
          item.setBackgroundColor("#005E00");
          item.setTextColor("white");
        },

        // Binds the group name to the label and
        // assign a icon dependent on the group name
        bindGroupItem : function(controller, item, id) {
          controller.bindProperty(null, "label", null, item, id);
          controller.bindProperty(null, "icon", {
            converter : function(data) {
              switch(data) {
                case "Friends":
                  return "icon/16/emotes/face-laugh.png";
                case "Colleagues":
                  return "icon/16/categories/office.png";
                default:
                  return "icon/16/categories/system.png";
              }
            }
          }, item, id);
        }
      };
      list.setDelegate(delegate);

      // Share the selection with the first list
      list.setSelection(this.__list.getSelection());

      return container;
    }
  },

  destruct : function()
  {
    this.__list.dispose();
    this.__listGroupedByName.dispose();
    this.__listGroupedByGroup.dispose();
    this.__list = this.__listGroupedByName = this.__listGroupedByGroup = null;
  }
});
