/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Sebastian Werner, http://sebastian-werner.net

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

   ======================================================================

   This class contains code based on the following work:

   * jQuery
     http://jquery.com
     Version 1.3.1

     Copyright:
       2009 John Resig

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

************************************************************************ */

/**
 * This class is mainly a convenience wrapper for DOM elements to
 * qooxdoo's event system.
 *
 * @ignore(qxWeb)
 */
qx.Bootstrap.define("qx.bom.Html",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
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


    /** @type {Map} Contains wrap fragments for specific HTML matches */
    __convertMap :
    {
      opt : [ 1, "<select multiple='multiple'>", "</select>" ], // option or optgroup
      leg : [ 1, "<fieldset>", "</fieldset>" ],
      table : [ 1, "<table>", "</table>" ],
      tr : [ 2, "<table><tbody>", "</tbody></table>" ],
      td : [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
      col : [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
      def : qx.core.Environment.select("engine.name",
      {
        "mshtml" : [ 1, "div<div>", "</div>" ],
        "default" : null
      })
    },


    /**
     * Fixes "XHTML"-style tags in all browsers.
     * Replaces tags which are not allowed to be closed directly such as
     * <code>div</code> or <code>p</code>. They are patched to use opening and
     * closing tags instead, e.g. <code>&lt;p&gt;</code> => <code>&lt;p&gt;&lt;/p&gt;</code>
     *
     * @param html {String} HTML to fix
     * @return {String} Fixed HTML
     */
    fixEmptyTags : function(html)
    {
      return html.replace(/(<(\w+)[^>]*?)\/>/g, this.__fixNonDirectlyClosableHelper);
    },


    /**
     * Translates a HTML string into an array of elements.
     *
     * @param html {String} HTML string
     * @param context {Document} Context document in which (helper) elements should be created
     * @return {Array} List of resulting elements
     */
    __convertHtmlString : function(html, context)
    {
      var div = context.createElement("div");

      html = qx.bom.Html.fixEmptyTags(html);

      // Trim whitespace, otherwise indexOf won't work as expected
      var tags = html.replace(/^\s+/, "").substring(0, 5).toLowerCase();

      // Auto-wrap content into required DOM structure
      var wrap, map = this.__convertMap;
      if (!tags.indexOf("<opt")) {
        wrap = map.opt;
      } else if (!tags.indexOf("<leg")) {
        wrap = map.leg;
      } else if (tags.match(/^<(thead|tbody|tfoot|colg|cap)/)) {
        wrap = map.table;
      } else if (!tags.indexOf("<tr")) {
        wrap = map.tr;
      } else if (!tags.indexOf("<td") || !tags.indexOf("<th")) {
        wrap = map.td;
      } else if (!tags.indexOf("<col")) {
        wrap = map.col;
      } else {
        wrap = map.def;
      }

      // Omit string concat when no wrapping is needed
      if (wrap)
      {
        // Go to html and back, then peel off extra wrappers
        div.innerHTML = wrap[1] + html + wrap[2];

        // Move to the right depth
        var depth = wrap[0];
        while (depth--) {
          div = div.lastChild;
        }
      }
      else
      {
        div.innerHTML = html;
      }

      // Fix IE specific bugs
      if ((qx.core.Environment.get("engine.name") == "mshtml"))
      {
        // Remove IE's autoinserted <tbody> from table fragments
        // String was a <table>, *may* have spurious <tbody>
        var hasBody = /<tbody/i.test(html);

        // String was a bare <thead> or <tfoot>
        var tbody = !tags.indexOf("<table") && !hasBody ?
          div.firstChild && div.firstChild.childNodes :
          wrap[1] == "<table>" && !hasBody ? div.childNodes :
          [];

        for (var j=tbody.length-1; j>=0 ; --j)
        {
          if (tbody[j].tagName.toLowerCase() === "tbody" && !tbody[j].childNodes.length) {
            tbody[j].parentNode.removeChild(tbody[j]);
          }
        }

        // IE completely kills leading whitespace when innerHTML is used
        if (/^\s/.test(html)) {
          div.insertBefore(context.createTextNode(html.match(/^\s*/)[0]), div.firstChild);
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
     * fragment except the script tags. These are returned in a separate Array.
     *
     * Please note: HTML coming from user input must be validated prior
     * to passing it to this method. HTML is temporarily inserted to the DOM
     * using <code>innerHTML</code>. As a consequence, scripts included in
     * attribute event handlers may be executed.
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

      // Iterate through items in incoming array
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
        } else if (obj instanceof qx.type.BaseArray ||
            (typeof qxWeb !== "undefined" && obj instanceof qxWeb)) {
          ret.push.apply(ret, Array.prototype.slice.call(obj, 0));
        } else if (obj.toElement) {
          ret.push(obj.toElement());
        } else {
          ret.push.apply(ret, obj);
        }
      }

      // Append to fragment and filter out scripts... or...
      if (fragment)
      {
        return qx.bom.Html.extractScripts(ret, fragment);
      }

      // Otherwise return the array of all elements
      return ret;
    },


    /**
     * Extracts script elements from an element list. Optionally
     * attaches them to a given document fragment
     *
     * @param elements {Element[]} list of elements
     * @param fragment {Document?} document fragment
     * @return {Element[]} Array containing the script elements
     */
    extractScripts : function(elements, fragment) {
      var scripts=[], elem;
      for (var i=0; elements[i]; i++) {
        elem = elements[i];

        if (elem.nodeType == 1 && elem.tagName.toLowerCase() === "script" && (!elem.type || elem.type.toLowerCase() === "text/javascript"))
        {
          // Trying to remove the element from DOM
          if (elem.parentNode) {
            elem.parentNode.removeChild(elements[i]);
          }

          // Store in script list
          scripts.push(elem);
        }
        else
        {
          if (elem.nodeType === 1)
          {
            // Recursively search for scripts and append them to the list of elements to process
            var scriptList = qx.lang.Array.fromCollection(elem.getElementsByTagName("script"));
            elements.splice.apply(elements, [i+1, 0].concat(scriptList));
          }

          // Finally append element to fragment
          if (fragment) {
            fragment.appendChild(elem);
          }
        }
      }

      return scripts;
    }
  }
});
