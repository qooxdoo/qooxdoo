/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This class wraps the access to documentation nodes.
 */
qx.Class.define("apiviewer.dao.Node", {

  extend : qx.core.Object,

  /**
   * @param classDocNode {Map} documentation node
   */
  construct : function(classDocNode)
  {
    this.base(arguments);

    this._docNode = classDocNode;
    classDocNode.children = classDocNode.children || [];
    classDocNode.attributes = classDocNode.attributes || {};
    classDocNode.cls = this;

    this._initializeFields();

    for (var i=0; i<classDocNode.children.length; i++) {
      var childNode = classDocNode.children[i];
      if (!this._addChildNode(childNode)) {
        throw new Error("Unknown child type: " + childNode.type + " node: " + qx.lang.Json.stringify(childNode));
      }
    }
  },

  members :
  {

    /**
     * Return the internal JSON representation of the node
     *
     * @return {Map} the JSON doc node of thie node.
     */
    getNode : function()
    {
      return this._docNode;
    },


    /**
     * Get the node type of the internal node
     *
     * @return {String} the node type name
     */
    getNodeType : function()
    {
      return this._docNode.type;
    },


    /**
     * Get a list of errors of this item.
     *
     * @return {Map[]} errors of this item.
     */
    getErrors : function()
    {
      return this._errors;
    },


    /**
     * Get the text of the deprecation message.
     *
     * @return {String} the deprecation message.
     */
    getDeprecationText : function()
    {
      return this._deprecated || "";
    },


    /**
     * Get the line number of this item in the source file
     *
     * @return {Integer|null} line number or <code>null</code> if unknown
     */
    getLineNumber : function()
    {
      return this._docNode.attributes.line || null;
    },


    /**
     * Get whether the node is deprecated.
     *
     * @return {Boolean} whether the node is deprecated.
     */
    isDeprecated : function()
    {
      if (typeof this._deprecated == "string"
        || this.getClass && typeof this.getClass()._deprecated == "string"
        || this.getFromProperty && this.getFromProperty() && this.getFromProperty().isDeprecated())
      {
        return true;
      }
      return false;
    },


    /**
     * Get whether the node is internal.
     *
     * @return {Boolean} whether the node is internal.
     */
    isInternal : function()
    {
      return this._docNode.attributes.access == "internal";
    },


    /**
     * Get whether the node is private.
     *
     * @return {Boolean} whether the node is private.
     */
    isPrivate : function()
    {
      return this._docNode.attributes.access == "private";
    },


    /**
     * Get whether the node is protected.
     *
     * @return {Boolean} whether the node is protected.
     */
    isProtected : function()
    {
      return this._docNode.attributes.access == "protected";
    },


    /**
     * Get whether the node is property generated.
     *
     * @return {Boolean} whether the node is property generated.
     */
    isPropertyGenerated : function()
    {
      return this._docNode.attributes.fromProperty != null;
    },


    /**
     * Get whether the node is public.
     *
     * @return {Boolean} Whether the node is public.
     */
    isPublic : function()
    {
      return (
        !this.isPrivate() &&
        !this.isProtected() &&
        !this.isInternal()
      );
    },


    /**
     * Get whether the node has a warning.
     *
     * @return {Boolean} whether the node has a warning.
     */
     hasWarning : function()
     {
       return this._docNode.attributes.hasWarning || false;
     },


    /**
     * Convert a node list into an array of class item instances.
     *
     * @param node {Map} JSON parent node
     * @param ctor {Function} constructor of an item class. The first parameter to the constructor
     *      are the child nodes of the node.
     * @param clazz {apiviewer.dao.Class} the class the items belong to. This will be
     *      passed as the second argument to the constructor.
     * @param arg {var} optional third argument passed into the constructor.
     * @return {Object[]} Array of instances of the constructor.
     */
    _createNodeList : function (node, ctor, clazz, arg)
    {
      if (ctor) {
        var result = [];
        for (var i=0; i<node.children.length; i++) {
          result.push(new ctor(node.children[i], clazz, arg));
        }
        return result;
      } else {
        return node.children;
      }
    },


    /**
     * Initialize all internal fields. This method will be called by the constructor before
     * the child nodes are parsed.
     */
    _initializeFields : function() {
      this._errors = [];
    },


    /**
     * Try to parse a child node of the JSON base node.
     *
     * @param childNode {Map} a child node of the base JSON node.
     * @return {Boolean} Whether the node was parsed successfully.
     */
    _addChildNode : function(childNode)
    {
      switch (childNode.type) {
        case "deprecated":
          this._deprecated = childNode.children ? childNode.children[0].attributes.text || "" : "";
          break;
        case "errors":
          this._errors = this._createNodeList(childNode);
          break;
        case "attach":
        case "attachStatic":
          break;
        default:
          return false;
      }
      return true;
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._docNode = this._errors = null;
  }
});
