/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

qx.Class.define("qx.test.ui.form.virtual.VirtualComboBox",
{

  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __comboBox : null,
    __model : null,


    setUp : function()
    {
      this.base(arguments);
      this.__comboBox = new qx.ui.form.VirtualComboBox();
      this.getRoot().add(this.__comboBox);

      this.flush();
    },

    tearDown : function()
    {
      this.base(arguments);
      this.__comboBox.destroy();
      this.__comboBox = null;
      this.__model.dispose();
      this.flush();
    },

    __createSimpleModel : function()
    {
      var model = new qx.data.Array();

      for (var i = 0; i < 100; i++) {
        model.push("item " + (i + 1));
      }

      return model;
    },

    __createRichModel : function()
    {
      var model = new qx.data.Array();

      for (var i = 0; i < 100; i++) {
        model.push("<b>item " + (i + 1) + "</b>");
      }

      return model;
    },

    __createNestedModel : function()
    {
      var rawData = [
        {
          firstname : "James",
          lastname : "Kirk"
        },
        {
          firstname : "Jean-Luc",
          lastname : "Picard"
        },
        {
          firstname : "Benjamin",
          lastname : "Sisko"
        }
      ];
      var model = qx.data.marshal.Json.createModel(rawData);
      return model;
    },

    testPreselectOnOpen : function()
    {
      this.__model = this.__createSimpleModel();
      this.__comboBox.setModel(this.__model);
      this.__comboBox.setValue("i");
      this.flush();
      this.__comboBox.open();
      this.flush();
      this.__comboBox.close();
      this.flush();
      // Preselection may not change the actual value
      this.assertNotEquals("item 1", this.__comboBox.getValue());
      this.assertEquals("i", this.__comboBox.getValue());
    },

    testSelectFirstMatch : function()
    {
      this.__model = this.__createSimpleModel();
      this.__comboBox.setModel(this.__model);
      this.__comboBox.setValue("item 4");
      this.flush();
      this.__comboBox.open();
      this.flush();
      var preselected = this.__comboBox.getChildControl("dropdown")._preselected;
      this.assertEquals("item 4", preselected);
      this.assertEquals("item 4", this.__comboBox.getValue());
    },

    testSelectFirstMatchWithSortedModel : function()
    {
      this.__model = this.__createSimpleModel();
      this.__comboBox.setModel(this.__model);
      var delegate = {
        // invert sort order
        sorter : function(a, b) {
          return a < b ? 1 : a > b ? -1 : 0;
        }
      };
      this.__comboBox.setDelegate(delegate);
      this.__comboBox.setValue("item 4");
      this.flush();
      this.__comboBox.open();
      this.flush();
      var preselected = this.__comboBox.getChildControl("dropdown")._preselected;
      this.assertEquals("item 49", preselected);
      this.assertEquals("item 4", this.__comboBox.getValue());

      // The virtual list uses a timeout to asynchronously flush the layout
      // queue and scroll the (pre)selected item into view. tearDown is called
      // before this timer's callback so the list container tries to scroll a
      // disposed widget which causes an exception. To get around this, we use
      // a timeout to delay the tearDown call.
      var that = this;
      window.setTimeout(function() {
        that.resume();
      }, 100);
      this.wait(200);
    },

    testSelectFirstMatchWithFilteredModel : function()
    {
      this.__model = this.__createSimpleModel();
      this.__comboBox.setModel(this.__model);
      var delegate = {
        // remove even-numbered items
        filter : function(item) {
          var num = parseInt(/([0-9]+)/.exec(item)[1], 10);
          return num % 2 ? true : false;
        }
      };
      this.__comboBox.setDelegate(delegate);
      this.__comboBox.setValue("item 22");
      this.flush();
      this.__comboBox.open();
      this.flush();
      // item 22 is not in the list, nothing should be preselected
      var preselected = this.__comboBox.getChildControl("dropdown")._preselected;
      this.assertNull(preselected);
      this.assertEquals("item 22", this.__comboBox.getValue());
    },

    testSelectFirstMatchWithFormatter : function()
    {
      this.__model = this.__createRichModel();
      this.__comboBox.setModel(this.__model);
      var delegate = {
        configureItem : function(item)
        {
          item.setRich(true);
        }
      };
      this.__comboBox.setDelegate(delegate);
      this.__comboBox.setDefaultFormat(function(data) {
        if (data) {
          data = qx.lang.String.stripTags(data);
          data = qx.bom.String.unescape(data);
        }
        return data;
      });
      this.__comboBox.setValue("item 4");
      this.flush();
      this.__comboBox.open();
      this.flush();
      var preselected = this.__comboBox.getChildControl("dropdown")._preselected;
      this.assertEquals("<b>item 4</b>", preselected);
      this.assertEquals("item 4", this.__comboBox.getValue());
    },

    testSelectFirstMatchByLabelPath : function()
    {
      this.__model = this.__createNestedModel();
      this.__comboBox.setLabelPath("lastname");
      this.__comboBox.setModel(this.__model);
      this.__comboBox.setValue("Si");
      this.flush();
      this.__comboBox.open();
      this.flush();
      var preselected = this.__comboBox.getChildControl("dropdown")._preselected.getLastname();
      this.assertEquals("Sisko", preselected);
      this.assertEquals("Si", this.__comboBox.getValue());
    },

    testEmptySelection : function()
    {
      this.__comboBox.setLabelPath("label");
      var rawData = [{
        label : "foo"
      }];
      var model = this.__model = qx.data.marshal.Json.createModel(rawData);
      this.__comboBox.setModel(model);
      var selection = this.__comboBox.getChildControl("dropdown").getSelection();
      selection.push(this.__comboBox.getModel().getItem(0));
      selection.removeAll();
    },

    testOpenWithUnrenderedWidget : function()
    {
      var cb = new qx.ui.form.VirtualComboBox();
      cb.open();
      this.getRoot().add(cb);
    }
  }

});
