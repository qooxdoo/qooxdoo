/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

   ======================================================================

   This class contains code based on the following work:

   * Prototype JS
     http://www.prototypejs.org/
     Version 1.5

     Copyright:
       (c) 2006-2007, Prototype Core Team

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Prototype Core Team


************************************************************************ */

/* ************************************************************************

#module(html2)

************************************************************************ */

/**
 * High performance DOM element interaction.
 */
qx.Class.define("qx.html2.element.Util",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Creates an DOM element
     *
     * @type static
     * @param name {String} Tag name of the element
     * @param xhtml {Boolean ? false} Enable XHTML
     * @return {Element} the created element node
     */
    createElement : function(name, xhtml)
    {
      if (xhtml) {
        return document.createElementNS("http://www.w3.org/1999/xhtml", name);
      } else {
        return document.createElement(name);
      }
    },


    /**
     * Whether the given node is a DOM element
     *
     * @type static
     * @param node {Node} the node which should be tested
     * @return {Boolean} true if the node is a DOM element
     */
    isElement : function(node) {
      return !!(node && node.nodeType === qx.dom.Node.ELEMENT);
    },


    /**
     * Whether the given node is a document
     *
     * @type static
     * @param node {Node} the node which should be tested
     * @return {Boolean} true when the node is a document
     */
    isDocument : function(node) {
      return !!(node && node.nodeType === qx.dom.Node.DOCUMENT);
    }
  }
});
