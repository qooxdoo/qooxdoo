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

#package(buttonpane)

**************************************************************************** */

function QxButtonPane() {
  QxBoxLayout.call(this, QxConst.ORIENTATION_HORIZONTAL);

  var okB     = this._ok     = new QxButton("Ok");
  okB.setPadding(5,1,2,2);

  var cancelB = this._cancel = new QxButton("Cancel");
  cancelB.setPadding(5,1,2,1);

  var helpB   = this._help   = new QxButton("Help");
  helpB.setPadding(5,2,2,1);

  this.add(okB, cancelB, helpB);
};

QxButtonPane.extend(QxBoxLayout, "QxButtonPane");



/*
------------------------------------------------------------------------------------
  STYLES & BEHAVIOR
------------------------------------------------------------------------------------
*/

//proto._applyInitialStyle = function(statustext)
//{
//  this.setBorder(1, QxConst.BORDER_STYLE_INSET, "windowtext");
//  this.setBackgroundColor("threedface");
//};

/*
------------------------------------------------------------------------------------
  UTILITIES
------------------------------------------------------------------------------------
*/

//proto.getOKButton = function() {
//  return this._okB;
//};

//proto.getCancelButton = function() {
//  return this._cancelB;
//};

//proto.getHelpButton = function() {
//  return this._helpB;
//};

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

//  if (this._okB)
//  {
//    this._okB.dispose();
//    this._okB = null;
//  };

//  if (this._cancelB)
//  {
//    this._cancelB.dispose();
//    this._cancelB = null;
//  };

//  if (this._helpB)
//  {
//    this._helpB.dispose();
//    this._helpB = null;
//  };

  return QxBoxLayout.prototype.dispose.call(this);
};
