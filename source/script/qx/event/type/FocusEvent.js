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

#module(eventcore)

************************************************************************ */

/*!
  This event handles all focus events.

  The four supported types are:
  1+2: focus and blur also propagate the target object
  3+4: focusout and focusin are bubbling to the parent objects
*/
qx.OO.defineClass("qx.event.type.FocusEvent", qx.event.type.Event, 
function(vType, vTarget)
{
  qx.event.type.Event.call(this, vType);

  this.setTarget(vTarget);

  switch(vType)
  {
    case qx.constant.Event.FOCUSIN:
    case qx.constant.Event.FOCUSOUT:
      this.setBubbles(true);
      this.setPropagationStopped(false);
  };
});
