/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(form)

************************************************************************ */

qx.OO.defineClass("qx.ui.groupbox.RadioGroupBox", qx.ui.groupbox.GroupBox, 
function(vLegend) {
  qx.ui.groupbox.GroupBox.call(this, vLegend);
});

qx.Proto._createLegendObject = function()
{
  this._legendObject = new qx.ui.form.RadioButton;
  this._legendObject.setAppearance("radio-button-field-set-legend");
  this._legendObject.setChecked(true);

  this.add(this._legendObject);
}

qx.Proto.setIcon = qx.Proto.getIcon = null;
