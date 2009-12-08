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

#use(showcase.page.dragdrop.Content)

************************************************************************ */

qx.Class.define("showcase.page.dragdrop.Page",
{
  extend : showcase.Page,
  
  construct: function()
  {
    this.base(arguments);
    this.set({
      name: "Drag & Drop",
      part: "dragdrop",
      icon: "showcase/dragdrop/icon.png",
      contentClass: "showcase.page.dragdrop.Content",
      description: showcase.page.DescriptionBuilder.build(
        "Drag &amp; Drop",
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
    __descriptionText : "Those two list widgets simulate a shopping system. " +
      "The left list contains all items to shop and the right list shows the " + 
      "shopping cart. The main idea of this demo is to show the drag &amp; drop " + 
      "feature.",
    
    __tryThis : {
      "Drag" : "Try to move an item to the cart.",
      "Reorder" : "You can reorder both lists.",
      "Move" : "You can also move items back to the shop."      
    },
    
    __features : null,

    __manual : {
      "ui_dragdrop" : "Drag &amp; Drop"
    },
    
    __demos : {
      "#ui~DragDrop.html" : "Drag &amp; Drop with lists"
    },  

    __api : {
      "#qx.ui.core.Widget~drag" : "Drag event in the Widget",
      "#qx.ui.core.DragDropCursor" : "Drag &amp; Drop Cursor"
    }
  }
});