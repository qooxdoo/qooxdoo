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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)
     * Martin Wittemann (martinwittemann)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/places/folder.png)
#asset(qx/icon/${qx.icontheme}/48/places/folder.png)

************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.virtual.List",
{
  extend : qx.application.Standalone,

  properties :
  {
    showMode :
    {
      init : "both",
      check : ["label", "icon", "both"],
      event : "changeShowMode"
    }
  },

  members :
  {
    __configList : null,

    __dragCheck : null,

    __quickCheck : null,

    main: function()
    {
      this.base(arguments);

      var container = this.getRoot();
      container.add(this.createConfigurableList(), {left: 20, top: 20});
      container.add(this.createOneSelectionList(), {left: 330, top: 20});
      container.add(this.createAdditiveSelectionList(), {left: 520, top: 20});
    },

    createConfigurableList : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

      var title = new qx.ui.basic.Label("Configurable").set({
        font: "bold"
      });
      container.add(title);

      // Creates model data
      var rawData = [];
      for (var i = 0; i < 2500; i++)
      {
        rawData[i] = {
          label: "Item No " + i,
          icon: (i % 4) ? "16" : "48"
        }
      }
      var model = qx.data.marshal.Json.createModel(rawData);

      // Creates the list and configures it
      var list = this.__configList = new qx.ui.list.List(model).set({
        scrollbarX: "on",
        selectionMode : "multi",
        height: 280,
        width: 150,
        labelPath: "label",
        iconPath: "icon",
        iconOptions: {converter : function(data) {
          return "icon/" + data + "/places/folder.png";
        }}
      });
      container.add(list, {top: 20});

      var that = this;
      var delegate = {
        // Binds the demo show mode property with each list item
        configureItem : function(item) {
          that.bind("showMode", item, "show");
        },

        // Uses the default binding and disabled each ninth list item
        bindItem : function(controller, item, id) {
          controller.bindDefaultProperties(item, id);
          controller.bindProperty("label", "enabled", {
            converter : function(data) {
              return parseInt(data.replace(/Item No /g, "")) % 9 != 0
            }
          }, item, id);
        }
      };

      // sets the delegate to the list
      list.setDelegate(delegate);

      // Pre-Select "Item No 20"
      list.getSelection().push(model.getItem(20));

      // log all changes on the selection
      list.getSelection().addListener("change", function(e) {
        var selection = list.getSelection();
        for (var i = 0; i < selection.getLength(); i++) {
          this.debug("Selection: " + selection.getItem(i).getLabel());
        }
      }, this);

      // Sets the list item size to all items.
      // This is needed, because we use images with different size.
      var rowConfig = list.getPane().getRowConfig();
      for (var i = 0; i < 2500; i++)
      {
        if (i % 4 == 0) {
          rowConfig.setItemSize(i, 56);
        } else {
          rowConfig.setItemSize(i, 25);
        }
      }

      /* ***********************************************
       * Configure Elements
       * ********************************************* */
      var single = new qx.ui.form.RadioButton("Single Selection");
      var multi = new qx.ui.form.RadioButton("Multi Selection");
      var additive = new qx.ui.form.RadioButton("Additive Selection");
      var one = new qx.ui.form.RadioButton("One Selection");

      single.setUserData("value", "single");
      multi.setUserData("value", "multi");
      additive.setUserData("value", "additive");
      one.setUserData("value", "one");

      container.add(single, {left: 160, top: 20});
      container.add(multi, {left: 160, top: 40});
      container.add(additive, {left: 160, top: 60});
      container.add(one, {left: 160, top: 80});

      var label = new qx.ui.form.RadioButton("Show Label");
      var icon = new qx.ui.form.RadioButton("Show Icon");
      var both = new qx.ui.form.RadioButton("Show Both");

      label.setUserData("value", "label");
      icon.setUserData("value", "icon");
      both.setUserData("value", "both");

      container.add(label, {left: 160, top: 120});
      container.add(icon, {left: 160, top: 140});
      container.add(both, {left: 160, top: 160});

      var dragCheck = this.__dragCheck = new qx.ui.form.CheckBox("Enable drag selection");
      var quickCheck = this.__quickCheck = new qx.ui.form.CheckBox("Enable quick selection").set({enabled : false});

      container.add(dragCheck, {left: 160, top: 200});
      container.add(quickCheck, {left: 160, top: 220});

      var selectionMode = new qx.ui.form.RadioGroup(single, multi, additive, one);
      selectionMode.setSelection([multi]);
      selectionMode.addListener("changeSelection", this.onSelectionModeChange, this);

      var showMode = new qx.ui.form.RadioGroup(label, icon, both);
      showMode.setSelection([both]);
      showMode.addListener("changeSelection", this.onShowModeChange, this);

      dragCheck.addListener("changeValue", this.onDragCheckChange, this);
      quickCheck.addListener("changeValue", this.onQuickCheckChange, this);

      return container;
    },

    createOneSelectionList : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

      var title = new qx.ui.basic.Label("One as selection mode").set({
        font: "bold"
      });
      container.add(title);

      // Creates the mode data
      var model = new qx.data.Array();
      for (var i = 0; i < 250; i++)
      {
        var item = new demobrowser.demo.virtual.model.Item("Item No " + i, "icon/16/places/folder.png");
        model.push(item);
      }

      // Creates the list and configures it
      var list = new qx.ui.list.List(model).set({
        selectionMode : "one",
        height: 280,
        width: 150,
        labelPath: "label",
        iconPath: "icon"
      });
      container.add(list, {top: 20});

      // Pre-Select "Item No 16"
      list.getSelection().push(model.getItem(16));

      return container;
    },

    createAdditiveSelectionList : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

      var title = new qx.ui.basic.Label("Additive selection").set({
        font : "bold"
      });
      container.add(title);

      var l3l = ["Leon","Lukas","Luca","Finn","Tim","Felix","Jonas","Luis",
                 "Maximilian","Julian","Max","Paul","Niclas","Jan","Ben","Elias","Jannick",
                 "Philipp","Noah","Tom","Moritz","Nico","David","Nils","Simon","Fabian",
                 "Erik","Justin","Alexander","Jakob","Florian","Nick","Linus","Mika","Jason",
                 "Daniel","Lennard","Marvin","Jannis","Tobias","Dominic","Marlon","Marc",
                 "Johannes","Jonathan","Julius","Colin","Joel","Kevin","Vincent","Robin"];

      // Creates the model data and the new selection
      var model = new qx.data.Array();
      var selection = new qx.data.Array();
      for (var i = 0; i < l3l.length; i++)
      {
        var item = new demobrowser.demo.virtual.model.Item(l3l[i]);
        model.push(item);

        if (i == 10 || i == 12 || i == 16) {
          selection.push(item);
        }
      }

      // Creates the list and configures it
      var list = new qx.ui.list.List(model).set({
        selectionMode : "additive",
        height: 200,
        width: 150,
        labelPath: "label",
        iconPath: "icon"
      });
      container.add(list, {top: 20});

      // Set the new selection
      list.setSelection(selection);

      return container;
    },

    onSelectionModeChange : function(e)
    {
      var value = e.getData()[0].getUserData("value");
      this.__configList.setSelectionMode(value);

      if (value == "single" || value == "one")
      {
        this.__dragCheck.setEnabled(false);
        this.__quickCheck.setEnabled(true);
      }
      else if (value == "multi" || value == "addaptive")
      {
        this.__dragCheck.setEnabled(true);
        this.__quickCheck.setEnabled(false);
      }
    },

    onShowModeChange : function(e)
    {
      var value = e.getData()[0].getUserData("value");
      this.setShowMode(value);
    },

    onDragCheckChange : function(e)
    {
      if (e.getData())
      {
        var mode = this.__configList.getSelectionMode();
        if (mode == "single" || mode == "one") {
          this.debug("Drag selection is only available for the modes multi or additive");
        }
      }

      this.__configList.setDragSelection(e.getData());
    },

    onQuickCheckChange : function(e)
    {
      if (e.getData())
      {
        var mode = this.__configList.getSelectionMode();
        if (mode == "multi" || mode == "additive") {
          this.debug("Quick selection is only available for the modes multi or additive");
        }
      }

      this.__configList.setQuickSelection(e.getData());
    }
  }
});
