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

#use(showcase.page.tree.Content)

************************************************************************ */
/**
 * @lint ignoreReferenceField(__descriptionText, __tryThis,
 *   __features, __manual, __demos, __api)
 */
qx.Class.define("showcase.page.tree.Page",
{
  extend : showcase.Page,

  construct: function()
  {
    this.base(arguments);
    this.set({
      name: "Tree",
      part: "tree",
      icon: "showcase/tree/icon.png",
      contentClass: "showcase.page.tree.Content",
      description: showcase.page.DescriptionBuilder.build(
        "Tree",
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
    __descriptionText : "The two tree views display some hierarchical data " +
    "including folders, icons and labels. The tree in the right window has " +
    "some additional infomation attached to each item.",

    __tryThis : {
      "Expand" : "Try expanding some folders by using the arrow icon or double clicking.",
      "Resize" : "Resize the window to make the tree scrollbars appear.",
      "Selection" : "Select multiple items, e.g. by holding the Shift key."
    },

    __features : {
      "Configurable" : "Each tree item has a configurable label and icon.",
      "Scrolling" : "Tree displays scrollbars if necessary.",
      "Multi Columns" : "Tree folders can display additional information in separate columns."
    },

    __manual : {
      "pages/widget/tree.html": "The Tree Widget"
    },

    __demos : {
      "#widget~Tree.html" : "Configurable Tree",
      "#widget~Tree_Columns.html" : "Multi Column Tree",
      "#data~TreeController.html" : "Tree using Data Binding",
      "#data~JsonToTree.html" : "Tree filled with Data from a JSON file.",
      "#data~ExtendedTree.html" : "Tree using Data Binding with configuration"
    },

    __api : {
      "#qx.ui.tree" : "Tree Package"
    }
  }
});
