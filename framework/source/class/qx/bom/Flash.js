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
     * @param movie {String} URI to the movie
     * @param variables? {Map} Flash variable data (these are available in the movie later)
     * @param params? {Map} Flash parameter data (these are used to configure the movie itself)
     * @param win {Window} Window to create the element for
     * @return {Element} DOM element node with the Flash movie
     */
    create : function(movie, variables, params, win)
    {
      // Generates attributes for flash movie
      var attributes =
      {
        data : movie,
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
      var swf = this.__createSwf(attributes, params, win);

      // Objects do not allow styling well. We create a DIV wrapper around.
      var frame = qx.bom.Element.create("div", win);
      frame.appendChild(swf);

      // Return element from cross-browser wrapper
      return frame;
    },


    /**
     * Internal helper to prevent leaks in IE
     *
     * @return {void}
     */
    __fixOutOfMemoryError : function()
    {
      // IE Memory Leak Fix
      window.__flash_unloadHandler = function() {};
      window.__flash_savedUnloadHandler = function() {};

      // Remove listener again
      window.detachEvent("onbeforeunload", qx.bom.Flash.__fixOutOfMemoryError);
    },


    /**
     * Creates a DOM element with a flash movie
     *
     * @param attributes {Map} Flash attribute data
     * @param params {Map} Flash parameter data
     * @return {Element} DOM element node with the Flash movie
     */
    __createSwf : qx.core.Variant.select("qx.client",
    {
      // Note: Old webkit support < 312 was removed.
      // This is not needed in qooxdoo.

      "mshtml" : function(attributes, params, win)
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
        // Note: outerHTML seems not to work for me. At least in IE7/WinVista
        var elem = qx.bom.Element.create("div", null, win);
        elem.innerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">' + paramsStr + '</object>';

        // Extract relevant node
        var swf = elem.firstChild;

        // Apply attributes
        delete attributes.classid;
        for (var name in attributes) {
          swf.setAttribute(name, attributes[name]);
        }

        return swf;
      },

      "default" : function(attributes, params, win)
      {
        var swf = qx.bom.Element.create("object", attributes, win);
        swf.setAttribute("type", "application/x-shockwave-flash");

        // Cleanup
        delete attributes.classid;
        delete params.movie;

        // Apply attributes
        for (var name in attributes) {
          swf.setAttribute(name, attributes[name]);
        }

        // Add parameters
        var param;
        for (var name in params)
        {
          param = document.createElement("param");
          param.setAttribute("name", name);
          param.setAttribute("value", params[name]);
          swf.appendChild(param);
        }

        return swf;
      }
    })
  },

  defer : function(statics)
  {
    if (qx.core.Variant.isSet("qx.client", "mshtml")) {
      window.attachEvent("onbeforeunload", statics.__fixOutOfMemoryError);
    }
  }
});
