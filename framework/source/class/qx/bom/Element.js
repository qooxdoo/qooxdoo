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

/* ************************************************************************

#require(qx.event.dispatch.Direct)
#require(qx.event.dispatch.DomBubbling)
#require(qx.event.handler.Keyboard)
#require(qx.event.handler.Mouse)
#require(qx.event.handler.DragDrop)
#require(qx.event.handler.Element)
#require(qx.event.handler.Appear)

************************************************************************ */

/**
 * This class is mainly a convenience wrapper for DOM elements to
 * qooxdoo's event system.
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

    /** {Map} A list of all attributes which needs to be part of the initial element to work correctly */
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
     * Creates an DOM element.
     *
     * Attributes may be given directly with this call. This is critical
     * for some attributes e.g. name, type, ... in many clients.
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
    },
    
    
    /**
     * Fixes incoming HTML markup and fix for XHTML compatibility.
     *
     * This method fixes tags which are not allowed to be directly
     * closed like <code>div</code> or <code>p</code>. They are patched
     * to use an open and close tag instead e.g.
     * <code><p></code> => <code><p></p></code>
     *
     * @param html {String} Incoming markup
     * @return {String} XHTML corrected markup
     */
    __fixNonDirectlyClosable : function(html) {
      return html.replace(/(<(\w+)[^>]*?)\/>/g, this.__fixNonDirectlyClosableHelper);      
    },
    
    
    /**
     * Helper method for XHTML replacement.
     *
     * @param all {String} Complete string
     * @param front {String} Front of the match
     * @param tag {String} Tag name
     * @return {String} XHTML corrected tag
     */
    __fixNonDirectlyClosableHelper : function(all, front, tag)
    {
      return tag.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i) ?
        all : front + "></" + tag + ">";
    },
    
    
    /**
     * Translates a HTML string into an array of elements.
     *
     * @param html {String} HTML string
     * @param context {Document} Context document in which (helper) elements should be created
     * @return {Array} List of resulting elements
     */
    __convertHtmlString : function(elem, context)
    {
      var div=context.createElement("div");
      
      // Fix "XHTML"-style tags in all browsers
      elem = this.__fixNonDirectlyClosable(elem);

      // Trim whitespace, otherwise indexOf won't work as expected
      var tags = elem.replace(/^\s+/, "").substring(0, 10).toLowerCase();

      var wrap =
        // option or optgroup
        !tags.indexOf("<opt") && [ 1, "<select multiple='multiple'>", "</select>" ] ||
        
        !tags.indexOf("<leg") && [ 1, "<fieldset>", "</fieldset>" ] ||
        tags.match(/^<(thead|tbody|tfoot|colg|cap)/) && [ 1, "<table>", "</table>" ] ||
        !tags.indexOf("<tr") && [ 2, "<table><tbody>", "</tbody></table>" ] ||

        // <thead> matched above
        (!tags.indexOf("<td") || !tags.indexOf("<th")) && [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ] ||
        !tags.indexOf("<col") && [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ] ||

        // IE can't serialize <link> and <script> tags normally
        qx.core.Variant.isSet("qx.client", "mshtml") && [ 1, "div<div>", "</div>" ] ||

        [ 0, "", "" ];

      // Go to html and back, then peel off extra wrappers
      div.innerHTML = wrap[1] + elem + wrap[2];

      // Move to the right depth
      while (wrap[0]--) {
        div = div.lastChild;
      }
      
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        // Remove IE's autoinserted <tbody> from table fragments
        // String was a <table>, *may* have spurious <tbody>
        var hasBody = /<tbody/i.test(elem);
        
        // String was a bare <thead> or <tfoot>
        var tbody = !tags.indexOf("<table") && !hasBody ? div.firstChild && div.firstChild.childNodes : wrap[1] == "<table>" && !hasBody ? div.childNodes : [];

        for ( var j = tbody.length - 1; j >= 0 ; --j ) 
        {
          if (tbody[j].tagName.toLowerCase() === "tbody" && !tbody[j].childNodes.length) {
            tbody[j].parentNode.removeChild(tbody[j]);
          }
        }

        // IE completely kills leading whitespace when innerHTML is used
        if (/^\s/.test(elem)) {
          div.insertBefore(context.createTextNode(elem.match(/^\s*/)[0] ), div.firstChild);
        }
      }

      return qx.lang.Array.fromCollection(div.childNodes); 
    },
    
    
    /**
     * Cleans-up the given HTML and append it to a fragment
     *
     * When no <code>context</code> is given the global document is used to
     * create new DOM elements.
     *
     * When a <code>fragment</code> is given the nodes are appended to this
     * fragment except the script tags. These are returned in a seperate Array.
     *
     * @param objs {Element[]|String[]} Array of DOM elements or HTML strings
     * @param context {Document?document} Context in which the elements should be created
     * @param fragment {Element?null} Document fragment to appends elements to
     * @return {Element[]} Array of elements (when a fragment is given it only contains script elements)
     */
    clean: function(objs, context, fragment) 
    {
      context = context || document;
  
      // !context.createElement fails in IE with an error but returns typeof 'object'
      if (typeof context.createElement === "undefined") {
        context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
      }
  
      // Fast-Path:
      // If a single string is passed in and it's a single tag
      // just do a createElement and skip the rest
      if (!fragment && objs.length === 1 && typeof objs[0] === "string") 
      {
        var match = /^<(\w+)\s*\/?>$/.exec(objs[0]);
        if (match) {
          return [context.createElement(match[1])];
        }
      }
  
      // Interate through items in incoming array
      var obj, ret=[];
      for (var i=0, l=objs.length; i<l; i++)
      {
        obj = objs[i];
  
        // Convert HTML string into DOM nodes
        if (typeof obj === "string") {
          obj = this.__convertHtmlString(obj, context);
        }
  
        // Append or merge depending on type
        if (obj.nodeType) {
          ret.push(obj);
        } else {
          ret.push.apply(ret, obj);
        }
      }
  
      // Append to fragment and filter out scripts... or...
      if (fragment) 
      {
        var scripts=[], Array=qx.lang.Array, elem, temp;
        for (var i=0; ret[i]; i++) 
        {
          elem = ret[i];
          
          if (elem.tagName.toLowerCase() === "script" && (!elem.type || elem.type.toLowerCase() === "text/javascript")) 
          {
            // Trying to remove the element from DOM
            if (elem.parentNode) {
              elem.parentNode.removeChild(ret[i]);
            }
            
            // Store in script list
            scripts.push(elem);
          } 
          else
          {
            if (elem.nodeType === 1) 
            {
              // Recursively search for scripts and append them to the list of elements to process
              temp = Array.fromCollection(elem.getElementsByTagName("script"));
              ret.splice.apply(ret, [i+1, 0].concat(temp));
            }
              
            // Finally append element to fragment
            fragment.appendChild(elem);
          }
        }
        
        return scripts;
      }
  
      // Otherwise return the array of all elements
      return ret;
    },


    /**
     * Add an event listener to a DOM element. The event listener is passed an
     * instance of {@link Event} containing all relevant information
     * about the event as parameter.
     *
     * @param element {Element} DOM element to attach the event on.
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object} Reference to the 'this' variable inside
     *       the event listener.
     * @param capture {Boolean} Whether to attach the event to the
     *       capturing phase of the bubbling phase of the event. The default is
     *       to attach the event handler to the bubbling phase.
     * @return {var} An opaque id, which can be used to remove the event listener
     *       using the {@link #removeListenerById} method.
     */
    addListener : function(element, type, listener, self, capture) {
      return qx.event.Registration.addListener(element, type, listener, self, capture);
    },


    /**
     * Remove an event listener from a from DOM node.
     *
     * Note: All registered event listeners will automatically be removed from
     *   the DOM at page unload so it is not necessary to detach events yourself.
     *
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param self {Object} Reference to the 'this' variable inside
     *       the event listener.
     * @param capture {Boolean} Whether to remove the event listener of
     *       the bubbling or of the capturing phase.
     */
    removeListener : function(element, type, listener, self, capture) {
      return qx.event.Registration.removeListener(element, type, listener, self, capture);
    },


    /**
     * Removes an event listener from an event target by an id returned by
     * {@link #addListener}
     *
     * @param target {Object} The event target
     * @param id {var} The id returned by {@link #addListener}
     */
    removeListenerById : function(target, id) {
      qx.event.Registration.removeListenerById(target, id);
    },


    /**
     * Check whether there are one or more listeners for an event type
     * registered at the element.
     *
     * @param element {Element} DOM element
     * @param type {String} The event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *       the bubbling or of the capturing phase.
     * @return {Boolean} Whether the element has event listeners of the given type.
     */
    hasListener : function(element, type, capture) {
      return qx.event.Registration.hasListener(element, type, capture);
    },


    /**
     * Focusses the given element. The element needs to have a positive <code>tabIndex</code> value.
     *
     * @param element {Element} DOM element to focus
     * @return {void}
     */
    focus : function(element) {
      qx.event.Registration.getManager(element).getHandler(qx.event.handler.Focus).focus(element);
    },


    /**
     * Blurs the given element
     *
     * @param element {Element} DOM element to blur
     * @return {void}
     */
    blur : function(element) {
      qx.event.Registration.getManager(element).getHandler(qx.event.handler.Focus).blur(element);
    },


    /**
     * Activates the given element. The active element receives all key board events.
     *
     * @param element {Element} DOM element to focus
     * @return {void}
     */
    activate : function(element) {
      qx.event.Registration.getManager(element).getHandler(qx.event.handler.Focus).activate(element);
    },


    /**
     * Deactivates the given element. The active element receives all key board events.
     *
     * @param element {Element} DOM element to focus
     * @return {void}
     */
    deactivate : function(element) {
      qx.event.Registration.getManager(element).getHandler(qx.event.handler.Focus).deactivate(element);
    },


    /**
     * Captures the given element
     *
     * @param element {Element} DOM element to capture
     * @return {void}
     */
    capture : function(element) {
      qx.event.Registration.getManager(element).getDispatcher(qx.event.dispatch.MouseCapture).activateCapture(element);
    },


    /**
     * Releases the given element (from a previous {@link #capture} call)
     *
     * @param element {Element} DOM element to release
     * @return {void}
     */
    releaseCapture : function(element) {
      qx.event.Registration.getManager(element).getDispatcher(qx.event.dispatch.MouseCapture).releaseCapture(element);
    }
  }
});
