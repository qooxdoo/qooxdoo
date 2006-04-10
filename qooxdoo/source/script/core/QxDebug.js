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

#package(core)
#post(QxMain)
#post(QxConst)
#post(QxUtil)

************************************************************************ */

function QxDebug(group, message, classname)
{
  // Building time string
  var t = String((new Date).valueOf()-QxMain.loadStart);
  while (t.length<6) t = QxConst.CORE_ZERO + t;
  t += QxDebug.divider;

  // Check if frame is ready
  if (!QxDebug._head)
  {
    QxDebug._head = document.createElement(QxConst.CORE_DIV);
    QxDebug._head.className = "head";

    QxDebug._log = document.createElement(QxConst.CORE_DIV);
    QxDebug._log.className = "log";



    // ************************************************************************
    //   CLEAR BUTTON
    // ************************************************************************

    QxDebug._btnClear = document.createElement("button");
    QxDebug._btnClear.appendChild(document.createTextNode("clear"));
    QxDebug._head.appendChild(QxDebug._btnClear);

    QxDebug._btnClear.onclick = function(e)
    {
      QxDebug._log.innerHTML = "";
      QxDebug.lastgroup = null;
    };


    // ************************************************************************
    //   HIDE BUTTON
    // ************************************************************************

    QxDebug._btnHide = document.createElement("button");
    QxDebug._btnHide.appendChild(document.createTextNode("hide"));
    QxDebug._head.appendChild(QxDebug._btnHide);

    QxDebug._btnHide.onclick = function(e)
    {
      QxDebug._log.style.display = QxConst.CORE_NONE;
      document.getElementById("demoHead").style.display = QxConst.CORE_NONE;
      document.getElementById("demoFoot").style.display = QxConst.CORE_NONE;
      document.getElementById("demoDescription").style.display = QxConst.CORE_NONE;
      document.getElementById("demoFiles").style.display = QxConst.CORE_NONE;
      document.getElementById("demoFrame").style.display = QxConst.CORE_NONE;
      document.getElementById("demoDebug").style.visibility = QxConst.CORE_HIDDEN;

    };


    // ************************************************************************
    //   SHOW BUTTON
    // ************************************************************************

    QxDebug._btnShow = document.createElement("button");
    QxDebug._btnShow.appendChild(document.createTextNode("show"));
    QxDebug._head.appendChild(QxDebug._btnShow);

    QxDebug._btnShow.onclick = function(e)
    {
      QxDebug._log.style.display = "";
      document.getElementById("demoHead").style.display = "";
      document.getElementById("demoFoot").style.display = "";
      document.getElementById("demoDescription").style.display = "";
      document.getElementById("demoFiles").style.display = "";
      document.getElementById("demoFrame").style.display = "";
      document.getElementById("demoDebug").style.visibility = "";
    };


    // ************************************************************************
    //   DISPOSE BUTTON
    // ************************************************************************

    QxDebug._btnDispose = document.createElement("button");
    QxDebug._btnDispose.appendChild(document.createTextNode("dispose"));
    QxDebug._head.appendChild(QxDebug._btnDispose);

    QxDebug._btnDispose.onclick = function(e) {
      QxObject.dispose();
    };
  };

  if (group != QxDebug.lastgroup)
  {
    var n = document.createElement(QxConst.CORE_DIV);
    n.className = QxDebug.groupClass;
    n.appendChild(document.createTextNode(group));

    QxDebug._log.appendChild(n);

    QxDebug.lastgroup = group;
  };

  if (QxUtil.isValid(message))
  {
    if (QxUtil.isInvalidString(classname)) {
      classname = QxConst.CORE_DEFAULT;
    };

    var n = document.createElement(QxConst.CORE_DIV);
    n.className = QxDebug.messageClass + classname;
    n.appendChild(document.createTextNode(t + message));

    QxDebug._log.appendChild(n);
  };







  // Check if document is ready
  if (!QxDebug._head.parentNode || typeof QxDebug._head.parentNode.tagName === QxConst.TYPEOF_UNDEFINED)
  {
    var d = document.getElementById(QxDebug.console);
    if (d)
    {
      d.appendChild(QxDebug._head);
      d.appendChild(QxDebug._log);
    };
  };
};

QxDebug.console = "demoDebug";
QxDebug.lastgroup = null;
QxDebug.divider = ": ";
QxDebug.groupClass = "group";
QxDebug.messageClass = "message message-";
