
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
      var ClassViewer = apiviewer.ClassViewer;

      // Get the property node that holds the documentation
      var docClassNode = fromClassNode;
      var docNode = node;

      if (node.attributes.docFrom)
      {
        docClassNode = apiviewer.ClassViewer.getClassDocNode(node.attributes.docFrom);
        var listNode = apiviewer.TreeUtil.getChild(docClassNode, this.getListName());
        docNode = apiviewer.TreeUtil.getChildByAttribute(listNode, "name", node.attributes.name);
      }

      // Add the title
      var typeHtml = new qx.util.StringBuilder(apiviewer.InfoPanel.createTypeHtml(node, fromClassNode, "var"));
      var titleHtml = new qx.util.StringBuilder(node.attributes.name);

      // Add the description
      var textHtml = new qx.util.StringBuilder(apiviewer.InfoPanel.createDescriptionHtml(docNode, fromClassNode, showDetails));

      if (showDetails)
      {
        // Add allowed values
        var allowedValue = null;

        if (node.attributes.possibleValues) {
          allowedValue = node.attributes.possibleValues;
        } else if (node.attributes.classname) {
          allowedValue = "instances of " + node.attributes.classname;
        } else if (node.attributes.instance) {
          allowedValue = "instances of " + node.attributes.instance + " or sub classes";
        } else if (node.attributes.unitDetection) {
          allowedValue = "units: " + node.attributes.unitDetection;
        } else if (node.attributes.type) {
          allowedValue = "any " + node.attributes.type;
        }

        if (allowedValue)
        {
          textHtml.add(ClassViewer.DIV_START_DETAIL_HEADLINE, "Allowed values:", ClassViewer.DIV_END, ClassViewer.DIV_START_DETAIL_TEXT);

          if (node.attributes.allowNull != "false") {
            textHtml.add("null, ");
          }

          textHtml.add(allowedValue, ClassViewer.DIV_END);
        }

        // Add default value
        textHtml.add(
          ClassViewer.DIV_START_DETAIL_HEADLINE, "Default value:", ClassViewer.DIV_END,
          ClassViewer.DIV_START_DETAIL_TEXT,
          (node.attributes.defaultValue ? node.attributes.defaultValue : "null"),
          ClassViewer.DIV_END
        );

        // Add get alias
        if (node.attributes.getAlias) {
          textHtml.add(
            ClassViewer.DIV_START_DETAIL_HEADLINE, "Get alias:", ClassViewer.DIV_END,
            ClassViewer.DIV_START_DETAIL_TEXT, node.attributes.getAlias, ClassViewer.DIV_END
          );
        }

        // Add set alias
        if (node.attributes.setAlias) {
          textHtml.add(
            ClassViewer.DIV_START_DETAIL_HEADLINE, "Set alias:", ClassViewer.DIV_END,
            ClassViewer.DIV_START_DETAIL_TEXT, node.attributes.setAlias, ClassViewer.DIV_END
          );
        }

        // Add inherited from or overridden from
        if (fromClassNode && fromClassNode != currentClassDocNode) {
          if (fromClassNode.attributes.type == "mixin") {
            textHtml.add(
              ClassViewer.DIV_START_DETAIL_HEADLINE, "Included from mixin:", ClassViewer.DIV_END,
              ClassViewer.DIV_START_DETAIL_TEXT,
              apiviewer.InfoPanel.createItemLinkHtml(fromClassNode.attributes.fullName),
              ClassViewer.DIV_END
            );
          } else {
            textHtml.add(
              ClassViewer.DIV_START_DETAIL_HEADLINE, "Inherited from:", ClassViewer.DIV_END,
              ClassViewer.DIV_START_DETAIL_TEXT,
              apiviewer.InfoPanel.createItemLinkHtml(fromClassNode.attributes.fullName), ClassViewer.DIV_END
            );
          }
        } else if (node.attributes.overriddenFrom) {
          textHtml.add(
            ClassViewer.DIV_START_DETAIL_HEADLINE, "Overridden from:", ClassViewer.DIV_END,
            ClassViewer.DIV_START_DETAIL_TEXT,
            apiviewer.InfoPanel.createItemLinkHtml(node.attributes.overriddenFrom),
            ClassViewer.DIV_END
          );
        }

        // Add required by interface
        textHtml.add(apiviewer.InfoPanel.createInfoRequiredByHtml(node));

        // Add @see attributes
        textHtml.add(apiviewer.InfoPanel.createSeeAlsoHtml(docNode, docClassNode));

        // Add documentation errors
        textHtml.add(apiviewer.InfoPanel.createErrorHtml(docNode, docClassNode));
      }

      var info = {};
      info.textHtml = textHtml.get()
      info.typeHtml = typeHtml.get()
      info.titleHtml = titleHtml.get()      
      
      return info;
    }

  }
  
});