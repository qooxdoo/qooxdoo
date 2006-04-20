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

qx.ui.form.InputCheckSymbol = function()
{
  qx.ui.basic.Terminator.call(this);

  this.setTagName("INPUT");
  this.setSelectable(false);

  if (qx.sys.Client.isMshtml())
  {
    // Take control over size of element (mshtml)
    this.setWidth(13);
    this.setHeight(13);
  }
  else if (qx.sys.Client.isGecko())
  {
    // Remove gecko default margin
    this.setMargin(0);
  };

  // we need to be sure that the dom protection of this is added
  this.forceTabIndex(1);
  this.setTabIndex(-1);
};

qx.ui.form.InputCheckSymbol.extend(qx.ui.basic.Terminator, "qx.ui.form.InputCheckSymbol");

qx.ui.form.InputCheckSymbol.addProperty({ name : "name", type : QxConst.TYPEOF_STRING, impl : "apply" });
qx.ui.form.InputCheckSymbol.addProperty({ name : "value", impl : "apply" });
qx.ui.form.InputCheckSymbol.addProperty({ name : "type", impl : "apply" });
qx.ui.form.InputCheckSymbol.addProperty({ name : "checked", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false, impl : "apply", getAlias : "isChecked" });

proto._modifyApply = function(propValue, propOldValue, propData) {
  return this.setHtmlProperty(propData.name, propValue);
};

proto.getPreferredBoxWidth = function() {
  return 13;
};

proto.getPreferredBoxHeight = function() {
  return 13;
};

proto.getBoxWidth = proto.getPreferredBoxWidth;
proto.getBoxHeight = proto.getPreferredBoxHeight;

proto.getInnerWidth = proto.getPreferredBoxWidth;
proto.getInnerHeight = proto.getPreferredBoxHeight;

if (qx.sys.Client.isMshtml())
{
  proto._afterAppear = function()
  {
    qx.ui.basic.Terminator.prototype._afterAppear.call(this);

    var vElement = this.getElement();
    vElement.checked = this.getChecked();

    if (!this.getEnabled()) {
      vElement.disabled = true;
    };
  };
};

proto._modifyEnabled = function(propValue, propOldValue, propData)
{
  propValue ? this.removeHtmlAttribute(QxConst.CORE_DISABLED) : this.setHtmlAttribute(QxConst.CORE_DISABLED, QxConst.CORE_DISABLED);
  return qx.ui.basic.Terminator.prototype._modifyEnabled.call(this, propValue, propOldValue, propData);
};
