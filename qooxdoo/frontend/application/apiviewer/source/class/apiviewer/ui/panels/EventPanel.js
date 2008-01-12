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

/* ************************************************************************

#module(apiviewer)

************************************************************************ */

qx.Class.define("apiviewer.ui.panels.EventPanel", {

  extend: apiviewer.ui.panels.InfoPanel,

  members :
  {

    /**
     * Checks whether an event has details.
     *
     * @type member
     * @param node {Map} the doc node of the event.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @return {Boolean} whether the event has details.
     */
    itemHasDetails : function(node, currentClassDocNode) {
      return (
        node.getClass() != currentClassDocNode || // event is inherited
        node.getSee().length > 0 ||
        node.getErrors().length > 0 ||
        apiviewer.ui.panels.InfoPanel.descriptionHasDetails(node)
      );
    },


    getItemTypeHtml : function(node)
    {
      return apiviewer.ui.panels.InfoPanel.createTypeHtml(node, "var");
    },


    getItemTitleHtml : function(node)
    {
       return apiviewer.ui.panels.InfoPanel.setTitleClass(node, node.getName());
    },


    /**
     * Creates the HTML showing the information about an event.
     *
     * @type member
     * @param node {Map} the doc node of the event.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the event.
     */
    getItemTextHtml : function(node, currentClassDocNode, showDetails)
    {
      // Add the description
      textHtml = new qx.util.StringBuilder(apiviewer.ui.panels.InfoPanel.createDescriptionHtml(node, node.getClass(), showDetails));

      if (showDetails)
      {
        textHtml.add(apiviewer.ui.panels.InfoPanel.createInheritedFromHtml(node, currentClassDocNode));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createSeeAlsoHtml(node));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createErrorHtml(node, currentClassDocNode));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createDeprecationHtml(node, "event"));

      }

      return textHtml.get()
    }

  }

});
