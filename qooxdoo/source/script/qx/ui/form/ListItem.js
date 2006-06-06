/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by Schlund + Partner AG, Germany
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sw at schlund dot de>
     * Andreas Ecker (ecker)
       <ae at schlund dot de>

************************************************************************ */

/* ************************************************************************

#package(list)

************************************************************************ */

qx.OO.defineClass("qx.ui.form.ListItem", qx.ui.basic.Atom, 
function(vText, vIcon, vValue)
{
  qx.ui.basic.Atom.call(this, vText, vIcon);

  if (qx.util.Validation.isValid(vValue)) {
    this.setValue(vValue);
  };


  // ************************************************************************
  //   EVENT LISTENER
  // ************************************************************************
  this.addEventListener(qx.constant.Event.DBLCLICK, this._ondblclick);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "list-item" });
qx.OO.addProperty({ name : "value" });





/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.matchesString = function(vText) {
  return vText != qx.constant.Core.EMPTY && this.getLabel().toLowerCase().indexOf(vText.toLowerCase()) == 0;
};

qx.Proto.matchesStringExact = function(vText) {
  return vText != qx.constant.Core.EMPTY && this.getLabel().toLowerCase() == String(vText).toLowerCase();
};

qx.Proto.matchesValue = function(vText) {
  return vText != qx.constant.Core.EMPTY && this.getValue().toLowerCase().indexOf(vText.toLowerCase()) == 0;
};

qx.Proto.matchesValueExact = function(vText) {
  return vText != qx.constant.Core.EMPTY && this.getValue().toLowerCase() == String(vText).toLowerCase();
};





/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._ondblclick = function(e)
{
  var vCommand = this.getCommand();
  if (vCommand) {
    vCommand.execute();
  };
};
