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

function QxToolBarCheckBox(vText, vIcon, vChecked)
{
  QxToolBarButton.call(this, vText, vIcon);

  if (QxUtil.isValid(vChecked)) {
    this.setChecked(vChecked);
  };
};

QxToolBarCheckBox.extend(QxToolBarButton, "QxToolBarCheckBox");



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxToolBarCheckBox.addProperty({ name : "checked", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });





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
