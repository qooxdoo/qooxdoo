qx.Class.define("apiviewer.AppearancePanel", {
  
  extend: apiviewer.InfoPanel,
  
  members : {
    
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

      var titleHtml = node.attributes.name;
      var typeHtml = apiviewer.InfoPanel.createTypeHtml(node, fromClassNode, "var");
      
      var textHtml = new qx.util.StringBuilder();
      textHtml.add(apiviewer.InfoPanel.createDescriptionHtml(node, fromClassNode, true));
      
      if (showDetails)
      {
        var statesNode = TreeUtil.getChild(node, "states");
        
        if (statesNode)
        {
          textHtml.add(ClassViewer.DIV_START_DETAIL_HEADLINE, "States:", ClassViewer.DIV_END);
          
          for (var i=0; i<statesNode.children.length; i++) 
          {
            var state = statesNode.children[i];  
            
            textHtml.add(ClassViewer.DIV_START_DETAIL_TEXT);
            textHtml.add(ClassViewer.SPAN_START_PARAM_NAME, state.attributes.name, ClassViewer.SPAN_END);            
            textHtml.add(ClassViewer.DIV_END); 
          }
          
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
      return apiviewer.TreeUtil.getChild(node, "states") != null
    }
    
  }
});