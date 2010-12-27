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
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * Demonstrates qx.ui.list(...):
 *
 * List
 *
 */

qx.Class.define("demobrowser.demo.ui.overview.pages.List",
{
  extend: qx.ui.tabview.Page,

  include : demobrowser.demo.ui.overview.MControls,

  construct: function()
  {
    this.base(arguments);

    this.setLabel("List");
    this.setLayout(new qx.ui.layout.Canvas());

    this.__container = new qx.ui.container.Composite(new qx.ui.layout.Canvas);
    this.add(this.__container, {top: 40});

    this._initWidgets();
    this._initControls(this.__widgets, {disabled: true});

    this.__loadData();
  },

  members :
  {
    __widgets: null,

    __container: null,

    __listGroupedByName: null,

    _initWidgets: function()
    {
      var widgets = this.__widgets = new qx.type.Array();

      // Creates the list and configure it
      var list = this.__listGroupedByName = new qx.ui.list.List().set({
        height: 280,
        width: 150,
        labelPath: "firstname",
        labelOptions: {converter: function(data, model) {
          return model ? model.getLastname() + ", " + data : "no model...";
        }}
      });
      widgets.push(list);
      this.__container.add(list);

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
    },

    __loadData : function()
    {
      var url = "json/people.json";
      var store = new qx.data.store.Json(url);
      store.bind("model.persons", this.__listGroupedByName, "model");
    }
  }
});