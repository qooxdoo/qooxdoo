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

qx.OO.defineClass("qx.ui.form.TextArea", qx.ui.form.TextField, 
function(vValue)
{
  qx.ui.form.TextField.call(this, vValue);

  this.setTagName("textarea");
  this.removeHtmlProperty("type");
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "text-area" });

qx.OO.addProperty({ name : "wrap", type : qx.constant.Type.BOOLEAN });

if (qx.sys.Client.isMshtml())
{
  qx.Proto._modifyWrap = function(propValue, propOldValue, propData) {
    return this.setStyleProperty("whiteSpace", propValue ? "normal" : "nowrap");
  };
}
else
{
  qx.Proto._modifyWrap = function(propValue, propOldValue, propData) {
    return this.setHtmlProperty("wrap", propValue ? "soft" : "off");
  };
};

qx.Proto._computePreferredInnerHeight = function() {
  return 60;
};
