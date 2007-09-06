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

************************************************************************ */

/* ************************************************************************

#module(bom)

************************************************************************ */

/**
 *
 */
qx.Class.define("qx.bom.Element",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      CREATION
    ---------------------------------------------------------------------------
    */
    
    __specialAttributes :
    {
      "onload" : true,
      "onunload" : true,
      "onbeforeunload" : true,
      "onreadystatechange" : true,
      "name" : true,
      "type" : true,
      "checked" : true
    },
    
    
    /**
     * Creates an DOM element.
     *
     * Attributes may be given directly with this call. This is critical
     * for some attributes e.g. name, type, ... in many clients.
     *
     * @type static
     * @param name {String} Tag name of the element
     * @param attributes {Map} Map of attributes to apply
     * @param win {Window} Window to create document for
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
      
      var special = this.__specialAttributes;
      var attributesHtml = "";
      
      for (var key in attributes) 
      {
        if (special[key]) {
          attributesHtml += key + "='" + attributes[key] + "' "; 
        }
      }
      
      var element;

      // If specific attributes are defined we need to process
      // the element creation in a more complex way.
      if (attributesHtml != "")
      {
        // Internet Explorer supports attribute within createElement()
        // This is not standard, but a welcome addition here.
        if (qx.bom.client.Engine.MSHTML)
        {
          element = win.document.createElement("<" + name + " " + attributesHtml + ">");
        }
        
        // Other browsers create an helper element to put some generated HTML 
        // into it and extract the interesting content via 'firstChild'
        else
        {
          var helper = win.document.createElement("div");
          helper.innerHTML = "<" + name + " " + attributesHtml + "></" + name + ">";
          element = helper.firstChild;
        }
      }
      else
      {      
        if (win.document.createElementNS) {
          element = win.document.createElementNS("http://www.w3.org/1999/xhtml", name);
        } else {
          element = win.document.createElement(name);
        }
      }
      
      for (var key in attributes) 
      {
        if (!special[key]) {
          qx.bom.element.Attribute.set(element, key, attributes[key]);
        }
      }
      
      return element;
    },


    /**
     * Removes all content from the given element
     *
     * @type static
     * @param element {Element} element to clean
     * @return {String} empty string (new HTML content)
     */
    empty : function(element) {
      return element.innerHTML = "";
    }
  }
});
