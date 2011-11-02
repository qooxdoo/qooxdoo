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

/* ************************************************************************

#asset(widgetbrowser/people.json)

************************************************************************ */

/**
 * Demonstrates qx.ui.list(...):
 *
 * List
 *
 */

qx.Class.define("widgetbrowser.pages.List",
{
  extend: widgetbrowser.pages.AbstractPage,

  construct: function()
  {
    this.base(arguments);

    this.initWidgets();
    this.loadData();
  },

  members :
  {

    __listGroupedByName: null,

    initWidgets: function()
    {
      var widgets = this._widgets;

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
      this.add(list);

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

    loadData : function()
    {
      var url = "widgetbrowser/people.json";
      url = qx.util.ResourceManager.getInstance().toUri(url);
      var store = new qx.data.store.Json(url);
      store.bind("model.people", this.__listGroupedByName, "model");
    }
  }
});