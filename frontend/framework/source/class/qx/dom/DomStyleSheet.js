/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org
     2006 by STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Andreas Junghans (lucidcake)

************************************************************************ */

/* ************************************************************************

#module(ui_core)
#require(qx.sys.Client)

************************************************************************ */

qx.OO.defineClass("qx.dom.DomStyleSheet");


/**
 * create a new Stylesheet node and append it to the document
 *
 * @param vCssText (string) optional string of css rules
 */
qx.dom.DomStyleSheet.createElement = function(vCssText) {};
if (document.createStyleSheet) // IE 4+
{
  qx.dom.DomStyleSheet.createElement = function(vCssText)
  {
    var vSheet = document.createStyleSheet();

    if (vCssText) {
      vSheet.cssText = vCssText;
    }

    return vSheet;
  }
}
else // FF, Opera, Safari
{
  qx.dom.DomStyleSheet.createElement = function(vCssText)
  {
    var vElement = document.createElement("style");
    vElement.type = "text/css";

    // Safari doesn't like empty stylesheets
    vElement.appendChild(document.createTextNode(vCssText || "body {}"));

    document.getElementsByTagName("head")[0].appendChild(vElement);

    if (vElement.sheet) {
      return vElement.sheet;
    } else {
      // Safari 2.0 doesn't support element.sheet so we neet a workaround
      var styles = document.styleSheets;
      for (var i=styles.length-1; i>=0; i--) {
        if (styles[i].ownerNode == vElement) {
          return styles[i];
        }
      }
    }
    throw "Error: Could not get a reference to the sheet object";
  }
}


/**
 * insert a new CSS rule into a given Stylesheet
 *
 * @param vSheet     (Object) the target Stylesheet object
 * @param vSelector (string)
 * @param vStyle     (string)
 */
qx.dom.DomStyleSheet.addRule = function(vSheet, vSelector, vStyle) {};
if (document.createStyleSheet) // IE 4+
{
  qx.dom.DomStyleSheet.addRule = function(vSheet, vSelector, vStyle) {
    vSheet.addRule(vSelector, vStyle);
  };
}
else if (qx.sys.Client.getInstance().isWebkit()) // insertRule in Safari 2 doesn't work
{
  qx.dom.DomStyleSheet.addRule = function(vSheet, vSelector, vStyle) {
    vSheet.ownerNode.appendChild(document.createTextNode(vSelector + "{" + vStyle + "}"));
  };
}
else // FF, Opera
{
  qx.dom.DomStyleSheet.addRule = function(vSheet, vSelector, vStyle) {
    vSheet.insertRule(vSelector + "{" + vStyle + "}", vSheet.cssRules.length);
  };
}


/**
 * remove a CSS rule from a stylesheet
 *
 * @param vSheet     (Object) the Stylesheet
 * @param vSelector (string) the Selector of the rule to remove
 */
qx.dom.DomStyleSheet.removeRule = function(vSheet, vSelector) {};
if (document.createStyleSheet) // IE 4+
{
  qx.dom.DomStyleSheet.removeRule = function(vSheet, vSelector)
  {
    var vRules = vSheet.rules;
    var vLength = vRules.length;

    for (var i=vLength-1; i>=0; i--)
    {
      if (vRules[i].selectorText == vSelector) {
        vSheet.removeRule(i);
      }
    }
  }
}
else
{
  qx.dom.DomStyleSheet.removeRule = function(vSheet, vSelector)
  {
    var vRules = vSheet.cssRules;
    var vLength = vRules.length;

    for (var i=vLength-1; i>=0; i--)
    {
      if (vRules[i].selectorText == vSelector) {
        vSheet.deleteRule(i);
      }
    }
  }
}


/**
 * remove all CSS rules from a stylesheet
 *
 * @param vSheet (Object)
 */
qx.dom.DomStyleSheet.removeAllRules = function(vSheet) {};
if (document.createStyleSheet) // IE 4+
{
  qx.dom.DomStyleSheet.removeAllRules = function(vSheet)
  {
    var vRules = vSheet.rules;
    var vLength = vRules.length;

    for (var i=vLength-1; i>=0; i--) {
      vSheet.removeRule(i);
    }
  }
}
else // FF, etc
{
  qx.dom.DomStyleSheet.removeAllRules = function(vSheet)
  {
    var vRules = vSheet.cssRules;
    var vLength = vRules.length;

    for (var i=vLength-1; i>=0; i--) {
      vSheet.deleteRule(i);
    }
  }
}


/**
 * add an import of an external CSS file to a stylesheet
 * @param vSheet (Object)
 * @param vUrl   (string)
 */
qx.dom.DomStyleSheet.addImport = function(vSheet, vUrl) {};
if (document.createStyleSheet) // IE 4+
{
  qx.dom.DomStyleSheet.addImport = function(vSheet, vUrl) {
    vSheet.addImport(vUrl);
  }
}
else  if (qx.sys.Client.getInstance().isWebkit()) // insertRule in Safari 2 doesn't work
{
  qx.dom.DomStyleSheet.addImport = function(vSheet, vUrl) {
    alert("Webkit");
    vSheet.ownerNode.appendChild(document.createTextNode('@import "' + vUrl + '";'));
  }
}
else // FF, etc
{
  qx.dom.DomStyleSheet.addImport = function(vSheet, vUrl) {
    vSheet.insertRule('@import "' + vUrl + '";', vSheet.cssRules.length);
  }
}


/**
 * removes an import from a stylesheet
 *
 * @param vSheet (Object)
 * @param vUrl    (string)  URL of the importet CSS file
 */
qx.dom.DomStyleSheet.removeImport = function(vSheet, vUrl) {};
if (document.createStyleSheet) // IE 4+
{
  qx.dom.DomStyleSheet.removeImport = function(vSheet, vUrl) {
    var vImports = vSheet.imports;
    var vLength = vImports.length;

    for (var i=vLength-1; i>=0; i--) {
      if (vImports[i].href == vUrl) {
        vSheet.removeImport(i);
      }
    }
  }
}
else // FF, etc
{
  qx.dom.DomStyleSheet.removeImport = function(vSheet, vUrl) {
    var vRules = vSheet.cssRules;
    var vLength = vRules.length;

    for (var i=vLength-1; i>=0; i--) {
      if (vRules[i].href == vUrl) {
        vSheet.deleteRule(i);
      }
    }
  }
}


/**
 * remove all imports from a stylesheet
 *
 * @param vSheet (Object)
 */
qx.dom.DomStyleSheet.removeAllImports = function(vSheet) {};
if (document.createStyleSheet) // IE 4+
{
  qx.dom.DomStyleSheet.removeAllImports = function(vSheet) {
    var vImports = vSheet.imports;
    var vLength = vImports.length;

    for (var i=vLength-1; i>=0; i--) {
      vSheet.removeImport(i);
    }
  }
}
else // FF, etc
{
  qx.dom.DomStyleSheet.removeAllImports = function(vSheet) {
    var vRules = vSheet.cssRules;
    var vLength = vRules.length;

    for (var i=vLength-1; i>=0; i--) {
      if (vRules[i].type == vRules[i].IMPORT_RULE) {
        vSheet.deleteRule(i);
      }
    }
  }
}
