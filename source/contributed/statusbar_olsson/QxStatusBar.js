/* ****************************************************************************

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
     * Kent Olsson (kols)
       <kent dot olsson at chello dot se>

**************************************************************************** */

/* ****************************************************************************

#package(form)

**************************************************************************** */

function QxStatusBar() {
  qx.ui.layout.HorizontalBoxLayout.call(this);
};

QxStatusBar.extend(qx.ui.layout.HorizontalBoxLayout, "QxStatusBar");


/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Appearance setting for the class.
*/
QxStatusBar.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "statusbar" });


/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };

  return qx.ui.layout.HorizontalBoxLayout.prototype.dispose.call(this);
};
