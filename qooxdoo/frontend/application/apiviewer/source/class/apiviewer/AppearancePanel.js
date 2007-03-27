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

qx.Class.define("apiviewer.AppearancePanel", {

  extend: apiviewer.InfoPanel,

  members : {

    /**
     * Returns all states of an appearance including states
     * inherited from super classes.
     *
     * @param apperanceNode {Map} documentation node of an appearance
     * @return {Map[]} array of state documentation nodes of the appearance
     */
    __getAllAppearanceStates: function(apperanceNode)
    {
      var states = apperanceNode.getStates();
      if (states.length > 0) {
        var result = qx.lang.Array.copy(states);
      } else {
        result = [];
      }

      var type = apperanceNode.getType();
      var classNode = apperanceNode.getClass();
      var startIndex = 1;
      if (type != classNode) {
        classNode = type;
        startIndex = 0;
      }

      var classNodes = classNode.getClassHierarchy();

      for (var i=startIndex; i<classNodes.length; i++)
      {
        classNode = classNodes[i];
        var classAppearance = classNode.getClassAppearance();
        if (classAppearance) {
          var classStates = classAppearance.getStates();
          if (classStates) {
            qx.lang.Array.append(result, classStates);
          }
        }
      }
      return result;
    },


    /**
     * Retuns a list of all items to display in the panel
     * This method overwrited the default behaviour of the InfoPanel class.
     */
    _getPanelItems : function(showInherited, currentClassDocNode)
    {
      var appearances = this.base(arguments, showInherited, currentClassDocNode);
      if (!showInherited) {
        return appearances;
      }
      currentClassDocNode = currentClassDocNode;

      var classNodes = currentClassDocNode.getClassHierarchy();
      for (var i=0; i<classNodes.length; i++)
      {
        classNode = classNodes[i];
        var classAppearance = classNode.getClassAppearance();
        if (classAppearance) {
          if (classAppearance.getType() != currentClassDocNode) {
            appearances.push(classAppearance)
          }
          return appearances;
        }
      }
    },


    /**
     * Creates the HTML showing the information about an appearance.
     *
     * @type member
     * @param node {Map} the doc node of the property.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the property.
     */
    getItemHtml : function(node, currentClassDocNode, showDetails)
    {
      var ClassViewer = apiviewer.ClassViewer;

      var nodeName = node.getName();
      if (node.getType() == node.getClass()) {
        var titleHtml = nodeName + " (default appearance of the class)";
      } else {
        var titleHtml = nodeName;
      }
      var typeHtml = apiviewer.InfoPanel.createTypeHtml(node, "var");

      var textHtml = new qx.util.StringBuilder();
      textHtml.add(
        ClassViewer.DIV_START_DESC,
        apiviewer.InfoPanel.createDescriptionHtml(node, true),
        ClassViewer.DIV_END
      );

      if (showDetails)
      {
        var states = this.__getAllAppearanceStates(node);

        if (states.length > 0)
        {
          textHtml.add(ClassViewer.DIV_START_DETAIL_HEADLINE, "States:", ClassViewer.DIV_END);
          textHtml.add("<table class='states'>");

          for (var i=0; i<states.length; i++)
          {
            var state = states[i];

            textHtml.add("<tr class='state'>");
            textHtml.add(
              "<td class='state-name'>",
              ClassViewer.SPAN_START_PARAM_NAME,
              state.getName(),
              ClassViewer.SPAN_END,
              "</td>"
            );
            textHtml.add(
              "<td class='state-text'>",
              ClassViewer.DIV_START_DESC,
              apiviewer.InfoPanel.createDescriptionHtml(state, true),
              ClassViewer.DIV_END
            );
            var appearance = state.getAppearance();
            if (appearance.getType() != node.getClass()) {
              textHtml.add(ClassViewer.DIV_START_DETAIL_HEADLINE, "Defined at:", ClassViewer.DIV_END);
              textHtml.add(
                ClassViewer.DIV_START_DETAIL_TEXT,
                apiviewer.InfoPanel.createItemLinkHtml(appearance.getType().getFullName()),
                ClassViewer.DIV_END
              );
            }

            textHtml.add("</td></tr>");
          }

          textHtml.add("</table>");
          textHtml.add(ClassViewer.DIV_END);
        }
      }

      var info = {};
      info.textHtml = textHtml.get();
      info.typeHtml = typeHtml;
      info.titleHtml = titleHtml;

      return info;
    },


    /**
     * Checks whether an appearance has details.
     *
     * @type member
     * @param node {Map} the doc node of the method.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @return {Boolean} whether the method has details.
     */
    itemHasDetails : function(node, currentClassDocNode)
    {
      return this.__getAllAppearanceStates(node).length > 0;
    }

  }
});