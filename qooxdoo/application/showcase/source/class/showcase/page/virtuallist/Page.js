/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************

#use(showcase.page.virtuallist.Content)

************************************************************************ */
/**
 * @lint ignoreReferenceField(__descriptionText, __tryThis,
 *   __features, __manual, __demos, __api)
 */
qx.Class.define("showcase.page.virtuallist.Page",
{
  extend : showcase.Page,

  construct: function()
  {
    this.base(arguments);
    this.set({
      name: "Virtual List",
      part: "virtuallist",
      icon: "showcase/virtuallist/icon.png",
      contentClass: "showcase.page.virtuallist.Content",
      description: showcase.page.DescriptionBuilder.build(
        "Virtual List",
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
    __descriptionText : "Using the virtual infrastructure has considerable" +
      " advantages when there is a huge amount of model items to render" +
      " because the virtual infrastructure only creates widgets for visible" +
      " items and reuses them. This saves both creation time and memory.",

    __tryThis : {
      "Close Group" : "Click on the arrow of a group item to close the group.",
      "Change User Data" : "Select a user and change values for e.g. status.",
      "Add User" : "Press the add user button and enter name and group.",
      "Delete User" : "Select a user and press the delete button."
    },

    __features : {
      "Filtering" : "You can use a filter to hide model items.",
      "Sorting" : "You can sort the list with a custom algorithm.",
      "Grouping" : "You can define a group for each mode item.",
      "Selection" : "You can use different selection modes (single selection," +
        " multi selection).",
      "Data Binding" : "You can bind model values with the rendered widget.",
      "Custom Rendering" : "You can configure the used widgets or create your own."
    },

    __manual : {
      "pages/widget/virtuallist.html": "Virtual List"
    },

    __demos : {
      "#virtual~List.html" : "List overview",
      "#virtual~ListWithFilter.html" : "Filtering example",
      "#virtual~ExtendedList.html" : "Custom rendering example",
      "#virtual~GroupedList.html" : "Grouping example"
    },

    __api : {
      "#qx.ui.list.List" : "Virtual List",
      "#qx.ui.list.core.IListDelegate" : "List delegate"
    }
  }
});
