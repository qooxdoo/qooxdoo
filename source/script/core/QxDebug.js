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

qx.dev.Debug = function(group, message, classname)
{
  // Building time string
  var t = String((new Date).valueOf()-QxMain.loadStart);
  while (t.length<6) t = QxConst.CORE_ZERO + t;
  t += qx.dev.Debug.divider;

  // Check if frame is ready
  if (!qx.dev.Debug._head)
  {
    qx.dev.Debug._head = document.createElement(QxConst.CORE_DIV);
    qx.dev.Debug._head.className = "head";

    qx.dev.Debug._log = document.createElement(QxConst.CORE_DIV);
    qx.dev.Debug._log.className = "log";



    // ************************************************************************
    //   CLEAR BUTTON
    // ************************************************************************

    qx.dev.Debug._btnClear = document.createElement("button");
    qx.dev.Debug._btnClear.appendChild(document.createTextNode("clear"));
    qx.dev.Debug._head.appendChild(qx.dev.Debug._btnClear);

    qx.dev.Debug._btnClear.onclick = function(e)
    {
      qx.dev.Debug._log.innerHTML = "";
      qx.dev.Debug.lastgroup = null;
    };


    // ************************************************************************
    //   HIDE BUTTON
    // ************************************************************************

    qx.dev.Debug._btnHide = document.createElement("button");
    qx.dev.Debug._btnHide.appendChild(document.createTextNode("hide"));
    qx.dev.Debug._head.appendChild(qx.dev.Debug._btnHide);

    qx.dev.Debug._btnHide.onclick = function(e)
    {
      qx.dev.Debug._log.style.display = QxConst.CORE_NONE;
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

    qx.dev.Debug._btnShow = document.createElement("button");
    qx.dev.Debug._btnShow.appendChild(document.createTextNode("show"));
    qx.dev.Debug._head.appendChild(qx.dev.Debug._btnShow);

    qx.dev.Debug._btnShow.onclick = function(e)
    {
      qx.dev.Debug._log.style.display = "";
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

    qx.dev.Debug._btnDispose = document.createElement("button");
    qx.dev.Debug._btnDispose.appendChild(document.createTextNode("dispose"));
    qx.dev.Debug._head.appendChild(qx.dev.Debug._btnDispose);

    qx.dev.Debug._btnDispose.onclick = function(e) {
      QxObject.dispose();
    };
  };

  if (group != qx.dev.Debug.lastgroup)
  {
    var n = document.createElement(QxConst.CORE_DIV);
    n.className = qx.dev.Debug.groupClass;
    n.appendChild(document.createTextNode(group));

    qx.dev.Debug._log.appendChild(n);

    qx.dev.Debug.lastgroup = group;
  };

  if (qx.util.validator.isValid(message))
  {
    if (qx.util.validator.isInvalidString(classname)) {
      classname = QxConst.CORE_DEFAULT;
    };

    var n = document.createElement(QxConst.CORE_DIV);
    n.className = qx.dev.Debug.messageClass + classname;
    n.appendChild(document.createTextNode(t + message));

    qx.dev.Debug._log.appendChild(n);
  };







  // Check if document is ready
  if (!qx.dev.Debug._head.parentNode || typeof qx.dev.Debug._head.parentNode.tagName === QxConst.TYPEOF_UNDEFINED)
  {
    var d = document.getElementById(qx.dev.Debug.console);
    if (d)
    {
      d.appendChild(qx.dev.Debug._head);
      d.appendChild(qx.dev.Debug._log);
    };
  };
};

qx.dev.Debug.console = "demoDebug";
qx.dev.Debug.lastgroup = null;
qx.dev.Debug.divider = ": ";
qx.dev.Debug.groupClass = "group";
qx.dev.Debug.messageClass = "message message-";
