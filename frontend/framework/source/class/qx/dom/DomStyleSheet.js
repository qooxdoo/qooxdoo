/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#require(qx.sys.Client)

************************************************************************ */

qx.OO.defineClass("qx.dom.DomStyleSheet");

if (qx.sys.Client.isMshtml())
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
}
