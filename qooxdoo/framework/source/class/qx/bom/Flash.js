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
     * Christian Schmidt (chris_schmidt)

   ======================================================================

   This class contains code based on the following work:

   * SWFFix
     http://www.swffix.org
     Version 0.3 (r17)

     Copyright:
       (c) 2007 SWFFix developers

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Geoff Stearns
       * Michael Williams
       * Bobby van der Sluis

************************************************************************ */

/**
 * Flash(TM) embed via script
 *
 * Include:
 *
 * * Simple movie embedding (returning a cross-browser working DOM node)
 * * Support for custom parameters and attributes
 * * Support for Flash(TM) variables
 *
 * Does not include the following features from SWFFix:
 *
 * * Active content workarounds for already inserted movies (via markup)
 * * Express install support
 * * Transformation of standard conformance markup to cross browser support
 * * Support for alternative content (alt text)
 */
qx.Class.define("qx.bom.Flash",
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

    /**
     * Creates an DOM element
     *
     * The dimension of the movie should define through CSS styles {@link qx.bom.element.Style}
     *
     * It is possible to add these parameters as supported by Flash movies:
     * http://kb.adobe.com/selfservice/viewContent.do?externalId=tn_12701
     *
     * @param element {Element} Parent DOM element node to add flash movie
     * @param movie {String} URI to the movie
     * @param id {String} Id for the flash element
     * @param variables? {Map} Flash variable data (these are available in the movie later)
     * @param params? {Map} Flash parameter data (these are used to configure the movie itself)
     * @param win {Window} Window to create the element for
     * @return {void}
     */
    create : function(element, movie, id, variables, params, win)
    {
      if (!win) {
        win = window;
      }
      
      //Check parametes and check if element for flash is in DOM, befor call create swf. 
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        qx.core.Assert.assertElement(element, "Invalid parameter 'element'.");
        qx.core.Assert.assertString(movie, "Invalid parameter 'movie'.");
        qx.core.Assert.assertString(id, "Invalid parameter 'id'.");        
        
        if (!qx.dom.Element.isInDom(element, win)) {
          qx.log.Logger.warn(this, "The parent DOM element isn't in DOM! The External Interface doesn't work in IE!");
        }
      }
      
      // Generates attributes for flash movie
      var attributes =
      {
        data : movie,
        id : id,
        width : "100%",
        height : "100%"
      };

      // Work on param copy
      var params = params ? qx.lang.Object.copy(params) : {};

      // Copy over variables (into params)
      if (variables)
      {
        for (var name in variables)
        {
          if (typeof params.flashvars != "undefined") {
            params.flashvars += "&" + name + "=" + variables[name];
          } else {
            params.flashvars = name + "=" + variables[name];
          }
        }
      }

      // Finally create the SWF
      this.__createSwf(element, attributes, params, win);
    },

    
    /**
     * Destroys the flash object from DOM, but not the parent DOM element.
     *  
     * Note: Removing the flash object like this: 
     * <pre>
     *  var div = qx.bom.Element.create("div");
     *  document.body.appendChild(div);
     *  
     *  var flashObject = qx.bom.Flash.create(div, "Flash.swf", "id");
     *  div.removeChild(div.firstChild);
     * </pre>
     * involve memory leaks in Internet Explorer.
     * 
     * @param element {Element} The DOM element that contain 
     *              the flash object or the flash object self.
     * @param win {Window} Window to destroy the element for.
     * @return {void}
     * @signature function(element, win)
     */
    destroy : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element, win)
      {
        element = this.__getFlashObject(element); 
        
        if (element.readyState == 4) {
          this.__destroyObjectInIE(element);
        }
        else {
          win.attachEvent("onload", function() {
            this.__destroyObjectInIE(element);
          });
        }      
      },
      
      "default" : function(element, win) {
        element = this.__getFlashObject(element); 
        element.parentNode.removeChild(element);
      }
    }),
    
    /**
     * Return the flash object element from DOM node.
     * 
     * @param element {Element} The element to look. 
     * @return {void}
     */
    __getFlashObject : function(element)
    {
      if (!element) {
        throw new Error("DOM element is null or undefined!");
      }
      
      if (element.tagName.toLowerCase() !== "object") {
        element = element.firstChild;
      }
      
      if (!element || element.tagName.toLowerCase() !== "object") {
        throw new Error("DOM element has or is not a flash object!");
      }
      
      return element;
    },
    
    /**
     * Destroy the flash object and remove from DOM, to fix memory leaks.
     * 
     * @param element {Element} Flash object element to destroy.
     * @return {void}
     * @signature function(element)
     */
    __destroyObjectInIE : qx.core.Variant.select("qx.client",
    {
      "mshtml" :  function(element) {
        for (var i in element) {
          if (typeof element[i] == "function") {
            element[i] = null;
          }
        }
        element.parentNode.removeChild(element);
      },
      
      "default" : null
    }),
    
    /**
     * Internal helper to prevent leaks in IE
     *
     * @return {void}
     */
    __fixOutOfMemoryError : function()
    {
      //TODO: Cleanup flash objects onbeforeunload

      // IE Memory Leak Fix
      window.__flash_unloadHandler = function() {};
      window.__flash_savedUnloadHandler = function() {};

      // Remove listener again
      window.detachEvent("onbeforeunload", qx.bom.Flash.__fixOutOfMemoryError);
    },


    /**
     * Creates a DOM element with a flash movie.
     *
     * @param element {Element} DOM element node where the Flash element node will be added.
     * @param attributes {Map} Flash attribute data.
     * @param params {Map} Flash parameter data.
     * @param win {Window} Window to create the element for.
     * @signature function(element, attributes, params, win)
     */
    __createSwf : qx.core.Variant.select("qx.client",
    {
      // Note: Old webkit support < 312 was removed.
      // This is not needed in qooxdoo.

      "mshtml" : function(element, attributes, params, win)
      {
        // Move data from params to attributes
        params.movie = attributes.data;
        delete attributes.data;

        // Cleanup classid
        delete attributes.classid;

        // Prepare parameters
        var paramsStr = "";
        for (name in params) {
          paramsStr += '<param name="' + name + '" value="' + params[name] + '" />';
        }

        // Create element
        element.innerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">' + paramsStr + '</object>';

        // Apply attributes
        for (var name in attributes) {
          element.firstChild.setAttribute(name, attributes[name]);
        }
      },

      "default" : function(element, attributes, params, win)
      {
        // Cleanup
        delete attributes.classid;
        delete params.movie;
        
        var swf = qx.bom.Element.create("object", attributes, win);
        swf.setAttribute("type", "application/x-shockwave-flash");

        // Add parameters
        var param;
        for (var name in params)
        {
          param = document.createElement("param");
          param.setAttribute("name", name);
          param.setAttribute("value", params[name]);
          swf.appendChild(param);
        }

        element.appendChild(swf)
      }
    })
  },

  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */
  
  defer : function(statics)
  {
    if (qx.core.Variant.isSet("qx.client", "mshtml")) {
      window.attachEvent("onbeforeunload", statics.__fixOutOfMemoryError);
    }
  }
});
