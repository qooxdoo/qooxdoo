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

qx.Class.define("apiviewer.ui.panels.MethodPanel",
{

  extend: apiviewer.ui.panels.InfoPanel,

  members :
  {


    /**
     * Get the title HTML for a method
     *
     * @param method {apiviewer.dao.Method} The method doc node.
     * @return {String} The HTML fragment of the title.
     */
    getItemTitleHtml : function(method)
    {
      if (method.isConstructor()) {
        var title = method.getClass().getName();
      } else {
        title = method.getName();
      }

      var titleHtml = new qx.util.StringBuilder(apiviewer.ui.panels.InfoPanel.setTitleClass(method, title));

      // Add the title (the method signature)
      titleHtml.add('<span class="method-signature"><span class="parenthesis">(</span>');

      var params = method.getParams();
      for (var i=0; i<params.length; i++)
      {
        var param = params[i];

        if (i != 0) {
          titleHtml.add('<span class="separator">,</span> ');
        }

        titleHtml.add(
          '<span class="parameter-type">', apiviewer.ui.panels.InfoPanel.createTypeHtml(param, "var"),
          '</span> <code>', param.getName(), '</code>'
        );

        if (param.getDefaultValue()!==undefined) {
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
    getItemTypeHtml : function(method)
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
     * @param method {apiviewer.dao.Method} the doc node of the method.
     * @param currentClassDocNode {apiviewer.dao.Class} the doc node of the currently displayed class
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the method.
     */
    getItemTextHtml : function(method, currentClassDocNode, showDetails)
    {
      var docClass = method.getClass();

      // Add the description
      var textHtml = new qx.util.StringBuilder()
      if (method.isConstructor() && !method.getDescription()) {
        textHtml.add("Creates a new instance of ", docClass.getName(), ".");
      } else {
        textHtml.add(apiviewer.ui.panels.InfoPanel.createDescriptionHtml(method, docClass, showDetails));
      }

      if (showDetails)
      {
        // Add Parameters
        var params = method.getDocNode().getParams();

        if (params.length > 0)
        {
          textHtml.add('<div class="item-detail-headline">', "Parameters:", '</div>');

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

            textHtml.add('<div class="item-detail-text">');

            if (defaultValue) {
              textHtml.add('<span class="item-detail-optional">');
            }

            textHtml.add("<code>", param.getName(), "</code>");

            if (defaultValue) {
              textHtml.add(" (default: ", defaultValue, ") ", '</span>');
            }

            var desc = param.getDescription();

            if (desc) {
              textHtml.add(" ", apiviewer.ui.panels.InfoPanel.resolveLinkAttributes(desc, docClass));
            }

            textHtml.add('</div>');
          }
        }

        // Add return value
        var returnNode = method.getDocNode().getReturn();
        if (returnNode)
        {
          var desc = returnNode.getDescription();
          if (desc) {
            textHtml.add(
              '<div class="item-detail-headline">', "Returns:", '</div>',
              '<div class="item-detail-text">',
              apiviewer.ui.panels.InfoPanel.resolveLinkAttributes(desc, docClass),
              '</div>'
            );
          }
        }
        var applyToProperties = method.getApply();
        if (applyToProperties && applyToProperties.length>0) { // gabi check
          textHtml.add(
            '<div class="item-detail-headline">', applyToProperties.length==1 ? "Apply method of property:" : "Apply method of properties:", '</div>',
            '<div class="item-detail-text">');
            for(var i=0;i<applyToProperties.length;i++){
              textHtml.add(apiviewer.ui.panels.InfoPanel.createItemLinkHtml(
                applyToProperties[i].attributes.applies, method.getClass(), true, true
              ),', ');
            }
            textHtml.add('</div>');
        }


        // Add throws
        var throwsEntries = method.getDocNode().getThrows();
        if (throwsEntries.length > 0)
        {
          textHtml.add('<div class="item-detail-headline">', "Throws:", '</div>');

          for (var i=0; i<throwsEntries.length; i++)
          {
            var throwsEntry = throwsEntries[i];
            var throwsEntryType = throwsEntry.getType() ? throwsEntry.getType() : throwsEntry.getDefaultType();

            textHtml.add('<div class="item-detail-text">');

            textHtml.add(
              '<span class="parameter-type">',
              throwsEntryType === throwsEntry.getDefaultType() ? throwsEntry.getDefaultType() : apiviewer.ui.panels.InfoPanel.createItemLinkHtml(throwsEntryType),
              '</span>'
            );

            var desc = throwsEntry.getDescription();

            if (desc) {
              textHtml.add(" ", apiviewer.ui.panels.InfoPanel.resolveLinkAttributes(desc, docClass));
            }

            textHtml.add('</div>');
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
        textHtml.add(apiviewer.ui.panels.InfoPanel.createSourceLinkHtml(method));
      }

      return textHtml.get();
    },


    /**
     * Checks whether a method has details.
     *
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
        docNode.getThrows().length > 0 ||
        hasReturn ||
        node.getSee().length > 0 ||
        node.getErrors().length > 0 ||
        node.isDeprecated() ||
        node.getApply() ||
        apiviewer.ui.panels.InfoPanel.descriptionHasDetails(node)
      );
    }

  }

});
