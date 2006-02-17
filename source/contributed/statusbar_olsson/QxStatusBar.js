/* ****************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
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
  QxHorizontalBoxLayout.call(this);

  this.setHeight(24);
  this.setWidth(null);// Can not use this QxConst.CORE_AUTO); -> gets an error "It is not allowed to define any horizontal dimension for 'vertical' placed children" when the QxStatusBar is layed out by QxDockLayout : potential bug
  this.setOverflow(QxConst.CORE_HIDDEN);
};

QxStatusBar.extend(QxHorizontalBoxLayout, "QxStatusBar");


/*
------------------------------------------------------------------------------------
  STYLES & BEHAVIOR
------------------------------------------------------------------------------------
*/

proto._applyInitialStyle = function()
{
  this.setBorder(QxBorderObject.presets.thinOutset);
  this.setColor("windowtext");
  this.setBackgroundColor("threedface");
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

  var children = this.getChildren();

//  if (this._statusText)
//  {
//    this._statusText.dispose();
//    this._statusText = null;
//  };

  return QxHorizontalBoxLayout.prototype.dispose.call(this);
};