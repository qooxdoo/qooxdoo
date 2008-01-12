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

qx.Class.define("apiviewer.ui.panels.AppearancePanel", {

  extend: apiviewer.ui.panels.InfoPanel,

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


    _getPanelItems : function(showInherited, currentClassDocNode)
    {
      var appearances = this.base(arguments, showInherited, currentClassDocNode);
      if (!showInherited) {
        return appearances;
      }
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


    getItemTypeHtml : function(node)
    {
      var nodeName = node.getName();
      if (node.getType() == node.getClass()) {
        var titleHtml = nodeName + " (default appearance of the class)";
      } else {
        var titleHtml = nodeName;
      }
      return titleHtml;
    },


    getItemTitleHtml : function(node)
    {
       return apiviewer.ui.panels.InfoPanel.setTitleClass(node, node.getName());
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
    getItemTextHtml : function(node, currentClassDocNode, showDetails)
    {
      var ClassViewer = apiviewer.ui.ClassViewer;

      var textHtml = new qx.util.StringBuilder();
      textHtml.add(
        '<div class="item-desc">',
        apiviewer.ui.panels.InfoPanel.createDescriptionHtml(node, node.getClass(), true),
        '</div>'
      );

      if (showDetails)
      {
        var states = this.__getAllAppearanceStates(node);

        if (states.length > 0)
        {
          textHtml.add('<div class="item-detail-headline">', "States:", '</div>');

          for (var i=0; i<states.length; i++)
          {
            var state = states[i];

            textHtml.add(
              "<div class='item-detail-text'><code>",
              state.getName(),
              "</code><p>"
            );

            var appearance = state.getAppearance();
            if (appearance.getType() != node.getClass()) {
              textHtml.add(
                " <span class='item-detail-define'>defined by ",
                apiviewer.ui.panels.InfoPanel.createItemLinkHtml(appearance.getType().getFullName()),
                "</span>: "
              );
            }

            var desc = state.getDescription();

            if (desc) {
              textHtml.add(" ", apiviewer.ui.panels.InfoPanel.resolveLinkAttributes(desc, state.getClass()));
            }

            textHtml.add("</p></div>");
          }

          textHtml.add('</div>');
        }
      }

      return textHtml.get();
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
