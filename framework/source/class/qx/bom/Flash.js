/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Christian Hagendorn (chris_schmidt)

   ======================================================================

   This class contains code based on the following work:

   * SWFFix
     http://code.google.com/p/swffix/
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
    /**
     * Saves the references to the flash objects to delete the flash objects
     * before the browser is closed. Note: it is only used in IE.
     */
    _flashObjects: {},

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
     * http://helpx.adobe.com/flash/kb/flash-object-embed-tag-attributes.html
     *
     * @param element {Element} Parent DOM element node to add flash movie
     * @param attributes {Map} attributes for the object tag like id or mayscript
     * @param variables {Map?null} Flash variable data (these are available in the movie later)
     * @param params {Map?null} Flash parameter data (these are used to configure the movie itself)
     * @param win {Window?null} Window to create the element for
     * @return {Element} The created Flash element
     */
    create : function(element, attributes, variables, params, win)
    {
      if (!win) {
        win = window;
      }

      //Check parameters and check if element for flash is in DOM, before call creates swf.
      if (qx.core.Environment.get("qx.debug"))
      {
        qx.core.Assert.assertElement(element, "Invalid parameter 'element'.");
        qx.core.Assert.assertMap(attributes, "Invalid parameter 'attributes'.");
        qx.core.Assert.assertString(attributes.movie, "Invalid attribute 'movie'.");
        qx.core.Assert.assertString(attributes.id, "Invalid attribute 'id'.");

        if (!qx.dom.Element.isInDom(element, win)) {
          qx.log.Logger.warn(this, "The parent DOM element isn't in DOM! The External Interface doesn't work in IE!");
        }
      }

      if (!attributes.width) {
        attributes.width  = "100%";
      }

      if (!attributes.height) {
        attributes.height = "100%";
      }

      // Work on param copy
      params = params ? qx.lang.Object.clone(params) : {};

      if (!params["movie"]) {
        params["movie"] = attributes.movie;
      }

      attributes["data"] = attributes.movie;
      delete attributes.movie;

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
      var flash = this.__createSwf(element, attributes, params, win);
      this._flashObjects[attributes.id] = flash;

      return flash;
    },


    /**
     * Destroys the flash object from DOM, but not the parent DOM element.
     *
     * Note: Removing the flash object like this:
     * <pre>
     *  var div = qx.dom.Element.create("div");
     *  document.body.appendChild(div);
     *
     *  var flashObject = qx.bom.Flash.create(div, { movie : "Flash.swf", id : "id" });
     *  div.removeChild(div.firstChild);
     * </pre>
     * involve memory leaks in Internet Explorer.
     *
     * @param element {Element} Either the DOM element that contains
     *              the flash object or the flash object itself.
     * @param win {Window?} Window that the element, which is to be destroyed,
                    belongs to.
     * @signature function(element, win)
     */
    destroy : function(element, win) {
      if (qx.core.Environment.get("engine.name") == "mshtml" &&
        qx.core.Environment.get("browser.documentmode") < 11)
      {
        element = this.__getFlashObject(element);

        if (element.readyState == 4) {
          this.__destroyObjectInIE(element);
        }
        else
        {
          if (!win) {
            win = window;
          }

          qx.bom.Event.addNativeListener(win, "load", function() {
            qx.bom.Flash.__destroyObjectInIE(element);
          });
        }
      } else {
        element = this.__getFlashObject(element);

        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }

        delete this._flashObjects[element.id];
      }
    },


    /**
     * Return the flash object element from DOM node.
     *
     * @param element {Element} The element to look.
     * @return {Element} Flash object element
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
     * @signature function(element)
     * @param element {Element} Flash object element to destroy.
     */
    __destroyObjectInIE : qx.core.Environment.select("engine.name",
    {
      "mshtml" : qx.event.GlobalError.observeMethod(function(element)
      {
        for (var i in element)
        {
          if (typeof element[i] == "function") {
            element[i] = null;
          }
        }

        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        delete this._flashObjects[element.id];
      }),

      "default" : null
    }),

    /**
     * Internal helper to prevent leaks in IE
     *
     * @signature function()
     */
    __fixOutOfMemoryError : qx.event.GlobalError.observeMethod(function()
    {
      // IE Memory Leak Fix
      for (var key in qx.bom.Flash._flashObjects) {
        qx.bom.Flash.destroy(qx.bom.Flash._flashObjects[key]);
      }

      window.__flash_unloadHandler = function() {};
      window.__flash_savedUnloadHandler = function() {};

      // Remove listener again
      qx.bom.Event.removeNativeListener(window, "beforeunload", qx.bom.Flash.__fixOutOfMemoryError);
    }),


    /**
     * Creates a DOM element with a flash movie.
     *
     * @param element {Element} DOM element node where the Flash element node will be added.
     * @param attributes {Map} Flash attribute data.
     * @param params {Map} Flash parameter data.
     * @param win {Window} Window to create the element for.
     * @signature function(element, attributes, params, win)
     */
    __createSwf : function(element, attributes, params, win) {
      if (qx.core.Environment.get("engine.name") == "mshtml" &&
        qx.core.Environment.get("browser.documentmode") < 11)
      {
        // Move data from params to attributes
        params.movie = attributes.data;
        delete attributes.data;

        // Cleanup classid
        delete attributes.classid;

        // Prepare parameters
        var paramsStr = "";
        for (var name in params) {
          paramsStr += '<param name="' + name + '" value="' + params[name] + '" />';
        }

        // Create element, but set attribute "id" first and not later.
        if (attributes.id)
        {
          element.innerHTML = '<object id="' + attributes.id +
            '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">' +
            paramsStr + '</object>';
          delete attributes.id;
        } else {
          element.innerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">' + paramsStr + '</object>';
        }

        // Apply attributes
        for (var name in attributes) {
          // IE doesn't like dollar signs in attribute names.
          if (name.substring(0, 1) == "$") {
          	element.firstChild[name] = attributes[name];
          } else {
            element.firstChild.setAttribute(name, attributes[name]);
          }
        }

        return element.firstChild;
      }

      // Cleanup
      delete attributes.classid;
      delete params.movie;

      var swf = qx.dom.Element.create("object", attributes, win);
      swf.setAttribute("type", "application/x-shockwave-flash");

      // Add parameters
      var param;
      for (var name in params)
      {
        param = qx.dom.Element.create("param", {}, win);
        param.setAttribute("name", name);
        param.setAttribute("value", params[name]);
        swf.appendChild(param);
      }

      element.appendChild(swf);

      return swf;
    }
  },

  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    if (qx.core.Environment.get("engine.name") == "mshtml") {
      qx.bom.Event.addNativeListener(window, "beforeunload", statics.__fixOutOfMemoryError);
    }
  }
});
