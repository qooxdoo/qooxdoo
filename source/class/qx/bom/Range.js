/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */



/**
 * Low-level Range API which is used together with the low-level Selection API.
 * This is especially useful whenever a developer want to work on text level,
 * e.g. for an editor.
 */
qx.Bootstrap.define("qx.bom.Range",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Returns the range object of the given node.
     *
     * @signature function(node)
     * @param node {Node} node to get the range of
     * @return {Range} valid range of given selection
     */
    get : qx.core.Environment.select("html.selection",
    {
      "selection" : function(node)
      {
        // check for the type of the given node
        // for legacy IE the nodes input, textarea, button and body
        // have access to own TextRange objects. Everything else is
        // gathered via the selection object.
        if (qx.dom.Node.isElement(node))
        {
          switch(node.nodeName.toLowerCase())
          {
            case "input":

              switch(node.type)
              {
                case "text":
                case "password":
                case "hidden":
                case "button":
                case "reset":
                case "file":
                case "submit":
                  return node.createTextRange();

                default:
                  return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node)).createRange();
              }
            break;

            case "textarea":
            case "body":
            case "button":
              return node.createTextRange();

            default:
              return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node)).createRange();
          }
        }
        else
        {
          if (node == null) {
            node = window;
          }

          // need to pass the document node to work with multi-documents
          return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node)).createRange();
        }
      },

      // suitable for gecko, opera and webkit
      "default" : function(node)
      {
        var doc = qx.dom.Node.getDocument(node);

        // get the selection object of the corresponding document
        var sel = qx.bom.Selection.getSelectionObject(doc);

        if (sel.rangeCount > 0)
        {
          return sel.getRangeAt(0);
        }
        else
        {
          return doc.createRange();
        }
      }
    })
  }
});
