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
     * Alexander Back (aback)

************************************************************************ */



/**
 * Low-level selection API to select elements like input and textarea elements
 * as well as text nodes or elements which their child nodes.
 */
qx.Class.define("qx.bom.Selection",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Returns the native selection object.
     *
     * @signature documentNode {document} Document node to retrieve the connected selection
     * @param {Object} documentNode
     * @return {Selection} native selection object
     */
    getSelectionObject : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(documentNode) {
        return documentNode.selection;
      },

      // suitable for gecko, opera and webkit
      "default" : function(documentNode) {
        return qx.dom.Node.getWindow(documentNode).getSelection();
      }
    }),


    /**
     * Returns the current selected text.
     *
     * @signature function(node)
     * @param node {Node} node to retrieve the selection for
     * @return {String?null) selected text as string
     */
    get : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(node)
      {
        // to get the selected text in IE you have to work with the TextRange
        // of the selection object. So always pass the document node to the
        // Range class to get this TextRange object.
        var rng = qx.bom.Range.get(qx.dom.Node.getDocument(node));
        return rng.text;
      },

      // suitable for gecko, opera and webkit
      "default" : function(node)
      {
        if (qx.dom.Node.isElement(node) && (node.nodeName.toLowerCase() == "input" || node.nodeName.toLowerCase() == "textarea"))
        {
          return node.value.substring(node.selectionStart, node.selectionEnd);
        }
        else
        {
          return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node)).toString();
        }

        return null;
      }
    }),


    /**
     * Returns the length of the selection
     *
     * @signature function(node)
     * @param node {node} Form node or document/window to check.
     * @return {Integer|null} length of the selection or null
     */
    getLength : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(node)
      {
        var selectedValue = qx.bom.Selection.get(node);
        // get the selected part and split it by linebreaks
        var split = qx.util.StringSplit.split(selectedValue, /\r\n/);

        // return the length substracted by the count of linebreaks
        // IE counts linebreaks as two chars
        // -> harmonize this to one char per linebreak
        return selectedValue.length - (split.length - 1);
      },

      "opera" : function(node)
      {
        var selectedValue, selectedLength, split;

        if (qx.dom.Node.isElement(node) && (node.nodeName.toLowerCase() == "input" || node.nodeName.toLowerCase() == "textarea"))
        {
          var start = node.selectionStart;
          var end   = node.selectionEnd;

          selectedValue  = node.value.substring(start, end);
          selectedLength = end - start;
        }
        else
        {
          selectedValue  = qx.bom.Selection.get(node);
          selectedLength = selectedValue.length;
        }

        // get the selected part and split it by linebreaks
        split = qx.util.StringSplit.split(selectedValue, /\r\n/);

        // substract the count of linebreaks
        // Opera counts each linebreak as two chars
        // -> harmonize this to one char per linebreak
        return selectedLength - (split.length - 1);
      },

      // suitable for gecko and webkit
      "default" : function(node)
      {
        if (qx.dom.Node.isElement(node) && (node.nodeName.toLowerCase() == "input" || node.nodeName.toLowerCase() == "textarea")) {
          return node.selectionEnd - node.selectionStart;
        } else {
          return qx.bom.Selection.get(node).length;
        }

        return null;
      }
    }),


    /**
     * Sets a selection at the given node with the given start and end.
     * For text nodes, input and textarea elements the start and end parameters
     * set the boundaries at the text.
     * For element nodes the start and end parameters are used to select the
     * childNodes of the given element.
     *
     * @signature function(node, start, end)
     * @param node {Node} node to set the selection at
     * @param start {Integer} start of the selection
     * @param end {Integer} end of the selection
     * @return {Boolean} whether a selection is drawn
     */
    set : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(node, start, end)
      {
        var rng;

        // if the node is the document itself then work on with the body element
        if (qx.dom.Node.isDocument(node))
        {
          node = node.body;
        }

        if (qx.dom.Node.isElement(node) || qx.dom.Node.isText(node))
        {
          switch(node.nodeName.toLowerCase())
          {
            case "input":
            case "textarea":
            case "button":
              if (end === undefined)
              {
                end = node.value.length;
              }

              if (start >= 0 && start <= node.value.length && end >= 0 && end <= node.value.length)
              {
                rng = qx.bom.Range.get(node);
                rng.collapse(true);

                rng.moveStart("character", start);
                rng.moveEnd("character", end);
                rng.select();

                return true;
              }
              break;

            case "#text":
              if (end === undefined)
              {
                end = node.nodeValue.length;
              }

              if (start >= 0 && start <= node.nodeValue.length && end >= 0 && end <= node.nodeValue.length)
              {
                // get a range of the body element
                rng = qx.bom.Range.get(qx.dom.Node.getBodyElement(node));

                // use the parent node -> "moveToElementText" expects an element
                rng.moveToElementText(node.parentNode);
                rng.collapse(true);

                rng.moveStart("character", start);
                rng.moveEnd("character", end);
                rng.select();

                return true;
              }
              break;

            default:
              if (end === undefined)
              {
                end = node.childNodes.length - 1;
              }

             // check start and end -> childNodes
             if (node.childNodes[start] && node.childNodes[end])
             {
               // get the TextRange of the body element
               // IMPORTANT: only with a range of the body the method "moveElementToText" is available
               rng = qx.bom.Range.get(qx.dom.Node.getBodyElement(node));
               // position it at the given node
               rng.moveToElementText(node.childNodes[start]);
               rng.collapse(true);

               // create helper range
               var newRng = qx.bom.Range.get(qx.dom.Node.getBodyElement(node));
               newRng.moveToElementText(node.childNodes[end]);

               // set the end of the range to the end of the helper range
               rng.setEndPoint("EndToEnd", newRng);
               rng.select();

               return true;
             }
          }
        }

        return false;
      },

      // suitable for gecko, opera and webkit
      "default" : function(node, start, end)
      {
        // special handling for input and textarea elements
        var nodeName = node.nodeName.toLowerCase();
        if (qx.dom.Node.isElement(node) && (nodeName == "input" || nodeName == "textarea"))
        {
          // if "end" is not given set it to the end
          if (end === undefined)
          {
            end = node.value.length;
          }

          // check boundaries
          if (start >= 0 && start <= node.value.length && end >= 0 && end <= node.value.length)
          {
            node.select();
            node.setSelectionRange(start, end);
            return true;
          }
        }
        else
        {
          var validBoundaries = false;
          var sel = qx.dom.Node.getWindow(node).getSelection();

          var rng = qx.bom.Range.get(node);

          // element or text node?
          // for elements nodes the offsets are applied to childNodes
          // for text nodes the offsets are applied to the text content
          if (qx.dom.Node.isText(node))
          {
            if (end === undefined) {
              end = node.length;
            }

            if (start >= 0 && start < node.length && end >= 0 && end <= node.length) {
              validBoundaries = true;
            }
          }
          else if (qx.dom.Node.isElement(node))
          {
            if (end === undefined) {
              end = node.childNodes.length - 1;
            }

            if (start >= 0 && node.childNodes[start] && end >= 0 && node.childNodes[end]) {
              validBoundaries = true;
            }
          }
          else if (qx.dom.Node.isDocument(node))
          {
            // work on with the body element
            node = node.body;

            if (end === undefined) {
              end = node.childNodes.length - 1;
            }

            if (start >= 0 && node.childNodes[start] && end >= 0 && node.childNodes[end]) {
              validBoundaries = true;
            }
          }

          if (validBoundaries)
          {
            // collapse the selection if needed
            if (!sel.isCollapsed) {
             sel.collapseToStart();
            }

            // set start and end of the range
            rng.setStart(node, start);

            // for element nodes set the end after the childNode
            if (qx.dom.Node.isText(node)) {
              rng.setEnd(node, end);
            } else {
              rng.setEndAfter(node.childNodes[end]);
            }

            // remove all existing ranges and add the new one
            if (sel.rangeCount > 0) {
              sel.removeAllRanges();
            }

            sel.addRange(rng);

            return true;
          }
        }

        return false;
      }
    }),


    /**
     * Selects all content/childNodes of the given node
     *
     * @param node {Node} text, element or document node
     * @return {Boolean} whether a selection is drawn
     */
    setAll : function(node) {
      return qx.bom.Selection.set(node, 0);
    },


    /**
     * Clears the selection on the given node.
     *
     * @param node {Node} node to clear the selection for
     * @return {void}
     */
    clear : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(node)
      {
        var sel = qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node));
        var rng = qx.bom.Range.get(node);
        var parent = rng.parentElement();

        var documentRange = qx.bom.Range.get(qx.dom.Node.getDocument(node));

        // only collapse if the selection is really on the given node
        // -> compare the two parent elements of the ranges with each other and
        // the given node
        if (parent == documentRange.parentElement() && parent == node) {
          sel.empty();
        }
      },

      "default" : function(node)
      {
        var sel = qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node));
        var nodeName = node.nodeName.toLowerCase();

        // if the node is an input or textarea element use the specialized methods
        if (qx.dom.Node.isElement(node) && (nodeName == "input" || nodeName == "textarea"))
        {
          // TODO: this leads Webkit to also focus the input/textarea element
          // which is NOT desired.
          // Additionally there is a bug in webkit with input/textarea elements
          // concerning the native selection and range object.
          // -> getting e.g. the startContainer/endContainer of the range returns
          // the text element (as expected) but webkit does embed this text node
          // into a lonely DIV element, so there us no chance to check if the
          // selection is currently at the input/textarea element to only perform
          // the "setSelectionRange" in the case the given node is REALLY selected.
          // Webkit bugzilla: https://bugs.webkit.org/show_bug.cgi?id=15903
          // qooxdoo bugzilla: http://bugzilla.qooxdoo.org/show_bug.cgi?id=1087
          node.setSelectionRange(0, 0);
          qx.bom.Element.blur(node);
        }
        // if the given node is the body/document node -> collapse the selection
        else if (qx.dom.Node.isDocument(node) || nodeName == "body")
        {
          sel.collapse(node.body ? node.body : node, 0);
        }
        // if an element/text node is given the current selection has to
        // encompass the node. Only then the selection is cleared.
        else
        {
          var rng = qx.bom.Range.get(node);
          if (!rng.collapsed)
          {
            var compareNode;
            var commonAncestor = rng.commonAncestorContainer;

            // compare the parentNode of the textNode with the given node
            // (if this node is an element) to decide whether the selection
            // is cleared or not.
            if (qx.dom.Node.isElement(node) && qx.dom.Node.isText(commonAncestor)) {
              compareNode = commonAncestor.parentNode;
            } else {
              compareNode = commonAncestor;
            }

            if (compareNode == node) {
              sel.collapse(node,0);
            }
          }
        }
      }
    })
  }
});