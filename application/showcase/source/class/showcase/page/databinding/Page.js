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
    __descriptionText : "The twitter demo illustrates the usage of data " + 
      "binding. twitter offers a REST / JSONP API for fetching the data, " + 
      "which is a perfect match for data binding. It fetches the data and " + 
      "binds the result to the list. A click on a tweet will invoke a " + 
      "second binding which shows the selected tweet in the detail view " + 
      "right beside the list.",
      
    __tryThis : {
      
    },
    
    __features : {
      "Loading Data" : "The data is loaded from twitter via JSONP.",
      "Binding" : "A binding connects the model to the list view.",
      "Master Detail" : "Clicking on a tweet in the list shows the details.",
      "Friends" : "The friends buttons lets you show your following list.",
      "Configure" : "Enter your username to see your recent tweets."
    },
    
    __manual : {
      "data_binding" : "Data Binding Concepts",
      "data_binding/single_value_binding" : "Fundamental Layer",
      "data_binding/controller" : "Controller",
      "data_binding/stores" : "Data Stores"
    },
    
    __demos : {
      "#data~SingleValueBinding.html" : "Single Value Binding Demo",
      "#data~ListControllerWith3Widgets.html" : "List Binding Demo",
      "#data~TreeController.html": "Tree Binding Demo",
      "#data~FormController.html" : "Form Binding Demo",
      "#data~Flickr.html" : "Flickr Foto Search"
    },

    __api : {
      "#qx.data" : "Main Data Binding API Documentation",
      "#qx.data.store.Jsonp" : "JSONP Data Store",
      "#qx.data.controller.List" : "List Controller",
      "#qx.data.controller.Object" : "Object Controller"
    }
  }
});