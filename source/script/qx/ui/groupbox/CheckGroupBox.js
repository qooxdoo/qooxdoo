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

#package(form)

************************************************************************ */

qx.OO.defineClass("qx.ui.groupbox.CheckGroupBox", qx.ui.groupbox.GroupBox, 
function(vLegend) {
  qx.ui.groupbox.GroupBox.call(this, vLegend);
});

qx.Proto._createLegendObject = function()
{
  this._legendObject = new qx.ui.form.CheckBox;
  this._legendObject.setAppearance("check-box-field-set-legend");
  this._legendObject.setChecked(true);

  this.add(this._legendObject);
};

qx.Proto.setIcon = qx.Proto.getIcon = null;
