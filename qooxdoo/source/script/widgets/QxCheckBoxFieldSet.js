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

************************************************************************ */

function QxCheckBoxFieldSet(vLegend) {
  QxFieldSet.call(this, vLegend);
};

QxCheckBoxFieldSet.extend(QxFieldSet, "QxCheckBoxFieldSet");

proto._createLegendObject = function()
{
  this._legendObject = new QxCheckBox;
  this._legendObject.setAppearance("check-box-field-set-legend");
  this._legendObject.setChecked(true);
  
  this.add(this._legendObject);
};

proto.setIcon = proto.getIcon = null;
