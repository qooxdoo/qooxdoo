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

qx.Class.define("apiviewer.PropertyPanel", {

  extend: apiviewer.InfoPanel,

  members : {

    /**
     * Creates the HTML showing the information about a property.
     *
     * @type member
     * @param node {Map} the doc node of the property.
     * @param fromClassNode {Map} the doc node of the class the property was defined.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the property.
     */
    getItemHtml : function(node, fromClassNode, currentClassDocNode, showDetails)
    {
      fromClassNode = node.getClass();
      var ClassViewer = apiviewer.ClassViewer;

      // Get the property node that holds the documentation
      var docClassNode = fromClassNode;
      var docNode = node.getDocNode();

      // Add the title
      var typeHtml = new qx.util.StringBuilder(apiviewer.InfoPanel.createTypeHtml(node, "var"));
      var titleHtml = apiviewer.InfoPanel.createDeprecatedTitle(node, node.getName());

      // Add the description
      var textHtml = new qx.util.StringBuilder(apiviewer.InfoPanel.createDescriptionHtml(docNode, showDetails));

      if (showDetails)
      {
        // Add allowed values
        var allowedValue = null;

        if (node.getPossibleValues()) {
          allowedValue = node.getPossibleValues();
        } else if (node.getClassname()) {
          allowedValue = "instances of " + node.classname;
        } else if (node.getInstance()) {
          allowedValue = "instances of " + node.getInstance() + " or sub classes";
        } else if (node.getUnitDetection()) {
          allowedValue = "units: " + node.getUnitDetection();
        } else if (node.getType()) {
          allowedValue = "any " + node.getType();
        }

        if (allowedValue)
        {
          textHtml.add(ClassViewer.DIV_START_DETAIL_HEADLINE, "Allowed values:", ClassViewer.DIV_END, ClassViewer.DIV_START_DETAIL_TEXT);

          if (node.getAllowNull() != "false") {
            textHtml.add("null, ");
          }

          textHtml.add(allowedValue, ClassViewer.DIV_END);
        }

        // Add default value
        textHtml.add(
          ClassViewer.DIV_START_DETAIL_HEADLINE, "Default value:", ClassViewer.DIV_END,
          ClassViewer.DIV_START_DETAIL_TEXT,
          (node.getDefaultValue() ? node.getDefaultValue() : "null"),
          ClassViewer.DIV_END
        );

        // Add get alias
        if (node.getGetAlias()) {
          textHtml.add(
            ClassViewer.DIV_START_DETAIL_HEADLINE, "Get alias:", ClassViewer.DIV_END,
            ClassViewer.DIV_START_DETAIL_TEXT, node.getGetAlias(), ClassViewer.DIV_END
          );
        }

        // Add set alias
        if (node.getSetAlias()) {
          textHtml.add(
            ClassViewer.DIV_START_DETAIL_HEADLINE, "Set alias:", ClassViewer.DIV_END,
            ClassViewer.DIV_START_DETAIL_TEXT, node.getSetAlias(), ClassViewer.DIV_END
          );
        }

        // Add inherited from or overridden from
        if (fromClassNode && fromClassNode != currentClassDocNode) {
          if (fromClassNode.getType() == "mixin") {
            textHtml.add(
              ClassViewer.DIV_START_DETAIL_HEADLINE, "Included from mixin:", ClassViewer.DIV_END,
              ClassViewer.DIV_START_DETAIL_TEXT,
              apiviewer.InfoPanel.createItemLinkHtml(fromClassNode.getFullName()),
              ClassViewer.DIV_END
            );
          } else {
            textHtml.add(
              ClassViewer.DIV_START_DETAIL_HEADLINE, "Inherited from:", ClassViewer.DIV_END,
              ClassViewer.DIV_START_DETAIL_TEXT,
              apiviewer.InfoPanel.createItemLinkHtml(fromClassNode.getFullName()), ClassViewer.DIV_END
            );
          }
        } else if (node.getOverriddenFrom()) {
          textHtml.add(
            ClassViewer.DIV_START_DETAIL_HEADLINE, "Overridden from:", ClassViewer.DIV_END,
            ClassViewer.DIV_START_DETAIL_TEXT,
            apiviewer.InfoPanel.createItemLinkHtml(node.getOverriddenFrom().getFullName()),
            ClassViewer.DIV_END
          );
        }

        textHtml.add(apiviewer.InfoPanel.createInfoRequiredByHtml(node));
        textHtml.add(apiviewer.InfoPanel.createSeeAlsoHtml(docNode));
        textHtml.add(apiviewer.InfoPanel.createErrorHtml(docNode, docClassNode, currentClassDocNode));
        textHtml.add(apiviewer.InfoPanel.createDeprecationHtml(docNode, "property"));
      }

      var info = {};
      info.textHtml = textHtml.get()
      info.typeHtml = typeHtml.get()
      info.titleHtml = titleHtml;

      return info;
    }

  }

});