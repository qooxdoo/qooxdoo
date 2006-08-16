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

if (qx.sys.Client.getInstance().isMshtml())
{
  qx.dom.DomStyleSheet.createElement = function(vCssText)
  {
    var vSheet = document.createStyleSheet();

    if (vCssText) {
      vSheet.cssText = vCssText;
    }

    return vSheet;
  }

  qx.dom.DomStyleSheet.addRule = function(vSheet, vSelector, vStyle) {
    vSheet.addRule(vSelector, vStyle);
  }

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

  qx.dom.DomStyleSheet.removeAllRules = function(vSheet)
  {
    var vRules = vSheet.rules;
    var vLength = vRules.length;

    for (var i=vLength-1; i>=0; i--) {
      vSheet.removeRule(i);
    }
  }
  
  qx.dom.DomStyleSheet.addImport = function(vSheet, vUrl) {
    vSheet.addImport(vUrl);
  }
  
  qx.dom.DomStyleSheet.removeImport = function(vSheet, vUrl) {
    var vImports = vSheet.imports;
    var vLength = vImports.length;
    
    for (var i=vLength-1; i>=0; i--) {
      if (vImports[i].href == vUrl) {
        vSheet.removeImport(i);
      }
    }
  }
  
  qx.dom.DomStyleSheet.removeAllImports = function(vSheet) {
    var vImports = vSheet.imports;
    var vLength = vImports.length;
    
    for (var i=vLength-1; i>=0; i--) {
      vSheet.removeImport(i);
    }
  }

}
else
{
  qx.dom.DomStyleSheet.createElement = function(vCssText)
  {
    var vElement = document.createElement("STYLE");
    vElement.type = "text/css";

    if (vCssText) {
      vElement.appendChild(document.createTextNode(vCssText));
    }

    document.getElementsByTagName("HEAD")[0].appendChild(vElement);

    return vElement.sheet;
  }

  qx.dom.DomStyleSheet.addRule = function(vSheet, vSelector, vStyle) {
    vSheet.insertRule(vSelector + "{" + vStyle + "}", vSheet.cssRules.length);
  }

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

  qx.dom.DomStyleSheet.removeAllRules = function(vSheet)
  {
    var vRules = vSheet.cssRules;
    var vLength = vRules.length;

    for (var i=vLength-1; i>=0; i--) {
      vSheet.deleteRule(i);
    }
  }

  qx.dom.DomStyleSheet.addImport = function(vSheet, vUrl) {
    vSheet.insertRule('@import "' + vUrl + '";', vSheet.cssRules.length);
  }
  
  qx.dom.DomStyleSheet.removeImport = function(vSheet, vUrl) {
    var vRules = vSheet.cssRules;
    var vLength = vRules.length;
    
    for (var i=vLength-1; i>=0; i--) {
      if (vRules[i].href == vUrl) {
        vSheet.deleteRule(i);
      }
    }
  }
  
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
