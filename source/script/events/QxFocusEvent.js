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

************************************************************************ */

/*!
  This event handles all focus events.

  The four supported types are:
  1+2: focus and blur also propagate the target object
  3+4: focusout and focusin are bubbling to the parent objects
*/
function QxFocusEvent(vType, vTarget)
{
  QxEvent.call(this, vType);
  
  this.setTarget(vTarget);

  switch(vType)
  {
    case QxConst.EVENT_TYPE_FOCUSIN:
    case QxConst.EVENT_TYPE_FOCUSOUT:
      this.setBubbles(true);
      this.setPropagationStopped(false);
  };
};

QxFocusEvent.extend(QxEvent, "QxFocusEvent");
