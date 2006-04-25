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

#package(viewcommon)

************************************************************************ */

qx.OO.defineClass("qx.ui.pageview.AbstractPageViewPage", qx.ui.layout.CanvasLayout, 
function(vButton)
{
  qx.ui.layout.CanvasLayout.call(this);

  if (qx.util.Validation.isValid(vButton)) {
    this.setButton(vButton);
  };
});





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The attached QxTab to this page.
*/
qx.ui.pageview.AbstractPageViewPage.addProperty({ name : "button", type : qx.Const.TYPEOF_OBJECT });

/*!
  Make element displayed (if switched to true the widget will be created, if needed, too).
  Instead of qx.ui.core.Widget, the default is false here.
*/
qx.ui.pageview.AbstractPageViewPage.changeProperty({ name : "display", type : qx.Const.TYPEOF_BOOLEAN, defaultValue : false });




/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyButton = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.setPage(null);
  };

  if (propValue) {
    propValue.setPage(this);
  };

  return true;
};
