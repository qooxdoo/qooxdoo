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

#package(guicore)
#require(qx.ui.basic.Label)

************************************************************************ */

qx.ui.basic.Label.BR = "<br/>";
qx.ui.basic.Label.CODE1 = "&#x";
qx.ui.basic.Label.CODE2 = "&#";
qx.ui.basic.Label.TOSTRHELPER = "0x";

qx.ui.basic.Label.htmlToText = function(s) {
  return String(s).replace(/\s+|<([^>])+>|&amp;|&lt;|&gt;|&quot;|&nbsp;|&#[0-9]+;|&#x[0-9a-fA-F];]/gi, qx.ui.basic.Label._htmlToText);
};

qx.ui.basic.Label._htmlToText = function(s)
{
  switch(s)
  {
    case QxConst.HTML_AMPERSAND:
      return QxConst.CORE_AMPERSAND;

    case QxConst.HTML_SMALLER:
      return QxConst.CORE_SMALLER;

    case QxConst.HTML_BIGGER:
      return QxConst.CORE_BIGGER;

    case QxConst.HTML_QUOTE:
      return QxConst.CORE_QUOTE;

    case QxConst.HTML_SPACE:
      return String.fromCharCode(160);

    default:
      if (s.substring(0, 3) == qx.ui.basic.Label.CODE1) {
        return String.fromCharCode(parseInt(qx.ui.basic.Label.TOSTRHELPER + s.substring(3, s.length - 1)));
      }
      else if (s.substring(0, 2) == qx.ui.basic.Label.CODE2) {
        return String.fromCharCode(s.substring(2, s.length - 1));
      }
      else if (/\s+/.test(s)) {
        return QxConst.CORE_SPACE;
      }
      else if (/^<BR/gi.test(s)) {
        return QxConst.CORE_NEWLINE;
      };

      return QxConst.CORE_EMPTY;
  };
};

qx.ui.basic.Label.textToHtml = function(s) {
  return String(s).replace(/&|<|>|\n|\u00A0/g, qx.ui.basic.Label._textToHtml);
};

qx.ui.basic.Label._textToHtml = function(s)
{
  switch(s)
  {
    case QxConst.CORE_AMPERSAND:
      return QxConst.HTML_AMPERSAND;

    case QxConst.CORE_SMALLER:
      return QxConst.HTML_SMALLER;

    case QxConst.CORE_BIGGER:
      return QxConst.HTML_BIGGER;

    case QxConst.CORE_NEWLINE:
      return qx.ui.basic.Label.BR;

    default:
      return QxConst.CORE_SPACE;
  };
};

qx.ui.basic.Label.init = function()
{
  qx.ui.basic.Label._measureNodes = {};
  qx.ui.basic.Label.createMeasureNode(QxConst.CORE_DEFAULT);
};

qx.ui.basic.Label.createMeasureNode = function(vId)
{
  var vNode = qx.ui.basic.Label._measureNodes[vId] = document.createElement(QxConst.CORE_DIV);
  var vStyle = vNode.style;

  vStyle.width = vStyle.height = QxConst.CORE_AUTO;
  vStyle.visibility = QxConst.CORE_HIDDEN;
  vStyle.position = QxConst.CORE_ABSOLUTE;
  vStyle.zIndex = "-1";

  document.body.appendChild(vNode);
};

if (typeof window.application != QxConst.TYPEOF_UNDEFINED) {
  window.application.addEventListener(QxConst.EVENT_TYPE_PRE, qx.ui.basic.Label.init);
};