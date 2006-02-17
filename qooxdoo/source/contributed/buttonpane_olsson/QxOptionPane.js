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

#package(optionpane)

**************************************************************************** */

function QxOptionPane(vMessage, vMessageIcon) {
  QxCanvasLayout.call(this);

  this.setWidth(null);
  this.setHeight(null);

  var messageHBL = this._messageLayout = new QxHorizontalBoxLayout();
  messageHBL.setHorizontalAlign("center");

  var messageI = this._icon    = new QxImage(vMessageIcon);

  var messageL = this._message = new QxLabel(vMessage);

  messageHBL.add(messageI, messageL);

  var buttonsBP = this._buttons = new QxButtonPane();
  buttonsBP.setHorizontalAlign("center");

//  this._buttonsBP.getOKButton().addEventListener("execute", function ok() {
//    this.close();
//    return true;
//  });

//  this._buttonsBP.getCancelButton().addEventListener("execute", function cancel() {
//    this.close();
//    return false;
//  });

//  this._buttonsBP.getHelpButton().addEventListener("execute", function help() {
//    // open the help!!!
//  });

  var layoutVBL = this._layout = new QxVerticalBoxLayout();
  layoutVBL.setPadding(5);
  layoutVBL.add(messageHBL, buttonsBP);

  this.add(layoutVBL);
};

QxOptionPane.extend(QxCanvasLayout, "QxOptionPane");



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

proto.getMessage = function() {
  return this.vMessage;
};

proto.getButtonPane = function() {
  return this._buttonsBP;
};

proto.createDialog = function(vTitle, vIcon) {
  var messageW = this._messageW = new QxWindow(vTitle, vIcon);
  messageW.setAllowMaximize(false);
  messageW.setModal(true);
  messageW.add(this);

  return messageW;
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

//  if (this._messageL)
//  {
//    this._messageL.dispose();
//    this._messageL = null;
//  };

//  if (this._buttonsBP)
//  {
//    this._buttonsBP.dispose();
//    this._buttonsBP = null;
//  };

//  if (this._layoutVBL)
//  {
//    this._layoutVBL.dispose();
//    this._layoutVBL = null;
//  };

  return QxWindow.prototype.dispose.call(this);
};
