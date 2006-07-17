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

#module(viewcommon)
#require(qx.constant.Type)

************************************************************************ */

qx.OO.defineClass("qx.ui.pageview.AbstractPageViewPage", qx.ui.layout.CanvasLayout,
function(vButton)
{
  qx.ui.layout.CanvasLayout.call(this);

  if (qx.util.Validation.isValid(vButton)) {
    this.setButton(vButton);
  }
});





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The attached tab of this page.
*/
qx.OO.addProperty({ name : "button", type : qx.constant.Type.OBJECT });

/*!
  Make element displayed (if switched to true the widget will be created, if needed, too).
  Instead of qx.ui.core.Widget, the default is false here.
*/
qx.OO.changeProperty({ name : "display", type : qx.constant.Type.BOOLEAN, defaultValue : false });




/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyButton = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.setPage(null);
  }

  if (propValue) {
    propValue.setPage(this);
  }

  return true;
}
