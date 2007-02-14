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
     * Andreas Ecker (ecker)
     * Carsten Lergenmueller (carstenl)

************************************************************************ */

/* ************************************************************************

#module(dev)

************************************************************************ */

/**
 * Retrieve information about global namespace pollution
 */
qx.OO.defineClass("qx.dev.Pollution");

/**
 * Classes to check for pollution
 */
qx.Class.names =
{
  "window" : window,
  "document" : document,
  "body" : document.body
};


/**
 * Known properties of the classes to check.
 * These properties will not be reported as pollution
 */
qx.Class.ignore =
{
  "window" :
  [
    // qooxdoo
    "qx",

    // Java
    "java",
    "sun",
    "Packages",

    // Firefox
    "__firebug__",
    "Components",
    "controllers",
    "sessionStorage",
    "globalStorage",

    // Firefox extension: Firebug
    "console",

    // IE
    "event",
    "offscreenBuffering",
    "clipboardData",
    "clientInformation",
    "Option",
    "Image",
    "external",
    "screenTop",
    "screenLeft",

    // Standard
    "length",
    "window",
    "document",
    "location",
    "navigator",
    "netscape",
    "parent",
    "frames",
    "top",
    "scrollbars",
    "name",
    "scrollX",
    "scrollY",
    "self",
    "screen",
    "history",
    "content",
    "menubar",
    "toolbar",
    "locationbar",
    "personalbar",
    "statusbar",
    "directories",
    "closed",
    "crypto",
    "pkcs11",
    "opener",
    "status",
    "defaultStatus",
    "innerWidth",
    "innerHeight",
    "outerWidth",
    "outerHeight",
    "screenX",
    "screenY",
    "pageXOffset",
    "pageYOffset",
    "scrollMaxX",
    "scrollMaxY",
    "fullScreen",
    "frameElement",
    "XMLHttpRequest"
  ],

  "document" :
  [
    "domConfig",
    "location",
    "compatMode",
    "implementation",
    "defaultView",
    "title",
    "body",
    "styleSheets",
    "documentElement",
    "nodeName",
    "nodeType",
    "firstChild",
    "lastChild",
    "doctype",
    "images",
    "applets",
    "links",
    "forms",
    "anchors",
    "cookie",
    "embeds",
    "plugins",
    "designMode",
    "childNodes"
  ],

  "body" :
  [
    "textContent",
    "innerHTML",
    "outerHTML",
    "innerText",
    "outerText",
    "scopeName",
    "parentElement",
    "tagName",
    "filters",
    "contentEditable",
    "document",
    "currentStyle",
    "isMultiLine",
    "clientHeight",
    "clientWidth",

    "lastChild",
    "firstChild",
    "offsetTop",
    "offsetLeft",
    "offsetWidth",
    "offsetHeight",
    "tabIndex",
    "className",
    "attributes",
    "previousSibling",
    "nextSibling",
    "ownerDocument",
    "localName",
    "childNodes",
    "parentNode",
    "nodeType",
    "nodeName",
    "style",

    "scrollTop",
    "scrollLeft",
    "scrollWidth",
    "scrollHeight"
  ]
}

/**
 * Show the namespace pollution of a given object or the golbal namespace.
 * 
 * @param objectName {String?"window"} name of the object to inspect. Valid Names are:
 *   <ul>
 *     <li>window</li>
 *     <li>document</li>
 *     <li>body</li>
 *   </ul>
 */
qx.Class.consoleInfo = function(objectName)
{
  var msg = qx.dev.Pollution.getTextList(objectName || "window");

  if (msg) {
    alert("Global namespace is polluted by the following unknown objects:\n\n" + msg);
  } else {
    alert("Global namespace is not polluted by any unknown objects.");
  }
}


/**
 * Return a list of objects which are not supposed to be in the given object.
 * 
 * @param objectName {String} Name of the objects to inspect. Valid names are:
 *   <ul>
 *     <li>window</li>
 *     <li>document</li>
 *     <li>body</li>
 *   </ul>
 * @return {Map[]} Array of values, which are not supposed to be in the given object.
 */
qx.Class.extract = function(objectName)
{
  var ext = [];
  var ign = qx.dev.Pollution.ignore[objectName];

  //IE offers a window[index] access to the frames of a window, i. e.
  //for three frame, the window object will have attributes "0", "1" and "2"
  if (qx.core.Variant.isSet("qx.client", "mshtml")) {
    if (objectName == "window") {
      ign = ign.slice();
      for (var frameIndex = 0; frameIndex < window.length; frameIndex++){
        ign.push("" + frameIndex);
      }
    }
  }

  var obj = qx.dev.Pollution.names[objectName];

  for (var key in obj)
  {
    try
    {
      //MS IE 7 crashes when doing typeof(window.external), catch here
      if ( qx.core.Variant.isSet("qx.client", "mshtml")) {
        if ( (clientInfos.getMajor() >= 7) && (objectName == "window") && (key == "external") ) {
          continue;
        }
      }

      // Ignore null or undefined values
      if (typeof obj[key] == "undefined" || obj[key] === null) {
        continue;
      }

      // Ignore native code
      if (typeof obj[key] == "function" && obj[key].toString().indexOf("[native code]") != -1) {
        continue;
      }

      // Ignore native code
      if (
//        typeof obj[key] == "function" &&
        typeof obj[key].constructor == "function"
      ) {
        //alert(obj[key].constructor.toString());
        if (
          (obj[key].constructor.toString().indexOf("[native code]") != -1) ||
          (obj[key].constructor.toString().indexOf("[function]") != -1)
        ) {
          continue;
        };
      }
      /*
      EvalError, "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError"
      "HTMLFontElement", "HTMLBodyElement", "HTMLScriptElement", "DOMParser", "Document", "HTMLDivElement","value":{"prototype":{"DOCUMENT_FRAGMENT_NODE":11,"ENTITY_REFERENCE_NODE":5,"CDATA_SECTION_NODE":4,"TEXT_NODE":3,"COMMENT_NODE":8,"ELEMENT_NODE":1,"ATTRIBUTE_NODE":2,"ENTITY_NODE":6,"PROCESSING_INSTRUCTION_NODE":7,"DOCUMENT_NODE":9,"DOCUMENT_TYPE_NODE":10,"NOTATION_NODE":12}}},{"key":"HTMLLabelElement","value":{"prototype":{"DOCUMENT_FRAGMENT_NODE":11,"ENTITY_REFERENCE_NODE":5,"CDATA_SECTION_NODE":4,"TEXT_NODE":3,"COMMENT_NODE":8,"ELEMENT_NODE":1,"ATTRIBUTE_NODE":2,"ENTITY_NODE":6,"PROCESSING_INSTRUCTION_NODE":7,"DOCUMENT_NODE":9,"DOCUMENT_TYPE_NODE":10,"NOTATION_NODE":12}}},{"key":"HTMLIsIndexElement","value":{"prototype":{"DOCUMENT_FRAGMENT_NODE":11,"ENTITY_REFERENCE_NODE":5,"CDATA_SECTION_NODE":4,"TEXT_NODE":3,"COMMENT_NODE":8,"ELEMENT_NODE":1,"ATTRIBUTE_NODE":2,"ENTITY_NODE":6,"PROCESSING_INSTRUCTION_NODE":7,"DOCUMENT_NODE":9,"DOCUMENT_TYPE_NODE":10,"NOTATION_NODE":12}}},
      */
      // Ignore if configured
      if (qx.lang.Array.contains(ign, key)) {
        continue;
      }

    }
    catch(ex)
    {
      continue;
    }

    ext.push({ "key" : key, "value" : obj[key] });
  }

  return ext;
}


/**
 * Format the global pollution list as a HTML fragment
 * 
 * @param objectName {String} Name of the objects to inspect. Valid names are:
 *   <ul>
 *     <li>window</li>
 *     <li>document</li>
 *     <li>body</li>
 *   </ul>
 * @return {String} HTML fragment
 */
qx.Class.getHtmlTable = function(objectName)
{
  var all = [];

  var rowStart = "<tr style='vertical-align:top'><td>";
  var cellSplit = "</td><td>";
  var rowEnd = "</td></tr>";

  all.push("<table>");

  var ext = this.extract(objectName);

  for (var i=0; i<ext.length; i++) {
    all.push(rowStart + ext[i].key + cellSplit + ext[i].value + rowEnd);
  }

  all.push("</table>");

  return all.join("");
}


/**
 * Format the global pollution list as a test list
 * 
 * @param objectName {String} Name of the objects to inspect. Valid names are:
 *   <ul>
 *     <li>window</li>
 *     <li>document</li>
 *     <li>body</li>
 *   </ul>
 * @return {String} global pollution list
 */
qx.Class.getTextList = function(objectName)
{
  var all = [];

  var cellSplit = ": ";
  var rowEnd = "\n";

  var ext = this.extract(objectName);

  for (var i=0; i<ext.length; i++) {
    all.push(ext[i].key + cellSplit + ext[i].value + rowEnd);
  }

  return all.join("");
}
