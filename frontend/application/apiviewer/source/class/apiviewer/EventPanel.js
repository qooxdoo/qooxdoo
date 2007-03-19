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

qx.Class.define("apiviewer.EventPanel", {

  extend: apiviewer.InfoPanel,

  members : {
    /**
     * Checks whether an event has details.
     *
     * @type member
     * @param node {Map} the doc node of the event.
     * @param fromClassNode {Map} the doc node of the class the event was defined.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @return {Boolean} whether the event has details.
     */
    itemHasDetails : function(node, fromClassNode, currentClassDocNode) {
      return (
        (fromClassNode != currentClassDocNode) // event is inherited
        || (
          apiviewer.InfoPanel.hasSeeAlsoHtml(node) ||
          apiviewer.InfoPanel.hasErrorHtml(node) ||
          apiviewer.InfoPanel.descriptionHasDetails(node)
          )
        );
    },


    /**
     * Creates the HTML showing the information about an event.
     *
     * @type member
     * @param node {Map} the doc node of the event.
     * @param fromClassNode {Map} the doc node of the class the event was defined.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the event.
     */
    getItemHtml : function(node, fromClassNode, currentClassDocNode, showDetails)
    {
      var ClassViewer = apiviewer.ClassViewer;

      var info = {};

      // Add the title
      info.typeHtml = apiviewer.InfoPanel.createTypeHtml(node, fromClassNode, "var");
      info.titleHtml = node.attributes.name;

      // Add the description
      textHtml = new qx.util.StringBuilder(apiviewer.InfoPanel.createDescriptionHtml(node, fromClassNode, showDetails));

      if (showDetails)
      {
        // Add inherited from or overridden from
        if (fromClassNode && fromClassNode != currentClassDocNode) {
          textHtml.add(
            ClassViewer.DIV_START_DETAIL_HEADLINE, "Inherited from:", ClassViewer.DIV_END,
            ClassViewer.DIV_START_DETAIL_TEXT,
            apiviewer.InfoPanel.createItemLinkHtml(fromClassNode.attributes.fullName),
            ClassViewer.DIV_END
          );
        }

        // Add @see attributes
        textHtml.add(apiviewer.InfoPanel.createSeeAlsoHtml(node, fromClassNode));

        // Add documentation errors
        textHtml.add(apiviewer.InfoPanel.createErrorHtml(node, fromClassNode));
      }

      info.textHtml = textHtml.get()
      return info;
    }

  }

});