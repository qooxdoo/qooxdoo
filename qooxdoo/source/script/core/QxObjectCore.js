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
#require(qx.core.Object)
#require(qx.event.types.DomEventRegistration)

************************************************************************ */

qx.core.ObjectCounter = 0;
qx.core.ObjectDataBase = [];

qx.core.ObjectUnload = function()
{
  qx.core.Object.dispose();
  qx.dom.removeEventListener(window, QxConst.EVENT_TYPE_UNLOAD, qx.core.ObjectUnload);
};

qx.dom.addEventListener(window, QxConst.EVENT_TYPE_UNLOAD, qx.core.ObjectUnload);

qx.core.Object.toHashCode = function(o)
{
  if(o._hashCode != null) {
    return o._hashCode;
  };

  return o._hashCode = qx.core.ObjectCounter++;
};

qx.core.Object.dispose = function()
{
  // qx.dev.Debug("qx.core.Object", "Disposing Application");

  var vStart = (new Date).valueOf();
  var vObject;

  for (var i=qx.core.ObjectDataBase.length-1; i>=0; i--)
  {
    vObject = qx.core.ObjectDataBase[i];

    if (vObject != null)
    {
      // qx.dev.Debug("qx.core.Object", "Disposing: " + vObject);
      vObject.dispose();
      qx.core.ObjectDataBase[i] = null;
    };
  };

  // qx.dev.Debug("qx.core.Object", "Done in: " + ((new Date).valueOf() - vStart) + "ms");
};

qx.core.Object.addProperty({ name : "enabled", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true, getAlias : "isEnabled" });

qx.core.Object.DEBUG_MSG_BEFORE = "[HASHCODE:";
qx.core.Object.DEBUG_MSG_AFTER = "]";
qx.core.Object.DEBUG_FUNCERRORPRE = "Failed to execute \"";
qx.core.Object.DEBUG_FUNCERRORPOST = "()\": ";
