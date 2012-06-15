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
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Manages children structures of an element. Easy and convenient APIs
 * to insert, remove and replace children.
 */
qx.Bootstrap.define("qx.dom.Element",
{
  statics :
  {
    /**
     * {Map} A list of all attributes which needs to be part of the initial element to work correctly
     *
     * @internal
     */
    __initialAttributes :
    {
      "onload" : true,
      "onpropertychange" : true,
      "oninput" : true,
      "onchange" : true,
      "name" : true,
      "type" : true,
      "checked" : true,
      "disabled" : true
    },


    /**
     * Whether the given <code>child</code> is a child of <code>parent</code>
     *
     * @param parent {Element} parent element
     * @param child {Node} child node
     * @return {Boolean} true when the given <code>child</code> is a child of <code>parent</code>
     */
    hasChild : function(parent, child) {
      return child.parentNode === parent;
    },


    /**
     * Whether the given <code>element</code> has children.
     *
     * @param element {Element} element to test
     * @return {Boolean} true when the given <code>element</code> has at least one child node
     */
    hasChildren : function(element) {
      return !!element.firstChild;
    },


    /**
     * Whether the given <code>element</code> has any child elements.
     *
     * @param element {Element} element to test
     * @return {Boolean} true when the given <code>element</code> has at least one child element
     */
    hasChildElements : function(element)
    {
      element = element.firstChild;

      while(element)
      {
        if (element.nodeType === 1) {
          return true;
        }

        element = element.nextSibling;
      }

      return false;
    },


    /**
     * Returns the parent element of the given element.
     *
     * @param element {Element} Element to find the parent for
     * @return {Element} The parent element
     */
    getParentElement : function(element) {
      return element.parentNode;
    },


    /**
     * Checks if the <code>element</code> is in the DOM, but note that
     * the method is very expensive!
     *
     * @param element {Element} The DOM element to check.
     * @param win {Window} The window to check for.
     * @return {Boolean} <code>true</code> if the <code>element</code> is in
     *          the DOM, <code>false</code> otherwise.
     */
    isInDom :function(element, win)
    {
      if (!win) {
        win = window;
      }

      var domElements = win.document.getElementsByTagName(element.nodeName);

      for (var i=0, l=domElements.length; i<l; i++)
      {
        if (domElements[i] === element) {
          return true;
        }
      }

      return false;
    },



    /*
    ---------------------------------------------------------------------------
      INSERTION
    ---------------------------------------------------------------------------
    */

    /**
     * Inserts <code>node</code> at the given <code>index</code>
     * inside <code>parent</code>.
     *
     * @param node {Node} node to insert
     * @param parent {Element} parent element node
     * @param index {Integer} where to insert
     * @return {Boolean} returns true (successful)
     */
    insertAt : function(node, parent, index)
    {
      var ref = parent.childNodes[index];

      if (ref) {
        parent.insertBefore(node, ref);
      } else {
        parent.appendChild(node);
      }

      return true;
    },


    /**
     * Insert <code>node</code> into <code>parent</code> as first child.
     * Indexes of other children will be incremented by one.
     *
     * @param node {Node} Node to insert
     * @param parent {Element} parent element node
     * @return {Boolean} returns true (successful)
     */
    insertBegin : function(node, parent)
    {
      if (parent.firstChild) {
        this.insertBefore(node, parent.firstChild);
      } else {
        parent.appendChild(node);
      }
    },


    /**
     * Insert <code>node</code> into <code>parent</code> as last child.
     *
     * @param node {Node} Node to insert
     * @param parent {Element} parent element node
     * @return {Boolean} returns true (successful)
     */
    insertEnd : function(node, parent) {
      parent.appendChild(node);
    },


    /**
     * Inserts <code>node</code> before <code>ref</code> in the same parent.
     *
     * @param node {Node} Node to insert
     * @param ref {Node} Node which will be used as reference for insertion
     * @return {Boolean} returns true (successful)
     */
    insertBefore : function(node, ref)
    {
      ref.parentNode.insertBefore(node, ref);
      return true;
    },


    /**
     * Inserts <code>node</code> after <code>ref</code> in the same parent.
     *
     * @param node {Node} Node to insert
     * @param ref {Node} Node which will be used as reference for insertion
     * @return {Boolean} returns true (successful)
     */
    insertAfter : function(node, ref)
    {
      var parent = ref.parentNode;

      if (ref == parent.lastChild) {
        parent.appendChild(node);
      } else {
        return this.insertBefore(node, ref.nextSibling);
      }

      return true;
    },





    /*
    ---------------------------------------------------------------------------
      REMOVAL
    ---------------------------------------------------------------------------
    */

    /**
     * Removes the given <code>node</code> from its parent element.
     *
     * @param node {Node} Node to remove
     * @return {Boolean} <code>true</code> when node was successfully removed,
     *   otherwise <code>false</code>
     */
    remove : function(node)
    {
      if (!node.parentNode) {
        return false;
      }

      node.parentNode.removeChild(node);
      return true;
    },


    /**
     * Removes the given <code>node</code> from the <code>parent</code>.
     *
     * @param node {Node} Node to remove
     * @param parent {Element} parent element which contains the <code>node</code>
     * @return {Boolean} <code>true</code> when node was successfully removed,
     *   otherwise <code>false</code>
     */
    removeChild : function(node, parent)
    {
      if (node.parentNode !== parent) {
        return false;
      }

      parent.removeChild(node);
      return true;
    },


    /**
     * Removes the node at the given <code>index</code>
     * from the <code>parent</code>.
     *
     * @param index {Integer} position of the node which should be removed
     * @param parent {Element} parent DOM element
     * @return {Boolean} <code>true</code> when node was successfully removed,
     *   otherwise <code>false</code>
     */
    removeChildAt : function(index, parent)
    {
      var child = parent.childNodes[index];

      if (!child) {
        return false;
      }

      parent.removeChild(child);
      return true;
    },





    /*
    ---------------------------------------------------------------------------
      REPLACE
    ---------------------------------------------------------------------------
    */

    /**
     * Replaces <code>oldNode</code> with <code>newNode</code> in the current
     * parent of <code>oldNode</code>.
     *
     * @param newNode {Node} DOM node to insert
     * @param oldNode {Node} DOM node to remove
     * @return {Boolean} <code>true</code> when node was successfully replaced
     */
    replaceChild : function(newNode, oldNode)
    {
      if (!oldNode.parentNode) {
        return false;
      }

      oldNode.parentNode.replaceChild(newNode, oldNode);
      return true;
    },


    /**
     * Replaces the node at <code>index</code> with <code>newNode</code> in
     * the given parent.
     *
     * @param newNode {Node} DOM node to insert
     * @param index {Integer} position of old DOM node
     * @param parent {Element} parent DOM element
     * @return {Boolean} <code>true</code> when node was successfully replaced
     */
    replaceAt : function(newNode, index, parent)
    {
      var oldNode = parent.childNodes[index];

      if (!oldNode) {
        return false;
      }

      parent.replaceChild(newNode, oldNode);
      return true;
    },


    /**
     * Stores helper element for element creation in WebKit
     *
     * @internal
     */
    __helperElement : {},


    /**
     * Saves whether a helper element is needed for each window.
     *
     * @internal
     */
    __allowMarkup : {},

    /**
     * Detects if the DOM support a <code>document.createElement</code> call with a
     * <code>String</code> as markup like:
     *
     * <pre class="javascript">
     * document.createElement("<INPUT TYPE='RADIO' NAME='RADIOTEST' VALUE='Second Choice'>");
     * </pre>
     *
     * Element creation with markup is not standard compatible with Document Object Model (Core) Level 1, but
     * Internet Explorer supports it. With an exception that IE9 in IE9 standard mode is standard compatible and
     * doesn't support element creation with markup.
     *
     * @param win {Window?} Window to check for
     * @return {Boolean} <code>true</code> if the DOM supports it, <code>false</code> otherwise.
     */
    _allowCreationWithMarkup : function(win) {
      if (!win) {
        win = window;
      }

      // key is needed to allow using different windows
      var key = win.location.href;
      if (qx.dom.Element.__allowMarkup[key] == undefined)
      {
        try {
          win.document.createElement("<INPUT TYPE='RADIO' NAME='RADIOTEST' VALUE='Second Choice'>");
          qx.dom.Element.__allowMarkup[key] = true;
        } catch(e) {
          qx.dom.Element.__allowMarkup[key] = false;
        }
      }

      return qx.dom.Element.__allowMarkup[key];
    },


        /**
     * Creates and returns a DOM helper element.
     *
     * @param win {Window?} Window to create the element for
     * @return {Element} The created element node
     */
    getHelperElement : function (win)
    {
      if (!win) {
        win = window;
      }

      // key is needed to allow using different windows
      var key = win.location.href;

      if (!qx.dom.Element.__helperElement[key])
      {
        var helper = qx.dom.Element.__helperElement[key] = win.document.createElement("div");

        // innerHTML will only parsed correctly if element is appended to document
        if (qx.core.Environment.get("engine.name") == "webkit")
        {
          helper.style.display = "none";

          win.document.body.appendChild(helper);
        }
      }

      return qx.dom.Element.__helperElement[key];
    },


    /**
     * Creates a DOM element.
     *
     * Attributes may be given directly with this call. This is critical
     * for some attributes e.g. name, type, ... in many clients.
     *
     * Depending on the kind of attributes passed, <code>innerHTML</code> may be
     * used internally to assemble the element. Please make sure you understand
     * the security implications. See {@link qx.bom.Html#clean}.
     *
     * @param name {String} Tag name of the element
     * @param attributes {Map?} Map of attributes to apply
     * @param win {Window?} Window to create the element for
     * @return {Element} The created element node
     */
    create : function(name, attributes, win)
    {
      if (!win) {
        win = window;
      }

      if (!name) {
        throw new Error("The tag name is missing!");
      }

      var initial = this.__initialAttributes;
      var attributesHtml = "";

      for (var key in attributes)
      {
        if (initial[key]) {
          attributesHtml += key + "='" + attributes[key] + "' ";
        }
      }

      var element;

      // If specific attributes are defined we need to process
      // the element creation in a more complex way.
      if (attributesHtml != "")
      {
        if (qx.dom.Element._allowCreationWithMarkup(win)) {
          element = win.document.createElement("<" + name + " " + attributesHtml + ">");
        }
        else
        {
          var helper = qx.dom.Element.getHelperElement(win);

          helper.innerHTML = "<" + name + " " + attributesHtml + "></" + name + ">";
          element = helper.firstChild;
        }
      }
      else
      {
        element = win.document.createElement(name);
      }

      for (var key in attributes)
      {
        if (!initial[key]) {
          qx.bom.element.Attribute.set(element, key, attributes[key]);
        }
      }

      return element;
    },


    /**
     * Removes all content from the given element
     *
     * @param element {Element} element to clean
     * @return {String} empty string (new HTML content)
     */
    empty : function(element) {
      return element.innerHTML = "";
    }
  }
});
