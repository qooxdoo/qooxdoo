/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(form)

************************************************************************ */

qx.OO.defineClass("qx.ui.form.ListItem", qx.ui.basic.Atom,
function(vText, vIcon, vValue)
{
  qx.ui.basic.Atom.call(this, vText, vIcon);

  if (qx.util.Validation.isValid(vValue)) {
    this.setValue(vValue);
  }


  // ************************************************************************
  //   EVENT LISTENER
  // ************************************************************************
  this.addEventListener(qx.constant.Event.DBLCLICK, this._ondblclick);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "list-item" });
qx.OO.addProperty({ name : "value" });





/*
---------------------------------------------------------------------------
  STATE
---------------------------------------------------------------------------
*/

qx.Proto.handleStateChange = function()
{
  if (this.hasState(qx.manager.selection.SelectionManager.STATE_LEAD))
  {
    this.setStyleProperty("MozOutline", qx.constant.Style.FOCUS_OUTLINE);
    this.setStyleProperty("outline", qx.constant.Style.FOCUS_OUTLINE);
  }
  else
  {
    this.removeStyleProperty("MozOutline");
    this.removeStyleProperty("outline");
  }
}

// Remove default outline focus border
qx.Proto._applyStateStyleFocus = function(vStates) {};




/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.matchesString = function(vText) {
  return vText != qx.constant.Core.EMPTY && this.getLabel().toLowerCase().indexOf(vText.toLowerCase()) == 0;
}

qx.Proto.matchesStringExact = function(vText) {
  return vText != qx.constant.Core.EMPTY && this.getLabel().toLowerCase() == String(vText).toLowerCase();
}

qx.Proto.matchesValue = function(vText) {
  return vText != qx.constant.Core.EMPTY && this.getValue().toLowerCase().indexOf(vText.toLowerCase()) == 0;
}

qx.Proto.matchesValueExact = function(vText) {
  return vText != qx.constant.Core.EMPTY && this.getValue().toLowerCase() == String(vText).toLowerCase();
}





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
  }
}
