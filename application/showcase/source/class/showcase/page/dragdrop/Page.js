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
/**
 * @lint ignoreReferenceField(__descriptionText, __tryThis,
 *   __features, __manual, __demos, __api)
 */
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
    __descriptionText : "These two list widgets simulate a shopping system. " +
    "The list on the left contains all available items while the list on the " +
    "right displays the shopping cart. The main idea of this demo is to " +
    "illustrate the drag & drop feature.",

    __tryThis : {
      "Drag" : "Try moving an item to the cart.",
      "Reorder" : "You can reorder both lists.",
      "Move" : "You can also move items back to the shop."
    },

    __features : null,

    __manual : {
      "pages/desktop/ui_dragdrop.html" : "Drag &amp; Drop"
    },

    __demos : {
      "#ui~DragDrop.html" : "Drag &amp; Drop with lists"
    },

    __api : {
      "#qx.ui.core.Widget~drag" : "Widget Drag Event",
      "#qx.ui.core.DragDropCursor" : "Drag&amp;Drop Cursor"
    }
  }
});
