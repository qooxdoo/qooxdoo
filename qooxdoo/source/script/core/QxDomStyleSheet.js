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

#package(dom)
#require(QxClient)
#require(QxDomCore)

************************************************************************ */

if (QxClient.isMshtml())
{
  QxDom.createStyleElement = function(vCssText)
  {
    var vSheet = document.createStyleSheet();

    if (vCssText) {
      vSheet.cssText = vCssText;
    };

    return vSheet;
  };

  QxDom.addCssRule = function(vSheet, vSelector, vStyle) {
    vSheet.addRule(vSelector, vStyle);
  };

  QxDom.removeCssRule = function(vSheet, vSelector)
  {
    vRules = vSheet.rules;
    vLength = vRules.length;

    for (i=vLength-1; i>=0; i--)
    {
      if (vRules[i].selectorText == vSelector) {
        vSheet.removeRule(i);
      };
    };
  };

  QxDom.removeAllCssRules = function(vSheet)
  {
    vRules = vSheet.rules;
    vLength = vRules.length;

    for (i=vLength-1; i>=0; i--) {
      vSheet.removeRule(i);
    };
  };
}
else
{
  QxDom.createStyleElement = function(vCssText)
  {
    vElement = document.createElement("STYLE");
    vElement.type = "text/css";

    if (vCssText) {
      vElement.appendChild(document.createTextNode(vCssText));
    };

    document.getElementsByTagName("HEAD")[0].appendChild(vElement);

    return vElement.sheet;
  };

  QxDom.addCssRule = function(vSheet, vSelector, vStyle) {
    vSheet.insertRule(vSelector + "{" + vStyle + "}", vSheet.cssRules.length);
  };

  QxDom.removeCssRule = function(vSheet, vSelector)
  {
    vRules = vSheet.cssRules;
    vLength = vRules.length;

    for (i=vLength-1; i>=0; i--)
    {
      if (vRules[i].selectorText == vSelector) {
        vSheet.deleteRule(i);
      };
    };
  };

  QxDom.removeAllCssRules = function(vSheet)
  {
    vRules = vSheet.cssRules;
    vLength = vRules.length;

    for (i=vLength-1; i>=0; i--) {
      vSheet.deleteRule(i);
    };
  };
};
