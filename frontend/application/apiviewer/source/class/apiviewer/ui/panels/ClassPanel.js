/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

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

/* ************************************************************************

#module(apiviewer)

************************************************************************ */


qx.Class.define("apiviewer.ui.panels.ClassPanel",
{
  extend: apiviewer.ui.panels.InfoPanel,

  members :
  {
    getItemTypeHtml : function(node)
    {
      return apiviewer.ui.panels.InfoPanel.createTypeHtml(node);
    },

    getItemTitleHtml : function(node)
    {
      var titleHtml = new qx.util.StringBuilder();

      if (node.isAbstract()) {
        titleHtml.add("Abstract ");
      } else if (node.isStatic()) {
        titleHtml.add("Static ");
      } else if (node.isSingleton()) {
        titleHtml.add("Singleton ");
      }
      switch (node.getType())
      {
        case "mixin" :
          titleHtml.add("Mixin ");
          break;

        case "interface" :
          titleHtml.add("Interface ");
          break;

        default:
          titleHtml.add("Class ");
          break;
      }
      titleHtml.add(node.getFullName());
      return titleHtml.get();
    },


    getItemTextHtml : function(node, getDocNode, showDetails)
    {
      if (showDetails)
      {
        return (
          '<div class="class-description">' +
          apiviewer.ui.panels.InfoPanel.resolveLinkAttributes(node.getDescription(), node) +
          '</div>'
        );
      } else {
        return apiviewer.ui.panels.InfoPanel.createDescriptionHtml(node, showDetails);
      }
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

      var nodeArr = currentClassDocNode.getClasses();

      if (nodeArr && nodeArr.length > 0)
      {
        this._sortItems(nodeArr);
      }

      this._displayNodes(nodeArr, currentClassDocNode);
    }

  }

});