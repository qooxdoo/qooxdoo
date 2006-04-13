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

#package(toolbar)

************************************************************************ */

qx.ui.toolbar.ToolBarCheckBox = function(vText, vIcon, vChecked)
{
  qx.ui.toolbar.ToolBarButton.call(this, vText, vIcon);

  if (qx.util.validator.isValid(vChecked)) {
    this.setChecked(vChecked);
  };
};

qx.ui.toolbar.ToolBarCheckBox.extend(qx.ui.toolbar.ToolBarButton, "qx.ui.toolbar.ToolBarCheckBox");



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.ui.toolbar.ToolBarCheckBox.addProperty({ name : "checked", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });





/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyChecked = function(propValue, propOldValue, propData)
{
  propValue ? this.addState(QxConst.STATE_CHECKED) : this.removeState(QxConst.STATE_CHECKED);
  return true;
};





/*
---------------------------------------------------------------------------
  EVENTS
---------------------------------------------------------------------------
*/

proto._onmouseup = function(e)
{
  this.setCapture(false);

  if (!this.hasState(QxConst.STATE_ABANDONED))
  {
    this.addState(QxConst.STATE_OVER);
    this.setChecked(!this.getChecked());
    this.execute();
  };

  this.removeState(QxConst.STATE_ABANDONED);
  this.removeState(QxConst.STATE_PRESSED);

  e.stopPropagation();
};
