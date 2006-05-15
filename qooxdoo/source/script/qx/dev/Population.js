/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(debug)

************************************************************************ */

qx.OO.defineClass("qx.dev.Population", qx.core.Object,
function() {
  qx.core.Object.call(this);

  this.names =
  {
    "window" : window,
    "document" : document,
    "body" : document.body
  }
});

qx.Class.ignore =
{
  "window" :
  [
    // Firefox
    "__firebug__",
    "Components",
    "controllers",

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

    // Demo Layout
    "str",
    "showTestFiles",
    "teststr",
    "exastr",
    "showstr",
    "inc"
  ],

  "document" :
  [
    "domConfig"
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
    "clientWidth"
  ]
}

qx.Proto.extract = function(object)
{
  var ext = [];
  var ign = qx.dev.Population.ignore[object];
  var obj = this.names[object];

  for (var key in obj)
  {
    // Ignore null or undefined values
    if (typeof obj[key] == "undefined" || obj[key] === null) {
      continue;
    }

    // Ignore native code
    if (typeof obj[key] == "function" && obj[key].toString().indexOf("[native code]") != -1) {
      continue;
    }

    // Ignore if configured
    if (qx.lang.Array.contains(ign, key)) {
      continue;
    }

    ext.push({ "key" : key, "value" : obj[key] });
  }

  return ext;
}

qx.Proto.getHtmlTable = function(object)
{
  var all = [];

  var rowStart = "<tr style='vertical-align:top'><td>";
  var cellSplit = "</td><td>";
  var rowEnd = "</td></tr>";

  all.push("<table>");

  var ext = this.extract(object);

  for (var i=0; i<ext.length; i++) {
    all.push(rowStart + ext[i].key + cellSplit + ext[i].value + rowEnd);
  };

  all.push("</table>");

  return all.join(qx.constant.Core.EMPTY);
}
