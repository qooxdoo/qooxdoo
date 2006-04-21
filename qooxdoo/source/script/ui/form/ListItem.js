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

qx.ui.form.ListItem = function(vText, vIcon, vValue)
{
  qx.ui.basic.Atom.call(this, vText, vIcon);

  if (qx.util.Validation.isValid(vValue)) {
    this.setValue(vValue);
  };


  // ************************************************************************
  //   EVENT LISTENER
  // ************************************************************************
  this.addEventListener(qx.Const.EVENT_TYPE_DBLCLICK, this._ondblclick);
};

qx.ui.form.ListItem.extend(qx.ui.basic.Atom, "qx.ui.form.ListItem");

qx.ui.form.ListItem.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "list-item" });
qx.ui.form.ListItem.addProperty({ name : "value" });





/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.matchesString = function(vText) {
  return vText != qx.Const.CORE_EMPTY && this.getLabel().toLowerCase().indexOf(vText.toLowerCase()) == 0;
};

proto.matchesStringExact = function(vText) {
  return vText != qx.Const.CORE_EMPTY && this.getLabel().toLowerCase() == String(vText).toLowerCase();
};

proto.matchesValue = function(vText) {
  return vText != qx.Const.CORE_EMPTY && this.getValue().toLowerCase().indexOf(vText.toLowerCase()) == 0;
};

proto.matchesValueExact = function(vText) {
  return vText != qx.Const.CORE_EMPTY && this.getValue().toLowerCase() == String(vText).toLowerCase();
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
