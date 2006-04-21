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
#require(qx.ui.form.Button)

**************************************************************************** */

function QxButtonPane(vOrientation) {
  qx.ui.layout.BoxLayout.call(this, vOrientation);

  var okB = this._ok = new qx.ui.form.Button("Ok");
  okB.setPadding(2);
  okB.addEventListener("execute", this.executeOk);

  var cancelB = this._cancel = new qx.ui.form.Button("Cancel");
  cancelB.setPadding(2);
  cancelB.addEventListener("execute", this.executeCancel);

  var helpB = this._help = new qx.ui.form.Button("Help");
  helpB.setPadding(2);
  helpB.addEventListener("execute", this.executeHelp);

  this.add(okB, cancelB, helpB);
};

QxButtonPane.extend(qx.ui.layout.BoxLayout, "QxButtonPane");


/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Appearance setting for the class.
*/
QxButtonPane.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "buttonpane" });


/*
------------------------------------------------------------------------------------
  UTILITIES
------------------------------------------------------------------------------------
*/

proto.getOkButton = function()
{
  return this._okB;
};

proto.getCancelButton = function()
{
  return this._cancelB;
};

proto.getHelpButton = function()
{
  return this._helpB;
};

proto.executeOk = function(e)
{
};

proto.executeCancel = function(e)
{
};

proto.executeHelp = function(e)
{
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

  if (this._okB)
  {
    this._okB.dispose();
    this._okB = null;
  };

  if (this._cancelB)
  {
    this._cancelB.dispose();
    this._cancelB = null;
  };

  if (this._helpB)
  {
    this._helpB.dispose();
    this._helpB = null;
  };

  return qx.ui.layout.BoxLayout.prototype.dispose.call(this);
};
