/* ****************************************************************************

   qooxdoo - the new era of web interface development

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

function QxStatusBarPane(vComponent) {
  QxCanvasLayout.call(this);

  this.setWidth(QxConst.CORE_AUTO);

  this._component = vComponent;
  vComponent.setPaddingLeft(1);
  vComponent.setPaddingRight(1);

  this.add(vComponent);
};

QxStatusBarPane.extend(QxCanvasLayout, "QxStatusBarPane");



/*
------------------------------------------------------------------------------------
  STYLES & BEHAVIOR
------------------------------------------------------------------------------------
*/

proto._applyInitialStyle = function()
{
  this.setBorder(QxBorderObject.presets.inset);
  this.setColor("windowtext");
  this.setBackgroundColor("threedface");
//  this.setBorder(1, QxConst.BORDER_STYLE_INSET, "windowtext");
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

  if (this._component)
  {
    this._component.dispose();
    this._component = null;
  };

  return QxCanvasLayout.prototype.dispose.call(this);
};