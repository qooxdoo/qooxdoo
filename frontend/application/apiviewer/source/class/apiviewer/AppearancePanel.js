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
      var TreeUtil = apiviewer.TreeUtil;
      var states = TreeUtil.getChild(apperanceNode, "states");
      if (states) {
        states = qx.lang.Array.copy(states.children);
      } else {
        states = [];
      }

      var type = apperanceNode.attributes.type;
      var classNode = apperanceNode.parent.parent;
      var startIndex = 1;
      if (type != classNode.attributes.fullName) {
        classNode = apiviewer.ClassViewer.getClassDocNode(type);
        startIndex = 0;
      }

      var docTree = apiviewer.Viewer.instance.getDocTree();
      var classNodes = apiviewer.TreeUtil.getInheritanceChain(docTree, classNode);

      for (var i=startIndex; i<classNodes.length; i++)
      {
        classNode = classNodes[i];
        var appear = TreeUtil.getChild(classNode, "appearances");
        if (appear)
        {
          var classAppearance = TreeUtil.getChildByAttribute(appear, "type", classNode.attributes.fullName);
          if (classAppearance) {
            var classStates = TreeUtil.getChild(classAppearance, "states");
            if (classStates) {
              qx.lang.Array.append(states, classStates.children);
            }
          }
        }
      }
      return states;


      qx.dev.Pollution.getInfo();

    },


    /**
     * Retuns a list of all items to display in the panel
     * This method overwrited the default behaviour of the InfoPanel class.
     */
    _getPanelItems : function(showInherited, currentClassDocNode)
    {
      var TreeUtil = apiviewer.TreeUtil;
      var appearances = this.base(arguments, showInherited, currentClassDocNode);
      if (!showInherited) {
        return appearances;
      }

      var docTree = apiviewer.Viewer.instance.getDocTree();
      var classNodes = TreeUtil.getInheritanceChain(docTree, currentClassDocNode);
      for (var i=0; i<classNodes.length; i++)
      {
        classNode = classNodes[i];
        var appear = TreeUtil.getChild(classNode, "appearances");
        if (appear)
        {
          var classAppearance = TreeUtil.getChildByAttribute(appear, "type", classNode.attributes.fullName);
          if (classAppearance) {
            if (classAppearance.attributes.type != currentClassDocNode.attributes.fullName) {
              appearances.push(classAppearance)
            }
            return appearances;
          }
        }
      }
    },


    /**
     * Creates the HTML showing the information about an appearance.
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
      var ClassViewer = apiviewer.ClassViewer;
      var TreeUtil = apiviewer.TreeUtil;

      var nodeName = node.attributes.name;
      var nodeType = node.attributes.type;
      var className = currentClassDocNode.attributes.fullName;
      if (nodeType == className) {
        var titleHtml = nodeName + " (default appearance of the class)";
      } else {
        var titleHtml = nodeName;
      }
      var typeHtml = apiviewer.InfoPanel.createTypeHtml(node, fromClassNode, "var");

      var textHtml = new qx.util.StringBuilder();
      textHtml.add(
        ClassViewer.DIV_START_DESC,
        apiviewer.InfoPanel.createDescriptionHtml(node, fromClassNode, true),
        ClassViewer.DIV_END
      );

      if (showDetails)
      {
        var states = this.__getAllAppearanceStates(node);

        if (states)
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
              state.attributes.name,
              ClassViewer.SPAN_END,
              "</td>"
            );
            textHtml.add(
              "<td class='state-text'>",
              ClassViewer.DIV_START_DESC,
              apiviewer.InfoPanel.createDescriptionHtml(state, state.parent.parent.parent.parent, true),
              ClassViewer.DIV_END
            );
            if (state.parent.parent.attributes.type != className) {
              textHtml.add(ClassViewer.DIV_START_DETAIL_HEADLINE, "Defined at:", ClassViewer.DIV_END);
              textHtml.add(
                ClassViewer.DIV_START_DETAIL_TEXT,
                apiviewer.InfoPanel.createItemLinkHtml(state.parent.parent.attributes.type),
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
     * @param fromClassNode {Map} the doc node of the class the method was defined.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @return {Boolean} whether the method has details.
     */
    itemHasDetails : function(node, fromClassNode, currentClassDocNode)
    {
      return true; //apiviewer.TreeUtil.getChild(node, "states") != null
    }

  }
});