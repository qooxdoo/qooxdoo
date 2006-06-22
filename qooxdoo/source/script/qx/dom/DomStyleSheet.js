/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by Schlund + Partner AG, Germany
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sw at schlund dot de>
     * Andreas Ecker (ecker)
       <ae at schlund dot de>

************************************************************************ */

/* ************************************************************************

#module(dom)
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
    vRules = vSheet.rules;
    vLength = vRules.length;

    for (i=vLength-1; i>=0; i--)
    {
      if (vRules[i].selectorText == vSelector) {
        vSheet.removeRule(i);
      }
    }
  }

  qx.dom.DomStyleSheet.removeAllRules = function(vSheet)
  {
    vRules = vSheet.rules;
    vLength = vRules.length;

    for (i=vLength-1; i>=0; i--) {
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
    vRules = vSheet.cssRules;
    vLength = vRules.length;

    for (i=vLength-1; i>=0; i--)
    {
      if (vRules[i].selectorText == vSelector) {
        vSheet.deleteRule(i);
      }
    }
  }

  qx.dom.DomStyleSheet.removeAllRules = function(vSheet)
  {
    vRules = vSheet.cssRules;
    vLength = vRules.length;

    for (i=vLength-1; i>=0; i--) {
      vSheet.deleteRule(i);
    }
  }
}
