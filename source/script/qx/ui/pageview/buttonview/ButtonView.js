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

#use(qx.ui.pageview.buttonview.ButtonViewBar)
#use(qx.ui.pageview.buttonview.ButtonViewPane)

#module(barview)

************************************************************************ */

/*!
  One of the widgets which could be used to structurize the interface.

  qx.ui.pageview.buttonview.ButtonView creates the typical apple-like tabview-replacements which could also
  be found in more modern versions of the settings dialog in Mozilla Firefox.
*/
qx.OO.defineClass("qx.ui.pageview.buttonview.ButtonView", qx.ui.pageview.AbstractPageView, 
function()
{
  qx.ui.pageview.AbstractPageView.call(this, qx.ui.pageview.buttonview.ButtonViewBar, qx.ui.pageview.buttonview.ButtonViewPane);

  this.setOrientation(qx.constant.Layout.ORIENTATION_VERTICAL);
});





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "barPosition", type : qx.constant.Type.STRING, defaultValue : qx.constant.Layout.ALIGN_TOP, possibleValues : [ qx.constant.Layout.ALIGN_TOP, qx.constant.Layout.ALIGN_RIGHT, qx.constant.Layout.ALIGN_BOTTOM, qx.constant.Layout.ALIGN_LEFT ] });

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "bar-view" });





/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyBarPosition = function(propValue, propOldValue, propData)
{
  var vBar = this._bar;

  // move bar around and change orientation
  switch(propValue)
  {
    case qx.constant.Layout.ALIGN_TOP:
      vBar.moveSelfToBegin();
      this.setOrientation(qx.constant.Layout.ORIENTATION_VERTICAL);
      break;

    case qx.constant.Layout.ALIGN_BOTTOM:
      vBar.moveSelfToEnd();
      this.setOrientation(qx.constant.Layout.ORIENTATION_VERTICAL);
      break;

    case qx.constant.Layout.ALIGN_LEFT:
      vBar.moveSelfToBegin();
      this.setOrientation(qx.constant.Layout.ORIENTATION_HORIZONTAL);
      break;

    case qx.constant.Layout.ALIGN_RIGHT:
      vBar.moveSelfToEnd();
      this.setOrientation(qx.constant.Layout.ORIENTATION_HORIZONTAL);
      break;
  }

  // force re-apply of states for bar and pane
  this._addChildrenToStateQueue();

  // force re-apply of states for all tabs
  vBar._addChildrenToStateQueue();

  return true;
}
