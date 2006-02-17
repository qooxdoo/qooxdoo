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

#package(list)

************************************************************************ */

function QxListItem(vText, vIcon, vValue)
{
  QxAtom.call(this, vText, vIcon);

  if (QxUtil.isValid(vValue)) {
    this.setValue(vValue);
  };


  // ************************************************************************
  //   EVENT LISTENER
  // ************************************************************************
  this.addEventListener(QxConst.EVENT_TYPE_DBLCLICK, this._ondblclick);
};

QxListItem.extend(QxAtom, "QxListItem");

QxListItem.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "list-item" });
QxListItem.addProperty({ name : "value" });





/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.matchesString = function(vText) {
  return vText != QxConst.CORE_EMPTY && this.getLabel().toLowerCase().indexOf(vText.toLowerCase()) == 0;
};

proto.matchesStringExact = function(vText) {
  return vText != QxConst.CORE_EMPTY && this.getLabel().toLowerCase() == String(vText).toLowerCase();
};

proto.matchesValue = function(vText) {
  return vText != QxConst.CORE_EMPTY && this.getValue().toLowerCase().indexOf(vText.toLowerCase()) == 0;
};

proto.matchesValueExact = function(vText) {
  return vText != QxConst.CORE_EMPTY && this.getValue().toLowerCase() == String(vText).toLowerCase();
};





/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._ondblclick = function(e)
{
  var vCommand = this.getCommand();
  if (vCommand) {
    vCommand.execute();
  };
};
