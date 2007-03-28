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

qx.Class.define("apiviewer.ui.panels.MethodPanel", {

  extend: apiviewer.ui.panels.InfoPanel,

  members : {


    /**
     * Get the title HTML for a method
     *
     * @param method {apiviewer.dao.Method} The method doc node.
     * @return {String} The HTML fragment of the title.
     */
    getTitleHtml : function(method)
    {
      if (method.isConstructor()) {
        var title = method.getClass().getName();
      } else {
        title = method.getName();
      }
      var titleHtml = new qx.util.StringBuilder(apiviewer.ui.panels.InfoPanel.setTitleClass(method, title));

      // Add the title (the method signature)
      titleHtml.add('<span class="methodSignature"> <span class="parenthesis">(</span>');

      var params = method.getParams();
      for (var i=0; i<params.length; i++)
      {
        var param = params[i];

        if (i != 0) {
          titleHtml.add('<span class="separator">,</span> ');
        }

        titleHtml.add(
          '<span class="parameterType">', apiviewer.ui.panels.InfoPanel.createTypeHtml(param, "var"),
          '</span> <span class="parameterName">', param.getName(), '</span>'
        );

        if (param.getDefaultValue()) {
          titleHtml.add("?");
        }
      }

      titleHtml.add('<span class="parenthesis">)</span></span>');
      return titleHtml.get()
    },


    /**
     * Get the type HTML for a method
     *
     * @param method {apiviewer.dao.Method} The method doc node.
     * @return {String} The HTML fragment of the type.
     */
    getTypeHtml : function(method)
    {
      var typeHtml = new qx.util.StringBuilder();
      if (method.isAbstract()) {
        typeHtml.add("abstract ")
      }

      if (!method.isConstructor()) {
        typeHtml.add(apiviewer.ui.panels.InfoPanel.createTypeHtml(method.getDocNode().getReturn(), "void"));
      }

      return typeHtml.get();
    },


    /**
     * Creates the HTML showing the information about a method.
     *
     * @type member
     * @param method {apiviewer.dao.Method} the doc node of the method.
     * @param currentClassDocNode {apiviewer.dao.Class} the doc node of the currently displayed class
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the method.
     */
    getItemHtml : function(method, currentClassDocNode, showDetails)
    {
      var ClassViewer = apiviewer.ui.ClassViewer;

      var docClass = method.getClass();

      // Add the description
      var textHtml = new qx.util.StringBuilder()
      if (method.isConstructor() && !method.getDescription()) {
        textHtml.add("Creates a new instance of ", docClass.getName(), ".");
      } else {
        textHtml.add(apiviewer.ui.panels.InfoPanel.createDescriptionHtml(method, showDetails));
      }

      if (showDetails)
      {
        // Add Parameters
        var params = method.getDocNode().getParams();

        if (params.length > 0)
        {
          textHtml.add(ClassViewer.DIV_START_DETAIL_HEADLINE, "Parameters:", ClassViewer.DIV_END);

          for (var i=0; i<params.length; i++)
          {
            var param = params[i];
            var paramType = param.getType() ? param.getType() : "var";
            var dims = param.getArrayDimensions();

            if (dims)
            {
              for (var i=0; i<dims; i++) {
                paramType += "[]";
              }
            }

            var defaultValue = param.getDefaultValue();

            textHtml.add(ClassViewer.DIV_START_DETAIL_TEXT);

            if (defaultValue) {
              textHtml.add(ClassViewer.SPAN_START_OPTIONAL);
            }

            textHtml.add(ClassViewer.SPAN_START_PARAM_NAME, param.getName(), ClassViewer.SPAN_END);

            if (defaultValue) {
              textHtml.add(" (default: ", defaultValue, ") ", ClassViewer.SPAN_END);
            }

            var desc = param.getDescription();

            if (desc) {
              textHtml.add(" ", apiviewer.ui.panels.InfoPanel.resolveLinkAttributes(desc, docClass));
            }

            textHtml.add(ClassViewer.DIV_END);
          }
        }

        // Add return value
        var returnNode = method.getDocNode().getReturn()
        if (returnNode)
        {
          var desc = returnNode.getDescription();
          if (desc) {
            textHtml.add(
              ClassViewer.DIV_START_DETAIL_HEADLINE, "Returns:", ClassViewer.DIV_END,
              ClassViewer.DIV_START_DETAIL_TEXT,
              apiviewer.ui.panels.InfoPanel.resolveLinkAttributes(desc, docClass),
              ClassViewer.DIV_END
            );
          }
        }

        textHtml.add(apiviewer.ui.panels.InfoPanel.createAccessHtml(method));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createIncludedFromHtml(method, currentClassDocNode));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createOverwriddenFromHtml(method));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createInheritedFromHtml(method, currentClassDocNode));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createInfoRequiredByHtml(method));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createSeeAlsoHtml(method));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createErrorHtml(method, currentClassDocNode));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createDeprecationHtml(method, "function"));
      }

      var info = {};
      info.titleHtml = this.getTitleHtml(method);
      info.textHtml = textHtml.get();
      info.typeHtml = this.getTypeHtml(method);
      return info;
    },


    /**
     * Checks whether a method has details.
     *
     * @type member
     * @param node {Map} the doc node of the method.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @return {Boolean} whether the method has details.
     */
    itemHasDetails : function(node, currentClassDocNode)
    {
      // Get the method node that holds the documentation
      var docNode = node.getDocNode();
      var hasReturn = docNode.getReturn() && docNode.getReturn().getDescription();
      return (
        node.getClass() != currentClassDocNode ||  // method is inherited
        node.getOverriddenFrom() != null ||
        node.getRequiredBy().length > 0 ||
        docNode.getParams().length > 0 ||
        hasReturn ||
        node.getSee().length > 0 ||
        node.getErrors().length > 0 ||
        node.isDeprecated() ||
        apiviewer.ui.panels.InfoPanel.descriptionHasDetails(docNode)
      );
    }

  }

});