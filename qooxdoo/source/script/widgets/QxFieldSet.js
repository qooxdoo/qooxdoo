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

#package(form)
#require(QxAtom)
#appearance(fieldset)

************************************************************************ */

function QxFieldSet(vLegend, vIcon)
{
  QxCanvasLayout.call(this);


  // ************************************************************************
  //   SUB WIDGETS
  // ************************************************************************
  this._createFrameObject();
  this._createLegendObject();


  // ************************************************************************
  //   INIT
  // ************************************************************************
  this.setLegend(vLegend);

  if (QxUtil.isValidString(vIcon)) {
    this.setIcon(vIcon);
  };


  // ************************************************************************
  //   REMAPPING
  // ************************************************************************
  this.remapChildrenHandlingTo(this._frameObject);
};

QxFieldSet.extend(QxCanvasLayout, "QxFieldSet");

QxFieldSet.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "field-set" });




/*
---------------------------------------------------------------------------
  SUB WIDGET CREATION
---------------------------------------------------------------------------
*/

proto._createLegendObject = function()
{
  this._legendObject = new QxAtom;
  this._legendObject.setAppearance("field-set-legend");
  
  this.add(this._legendObject);
};

proto._createFrameObject = function()
{
  this._frameObject = new QxCanvasLayout;
  this._frameObject.setAppearance("field-set-frame");

  this.add(this._frameObject);
};





/*
---------------------------------------------------------------------------
  GETTER FOR SUB WIDGETS
---------------------------------------------------------------------------
*/

proto.getFrameObject = function() {
  return this._frameObject;
};

proto.getLegendObject = function() {
  return this._legendObject;
};






/*
---------------------------------------------------------------------------
  SETTER/GETTER
---------------------------------------------------------------------------
*/

proto.setLegend = function(vLegend) {
  this._legendObject.setLabel(vLegend);
};

proto.getLegend = function() {
  return this._legendObject.getLabel();
};

proto.setIcon = function(vIcon) {
  this._legendObject.setIcon(vIcon);
};

proto.getIcon = function() {
  this._legendObject.getIcon();
};






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };

  if (this._legendObject)
  {
    this._legendObject.dispose();
    this._legendObject = null;
  };

  if (this._frameObject)
  {
    this._frameObject.dispose();
    this._frameObject = null;
  };

  return QxCanvasLayout.prototype.dispose.call(this);
};
