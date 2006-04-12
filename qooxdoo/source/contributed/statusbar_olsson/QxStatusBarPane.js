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

function QxStatusBarPane(vWidget) {
  qx.ui.layout.CanvasLayout.call(this);

  if(qx.util.validator.isValidObject(vWidget)) {
    this.setWidget(vWidget);
  };
};

QxStatusBarPane.extend(qx.ui.layout.CanvasLayout, "QxStatusBarPane");


/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  Appearance setting for the class.
*/
QxStatusBarPane.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "statusbar-pane" });

/*!
  The main menu bar if any.
*/
QxStatusBarPane.addProperty({ name : "widget", type : QxConst.TYPEOF_OBJECT, allowNull : true });


/*
------------------------------------------------------------------------------------
  MODIFIERS
------------------------------------------------------------------------------------
*/

proto._modifyWidget = function(propValue, propOldValue, propData)
{
  if(propOldValue != null)
  {
    this.remove(propOldValue);
    propOldValue.dispose();
    propOldValue = null;
  };

  if(propValue != null)
  {
    propValue.setAppearance("statusbar-widget");
    this.add(propValue);
  };

  return true;
};


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

  var widget = this.getWidget();

  if (widget)
  {
    widget.dispose();
    widget = null;
  };

  return qx.ui.layout.CanvasLayout.prototype.dispose.call(this);
};
