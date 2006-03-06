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

************************************************************************ */

/*!
  QxBlocker blocks the inputs from the user.
  This will be used internally to allow better modal dialogs for example.
*/
function QxBlocker()
{
  QxTerminator.call(this);

  this.setEdge(0);
  this.setDisplay(false);
};

QxBlocker.extend(QxTerminator, "QxBlocker");

QxBlocker.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "blocker" });
