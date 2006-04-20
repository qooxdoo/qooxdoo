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

#package(eventcore)
#post(qx.event.types.KeyEventCore)

************************************************************************ */

/*!
  A key event instance contains all data for each occured key event
*/
qx.event.types.KeyEvent = function(vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget, vKeyCode)
{
  qx.event.types.DomEvent.call(this, vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget);

  this.setKeyCode(vKeyCode);
};

qx.event.types.KeyEvent.extend(qx.event.types.DomEvent, "qx.event.types.KeyEvent");

qx.event.types.KeyEvent.addFastProperty({ name : "keyCode", setOnlyOnce : true, noCompute : true });
