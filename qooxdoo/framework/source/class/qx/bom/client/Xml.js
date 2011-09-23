/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */
/**
 * Internal class which contains the checks used by {@link qx.core.Environment}.
 * All checks in here are marked as internal which means you should never use
 * them directly.
 *
 * This class should contain all XML-related checks
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Xml",
{
  statics:
  {
    /**
     * Checks if XML is supported
     * 
     * @internal
     * @return {Boolean} <code>true</code> if XML is supported
     */
    getImplementation : function() {
      return document.implementation && document.implementation.hasFeature &&
        document.implementation.hasFeature("XML", "1.0");
    },


    /**
     * Checks if an XML DOMParser is available
     * 
     * @internal
     * @return {Boolean} <code>true</code> if DOMParser is supported
     */
    getDomParser : function() {
      return typeof window.DOMParser !== "undefined";
    },


    /**
     * Checks if the proprietary selectSingleNode method is available on XML DOM
     * nodes.
     * 
     * @internal
     * @return {Boolean} <code>true</code> if selectSingleNode is available
     */
    getSelectSingleNode : function()
    {
      return typeof qx.xml.Document.create().selectSingleNode !== "undefined";
    },


    /**
     * Checks if the proprietary selectNodes method is available on XML DOM
     * nodes.
     * 
     * @internal
     * @return {Boolean} <code>true</code> if selectSingleNode is available
     */
    getSelectNodes : function()
    {
      return typeof qx.xml.Document.create().selectNodes !== "undefined";
    }
  },
  
  defer : function(statics)
  {
    qx.core.Environment.add("xml.implementation", statics.getImplementation);
    qx.core.Environment.add("xml.domparser", statics.getDomParser);
    qx.core.Environment.add("xml.selectsinglenode", statics.getSelectSingleNode);
    qx.core.Environment.add("xml.selectnodes", statics.getSelectNodes);
  }
});