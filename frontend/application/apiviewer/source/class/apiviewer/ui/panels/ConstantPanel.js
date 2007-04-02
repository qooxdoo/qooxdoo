
qx.Class.define("apiviewer.ui.panels.ConstantPanel", {

  extend: apiviewer.ui.panels.InfoPanel,

  members : {

    /**
     * Checks whether a constant has details.
     *
     * @type member
     * @param node {Map} the doc node of the constant.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @return {Boolean} whether the constant has details.
     */
    itemHasDetails : function(node, currentClassDocNode) {
      return (
        node.getSee().length > 0 ||
        node.getErrors().length > 0 ||
        apiviewer.ui.panels.InfoPanel.descriptionHasDetails(node) ||
        this.__hasConstantValueHtml(node)
      );
    },


    /**
     * Creates the HTML showing the information about a constant.
     *
     * @type member
     * @param node {Map} the doc node of the constant.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the constant.
     */
    getItemHtml : function(node, currentClassDocNode, showDetails)
    {
      var info = {};

      // Add the title
      info.typeHtml = apiviewer.ui.panels.InfoPanel.createTypeHtml(node, "var");
      info.titleHtml = apiviewer.ui.panels.InfoPanel.setTitleClass(node, node.getName());

      // Add the description
      info.textHtml = apiviewer.ui.panels.InfoPanel.createDescriptionHtml(node, showDetails);

      if (showDetails)
      {
        info.textHtml += this.__createConstantValueHtml(node);
        info.textHtml += apiviewer.ui.panels.InfoPanel.createSeeAlsoHtml(node);
        info.textHtml += apiviewer.ui.panels.InfoPanel.createErrorHtml(node, currentClassDocNode);
        info.textHtml += apiviewer.ui.panels.InfoPanel.createDeprecationHtml(node, "constant");
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
      return node.getValue() ? true : false;
    },


    /**
     * Creates the HTML showing the value of a constant
     *
     * @type member
     * @param node {Map} the doc node of the item.
     * @return {String} the HTML showing the value of the constant
     */
    __createConstantValueHtml : function(node)
    {
      var ClassViewer = apiviewer.ui.ClassViewer;
      if (this.__hasConstantValueHtml(node)) {
        html = new qx.util.StringBuilder(
          '<div class="item-detail-headline">', "Value: ",
          '</div>', '<div class="item-detail-text">',
          qx.html.String.escape(qx.io.Json.stringify(node.getValue())),
          '</div>'
        )
        return html.get();
      } else {
        return "";
      }
    }

  }

});