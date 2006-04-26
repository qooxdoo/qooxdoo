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

  if(qx.util.Validation.isValidObject(vWidget)) {
    this.setWidget(vWidget);
  };
});


/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  Appearance setting for the class.
*/
qx.OO.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "statusbar-pane" });

/*!
  The main menu bar if any.
*/
qx.OO.addProperty({ name : "widget", type : qx.Const.TYPEOF_OBJECT, allowNull : true });


/*
------------------------------------------------------------------------------------
  MODIFIERS
------------------------------------------------------------------------------------
*/

qx.Proto._modifyWidget = function(propValue, propOldValue, propData)
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

qx.Proto.dispose = function()
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
