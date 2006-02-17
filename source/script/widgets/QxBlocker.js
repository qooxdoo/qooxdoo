/* ************************************************************************

   qooxdoo - the new era of web interface development

   Version:
     $Id$

   Copyright:
     (C) 2004-2005 by Schlund + Partner AG, Germany
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

function QxBlocker()
{
  QxTerminator.call(this);

  this.setEdge(0);
  this.setDisplay(false);
};

QxBlocker.extend(QxTerminator, "QxBlocker");

QxBlocker.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "blocker" });
