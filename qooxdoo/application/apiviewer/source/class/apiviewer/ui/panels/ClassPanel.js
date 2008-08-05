/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("apiviewer.ui.panels.ClassPanel",
{
  extend: apiviewer.ui.panels.InfoPanel,

  /**
   * Creates class panel. An class panel shows information about classes, mixins
   * and interfaces
   *
   * @param listName {String} the name of the node list in the class doc node where
   *          the items shown by this info panel are stored.
   * @param labelText {String} the label text describing the node type.
   * @param type {String} One of "class", "mixin" or "interface"
   */
  construct : function(listName, labelText, type)
  {
    this.base(arguments, listName, labelText);
    this.setType(type);
  },


  properties :
  {
    type : {
      check : ["class", "mixin", "interface"]
    }
  },


  members :
  {
    getItemTypeHtml : function(node)
    {
      return apiviewer.ui.panels.InfoPanel.createItemLinkHtml(node.getName(), node, false, true);
    },

    getItemTitleHtml : function(node)
    {
      return node.getFullName();
    },


    getItemTextHtml : function(node, getDocNode, showDetails)
    {
      if (showDetails)
      {
        return apiviewer.ui.panels.InfoPanel.resolveLinkAttributes(node.getDescription(), node);
      } else {
        return apiviewer.ui.panels.InfoPanel.createDescriptionHtml(node, node.getClass(), showDetails);
      }
    },


    getItemTooltip : function(classNode, currentClassDocNode)
    {
      if (classNode.isAbstract()) {
        var tooltip ="Abstract ";
      } else if (classNode.isStatic()) {
        var tooltip = "Static ";
      } else if (classNode.isSingleton()) {
        var tooltip = "Singleton ";
      } else {
        var tooltip = "";
      }
      switch (classNode.getType())
      {
        case "mixin" :
          tooltip += "Mixin";
          break;

        case "interface" :
          tooltip += "Interface";
          break;

        default:
          tooltip += "Class";
          break;
      }
      return tooltip;
    },


    itemHasDetails : function(node, currentClassDocNode)
    {
      return apiviewer.ui.panels.InfoPanel.descriptionHasDetails(node);
    },


    /**
     * Updates an info panel.
     *
     * @param classViewer {apiviewer.ui.ClassViewer} parent class viewer widget.
     * @param currentClassDocNode {apiviewer.dao.Class} the currently displayed class
     */
    update : function(classViewer, currentClassDocNode)
    {
      this.setDocNode(currentClassDocNode);

      var classes = currentClassDocNode.getClasses();
      var nodeArr = [];
      var clType;
      for (var i=0; i<classes.length; i++)
      {
        clType = classes[i].getType();

        // Normalize pseudo-classes (for the user this detail is often not relevant)
        if (clType === "bootstrap" || clType === "list") {
          clType = "class";
        }

        if (clType === this.getType()) {
          nodeArr.push(classes[i]);
        }
      }

      if (nodeArr && nodeArr.length > 0)
      {
        this._sortItems(nodeArr);
      }

      this._displayNodes(nodeArr, currentClassDocNode);
    }

  }

});
