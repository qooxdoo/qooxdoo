/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#use(showcase.page.databinding.Content)

************************************************************************ */
/**
 * @lint ignoreReferenceField(__descriptionText, __tryThis,
 *   __features, __manual, __demos, __api)
 */
qx.Class.define("showcase.page.databinding.Page",
{
  extend : showcase.Page,

  construct: function()
  {
    this.base(arguments);
    this.set({
      name: "Data Binding",
      part: "data",
      icon: "showcase/databinding/icon.png",
      contentClass: "showcase.page.databinding.Content",
      description: showcase.page.DescriptionBuilder.build(
        "Data Binding",
        this.__descriptionText,
        this.__tryThis,
        this.__features,
        this.__manual,
        this.__demos,
        this.__api
      )
    });
  },

  members :
  {
    __descriptionText : "The twitter demo illustrates the use of data binding. " +
    "Twitter offers a REST / JSONP API, making it a perfect match for data " +
    "binding. The demo fetches the data and binds the result to the list. " +
    "Clicking on a tweet will invoke a second binding which displays the " +
    "selected tweet in the detail view right beside the list.",

    __tryThis : {
      "Detail View" : "Clicking a tweet in the list shows the details.",
      "Change Tweet" : "Enter your twitter username in the text field and press \"Show\" to see your recent tweets."
    },

    __features : {
      "Loading Data" : "The data is loaded from twitter in real time via JSONP.",
      "Binding" : "A binding connects the model to the list view."
    },

    __manual : {
      "pages/data_binding/data_binding.html" : "Data Binding Concepts",
      "pages/data_binding/single_value_binding.html" : "Fundamental Layer",
      "pages/data_binding/controller.html" : "Controller",
      "pages/data_binding/stores.html" : "Data Stores"
    },

    __demos : {
      "#data~SingleValueBinding.html" : "Single Value Binding Demo",
      "#data~ListControllerWith3Widgets.html" : "List Binding Demo",
      "#data~TreeController.html": "Tree Binding Demo",
      "#data~FormController.html" : "Form Binding Demo",
      "#data~Flickr.html" : "Flickr Foto Search"
    },

    __api : {
      "#qx.data" : "Data Binding Package",
      "#qx.data.store.Jsonp" : "JSONP Data Store",
      "#qx.data.controller.List" : "List Controller",
      "#qx.data.controller.Object" : "Object Controller"
    }
  }
});
