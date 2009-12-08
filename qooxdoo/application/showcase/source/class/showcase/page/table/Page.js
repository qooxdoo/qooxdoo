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

#use(showcase.page.table.Content)

************************************************************************ */

qx.Class.define("showcase.page.table.Page",
{
  extend : showcase.Page,
  
  construct: function()
  {
    this.base(arguments);
    this.set({
      name: "Table",
      part: "table",
      icon: "showcase/table/icon.png",
      contentClass: "showcase.page.table.Content",
      description: showcase.page.DescriptionBuilder.build(
        "Table",
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
    __descriptionText : "The table is a very powerful widget. It is “virtual” " + 
      "in that the table data can be of any length (e.g. hundreds of thousands" + 
      " of rows or more) yet only the rows which are actually being viewed are" +
      " rendered. The data you currently see is fetched from a YQL service and " + 
      "with that always up to date.",
    
    __tryThis : {
      "Sorting" : "Click on the column header sorts the column.",
      "Reordering" : "Drag the column header to reorder.",
      "Resizing" : "Drag the column header separator to resize the columns.",
      "Hide Columns" : "Use the column menu at the upper right.",
      "Resize" : "Resize the window to see the table resize."
    },
    
    __features : {
      "Cell Renderer" : "Custom cell renderer like the boolean cell renderer can be configured.",
      "Header Renderer" : "Custom header renderer like in the “explicit” column can be used."
    },
    
    
    __manual : {
      "remote_table_model" : "Remote table model"
    },
    
    __demos : {
      "#table~Table.html": "Basic table",
      "#table~Table_Cell_Editor.html": "Cell editors",
      "#table~Table_Conditional.html": "Conditional cell renderer",
      "#table~Table_Context_Menu.html": "Column context menus",
      "#table~Table_Events.html": "Table events",
      "#table~Table_Filtered_Model.html": "Filtered Table Model",
      "#table~Table_Huge.html": "Table with 10000 rows and 50 columns",
      "#table~Table_Meta_Columns.html": "Table with a fixed first column",
      "#table~Table_Resize_Columns.html": "Column auto sizing",
      "#table~Table_Selection.html": "Table selection modes",
      "#table~Table_Window_Editor.html": "Windowed cell editor"
    },

    __api : {
      "#qx.ui.table.Table" : "qx.ui.table.Table"
    }
  }
});