
qx.Class.define("apiviewer.MethodPanel", {
  
  extend: apiviewer.InfoPanel,
  
  members : {
    
    /**
     * Creates the HTML showing the information about a method.
     *
     * @type member
     * @param node {Map} the doc node of the method.
     * @param fromClassNode {Map} the doc node of the class the method was defined.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the method.
     */
    getItemHtml : function(node, fromClassNode, currentClassDocNode, showDetails)
    {
      var ClassViewer = apiviewer.ClassViewer;
      var TreeUtil = apiviewer.TreeUtil;

      // Get the method node that holds the documentation
      var docClassNode = fromClassNode;
      var docNode = node;

      if (node.attributes.docFrom)
      {
        docClassNode = apiviewer.ClassViewer.getClassDocNode(node.attributes.docFrom);
        var listNode = TreeUtil.getChild(docClassNode, this.getListName());
        docNode = TreeUtil.getChildByAttribute(listNode, "name", node.attributes.name);
      }

      typeHtml = new qx.util.StringBuilder();
      if (node.attributes.isAbstract) {
        typeHtml.add("abstract ")
      }
      
      // Get name, icon and return type
      var returnNode = TreeUtil.getChild(docNode, "return");

      titleHtml = new qx.util.StringBuilder();
      if (node.attributes.isCtor) {
        titleHtml.add(fromClassNode.attributes.name);
      }
      else
      {
        titleHtml.add(node.attributes.name);
        typeHtml.add(apiviewer.InfoPanel.createTypeHtml(returnNode, fromClassNode, "void"));
      }

      // Add the title (the method signature)
      titleHtml.add('<span class="methodSignature"> <span class="parenthesis">(</span>');
      var paramsNode = TreeUtil.getChild(docNode, "params");

      if (paramsNode)
      {
        for (var i=0; i<paramsNode.children.length; i++)
        {
          var param = paramsNode.children[i];

          if (i != 0) {
            titleHtml.add('<span class="separator">,</span> ');
          }

          titleHtml.add(
            '<span class="parameterType">', apiviewer.InfoPanel.createTypeHtml(param, fromClassNode, "var"),
            '</span> <span class="parameterName">', param.attributes.name, '</span>'
          );

          if (param.attributes.defaultValue) {
            titleHtml.add("?");
          }
        }
      }

      titleHtml.add('<span class="parenthesis">)</span></span>');

      // Add the description
      var descNode = apiviewer.TreeUtil.getChild(docNode, "desc");
      var hasDescription = descNode && descNode.attributes.text;
      
      textHtml = new qx.util.StringBuilder()
      if (node.attributes.isCtor && !hasDescription) {
        textHtml.add("Creates a new instance of ", fromClassNode.attributes.name, ".");
      } else {
        textHtml.add(apiviewer.InfoPanel.createDescriptionHtml(docNode, docClassNode, showDetails));
      }

      if (showDetails)
      {
        // Add Parameters
        var paramsNode = TreeUtil.getChild(docNode, "params");

        if (paramsNode)
        {
          textHtml.add(ClassViewer.DIV_START_DETAIL_HEADLINE, "Parameters:", ClassViewer.DIV_END);

          for (var i=0; i<paramsNode.children.length; i++)
          {
            var param = paramsNode.children[i];
            var paramType = param.attributes.type ? param.attributes.type : "var";
            var dims = param.attributes.arrayDimensions;

            if (dims)
            {
              for (var i=0; i<dims; i++) {
                paramType += "[]";
              }
            }

            var defaultValue = param.attributes.defaultValue;

            textHtml.add(ClassViewer.DIV_START_DETAIL_TEXT);

            if (defaultValue) {
              textHtml.add(ClassViewer.SPAN_START_OPTIONAL);
            }

            textHtml.add(ClassViewer.SPAN_START_PARAM_NAME, param.attributes.name, ClassViewer.SPAN_END);

            if (defaultValue) {
              textHtml.add(" (default: ", defaultValue, ") ", ClassViewer.SPAN_END);
            }

            var paramDescNode = TreeUtil.getChild(param, "desc");

            if (paramDescNode) {
              textHtml.add(" ", apiviewer.InfoPanel.resolveLinkAttributes(paramDescNode.attributes.text, docClassNode));
            }

            textHtml.add(ClassViewer.DIV_END);
          }
        }

        // Add return value
        if (returnNode)
        {
          var returnDescNode = TreeUtil.getChild(returnNode, "desc");

          if (returnDescNode) {
            textHtml.add(
              ClassViewer.DIV_START_DETAIL_HEADLINE, "Returns:", ClassViewer.DIV_END,
              ClassViewer.DIV_START_DETAIL_TEXT,
              apiviewer.InfoPanel.resolveLinkAttributes(returnDescNode.attributes.text, docClassNode),
              ClassViewer.DIV_END
            );
          }
        }

        // Add inherited from or overridden from
        if (fromClassNode && fromClassNode != currentClassDocNode) {
          if (fromClassNode.attributes.type == "mixin") {
            textHtml.add(
              ClassViewer.DIV_START_DETAIL_HEADLINE, "Included from mixin:",
              ClassViewer.DIV_END, ClassViewer.DIV_START_DETAIL_TEXT,
              apiviewer.InfoPanel.createItemLinkHtml(fromClassNode.attributes.fullName), ClassViewer.DIV_END
            );

          } else {
            textHtml.add(
              ClassViewer.DIV_START_DETAIL_HEADLINE, "Inherited from:",
              ClassViewer.DIV_END, ClassViewer.DIV_START_DETAIL_TEXT,
              apiviewer.InfoPanel.createItemLinkHtml(fromClassNode.attributes.fullName), ClassViewer.DIV_END
            );

          }
        } else if (node.attributes.overriddenFrom) {
          textHtml.add(
            ClassViewer.DIV_START_DETAIL_HEADLINE, "Overridden from:", ClassViewer.DIV_END,
            ClassViewer.DIV_START_DETAIL_TEXT,
             apiviewer.InfoPanel.createItemLinkHtml(node.attributes.overriddenFrom), ClassViewer.DIV_END
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
      info.titleHtml = titleHtml.get()
      info.textHtml = textHtml.get()
      info.typeHtml = typeHtml.get()
      return info;
    },
    
    
    /**
     * Checks whether a method has details.
     *
     * @type member
     * @param node {Map} the doc node of the method.
     * @param fromClassNode {Map} the doc node of the class the method was defined.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @return {Boolean} whether the method has details.
     */
    itemHasDetails : function(node, fromClassNode, currentClassDocNode)
    {
      var TreeUtil = apiviewer.TreeUtil;

      // Get the method node that holds the documentation
      var docClassNode = fromClassNode;
      var docNode = node;

      if (node.attributes.docFrom)
      {
        docClassNode = apiviewer.ClassViewer.getClassDocNode(node.attributes.docFrom);
        var listNode = TreeUtil.getChild(docClassNode, this.getListName());
        docNode = TreeUtil.getChildByAttribute(listNode, "name", node.attributes.name);
      }

      // Check whether there are details
      var hasParams = TreeUtil.getChild(docNode, "params") != null;
      var hasReturn = TreeUtil.getChild(docNode, "return") != null;
      var isOverridden = fromClassNode != currentClassDocNode;

      return (
           isOverridden                                       // method is inherited
        || (node.attributes.overriddenFrom != null)           // method is overridden
        || (node.attributes.requiredBy)                       // method is required by an interface
        || hasParams                                          // method has params
        || hasReturn                                          // method has return value
        || apiviewer.InfoPanel.hasSeeAlsoHtml(docNode)
        || apiviewer.InfoPanel.hasErrorHtml(docNode)
        || apiviewer.InfoPanel.descriptionHasDetails(docNode)
      );
    }
        
  }
  
});