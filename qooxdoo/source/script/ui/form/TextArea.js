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

qx.ui.form.TextArea = function(vValue)
{
  qx.ui.form.TextField.call(this, vValue);

  this.setTagName("textarea");
  this.removeHtmlProperty("type");
};

qx.ui.form.TextArea.extend(qx.ui.form.TextField, "qx.ui.form.TextArea");

qx.ui.form.TextArea.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "text-area" });

qx.ui.form.TextArea.addProperty({ name : "wrap", type : qx.Const.TYPEOF_BOOLEAN });

if (qx.sys.Client.isMshtml())
{
  proto._modifyWrap = function(propValue, propOldValue, propData) {
    return this.setStyleProperty("whiteSpace", propValue ? "normal" : "nowrap");
  };
}
else
{
  proto._modifyWrap = function(propValue, propOldValue, propData) {
    return this.setHtmlProperty("wrap", propValue ? "soft" : "off");
  };
};

proto._computePreferredInnerHeight = function() {
  return 60;
};
