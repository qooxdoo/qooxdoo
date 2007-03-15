
qx.Class.define("apiviewer.ConstantPanel", {
  
  extend: apiviewer.InfoPanel,
  
  members : {
    
    /**
     * Checks whether a constant has details.
     *
     * @type member
     * @param node {Map} the doc node of the constant.
     * @param fromClassNode {Map} the doc node of the class the constant was defined.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class     
     * @return {Boolean} whether the constant has details.
     */
    itemHasDetails : function(node, fromClassNode, currentClassDocNode) {
      return (
        apiviewer.InfoPanel.hasSeeAlsoHtml(node) ||
        apiviewer.InfoPanel.hasErrorHtml(node) ||
        apiviewer.InfoPanel.descriptionHasDetails(node) ||
        this.__hasConstantValueHtml(node)
      );
    },


    /**
     * Creates the HTML showing the information about a constant.
     *
     * @type member
     * @param node {Map} the doc node of the constant.
     * @param fromClassNode {Map} the doc node of the class the constant was defined.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the constant.
     */
    getItemHtml : function(node, fromClassNode, currentClassDocNode, showDetails)
    {
      var info = {};

      // Add the title
      info.typeHtml = apiviewer.InfoPanel.createTypeHtml(node, fromClassNode, "var");
      info.titleHtml = node.attributes.name;

      // Add the description
      info.textHtml = apiviewer.InfoPanel.createDescriptionHtml(node, fromClassNode, showDetails);

      if (showDetails)
      {
        info.textHtml += this.__createConstantValueHtml(node, fromClassNode);

        // Add @see attributes
        info.textHtml += apiviewer.InfoPanel.createSeeAlsoHtml(node, fromClassNode);

        // Add documentation errors
        info.textHtml += apiviewer.InfoPanel.createErrorHtml(node, fromClassNode);
      }

      return info;
    },
    

    /**
     * Checks whether a constant value is provided
     *
     * @type member
     * @param node {Map} the doc node of the item.
     * @return {Boolean} whether the constant provides a value
     */
    __hasConstantValueHtml : function(node) {
      return node.attributes.value ? true : false;
    },


    /**
     * Creates the HTML showing the value of a constant
     *
     * @type member
     * @param node {Map} the doc node of the item.
     * @param fromClassNode {Map} the doc node of the class the item was defined.
     * @return {String} the HTML showing the value of the constant
     */
    __createConstantValueHtml : function(node, fromClassNode)
    {
      var ClassViewer = apiviewer.ClassViewer;
      this.debug(node.attributes.value);

      if (this.__hasConstantValueHtml(node)) {
        html = new qx.util.StringBuilder(
          ClassViewer.DIV_START_DETAIL_HEADLINE, "Value: ",
          ClassViewer.DIV_END, ClassViewer.DIV_START_DETAIL_TEXT,
          qx.html.String.escape(qx.io.Json.stringify(node.attributes.value)),
          ClassViewer.DIV_END
        )
        return html.get();
      } else {
        return "";
      }
    }        
        
  }
  
});