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

/* ************************************************************************

#module(bom)

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
     * @type static
     * @param movie {String} URI to the movie
     * @param width {String|Integer} Width of the movie
     * @param height {String|Integer} Height of the movie
     * @param variables? {Map} Flash variable data (these are available in the movie later)
     * @param attribs? {Map} Flash attribute data
     * @param params? {Map} Flash parameter data
     * @return {Element} DOM element node with the Flash movie
     */
    create : function(movie, width, height, variables, attribs, params)
    {
      // Work on copies
      var attribs = attribs ? qx.lang.Object.copy(attribs) : {};
      var params = params ? qx.lang.Object.copy(params) : {};
      
      // Copy params into attributes
      attribs.data = movie;
      attribs.width = width;
      attribs.height = height;
      
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
                
      // Return element from cross-browser wrapper
      return this.__createSwf(attribs, params);
    },
    
    
    /** 
     * Creates a DOM element with a flash movie
     *
     * @type static
     * @param attribs {Map} Flash attribute data
     * @param params {Map} Flash parameter data
     * @return {Element} DOM element node with the Flash movie
     */
    __createSwf : qx.core.Variant.select("qx.client",
    {
      // Note: Old webkit support < 312 was removed.
      // This is not needed in qooxdoo.
            
      "mshtml" : function(attribs, params)
      {
        // Move data from params to attributes
        params.movie = attribs.data;
        delete attribs.data;
        
        // Cleanup classid
        delete attribs.classid;
  
        // Prepare attributes
        var attribsStr = "";
        for (name in attribs) {
          attribsStr += ' ' + name + '="' + attribs[name] + '"';
        }
  
        // Prepare parameters
        var paramsStr = "";
        for (name in params) {
          paramsStr += '<param name="' + name + '" value="' + params[name] + '" />';
        }
  
        // Create element
        // Note: outerHTML seems not to work for me. At least in IE7/WinVista
        var elem = qx.bom.Element.create("div");
        elem.innerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + attribsStr + '>' + paramsStr + '</object>';
        
        return elem.firstChild;
      },
      
      "default" : function(attribs, params)
      {
        var elem = qx.bom.Element.create("object");
        elem.setAttribute("type", "application/x-shockwave-flash");
        
        // Cleanup
        delete attribs.classid;
        delete params.movie;
  
        // Apply attributes
        for (var name in attribs) {
          elem.setAttribute(name, attribs[name]);
        }
  
        // Apply parameters
        var paramElem;
        for (var name in params) 
        {
          paramElem = document.createElement("param");
          paramElem.setAttribute("name", name);
          paramElem.setAttribute("value", params[value]);
          elem.appendChild(paramElem);
        }
        
        return elem;
      }
    })  
  }
});
