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

#post(qx.ui.pageview.buttonview.ButtonViewBar)
#post(qx.ui.pageview.buttonview.ButtonViewPane)

#package(barview)

************************************************************************ */

/*!
  One of the widgets which could be used to structurize the interface.

  qx.ui.pageview.buttonview.ButtonView creates the typical apple-like tabview-replacements which could also
  be found in more modern versions of the settings dialog in Mozilla Firefox.
*/
qx.ui.pageview.buttonview.ButtonView = function()
{
  qx.ui.pageview.AbstractPageView.call(this, qx.ui.pageview.buttonview.ButtonViewBar, qx.ui.pageview.buttonview.ButtonViewPane);

  this.setOrientation(qx.Const.ORIENTATION_VERTICAL);
};

qx.ui.pageview.buttonview.ButtonView.extend(qx.ui.pageview.AbstractPageView, "qx.ui.pageview.buttonview.ButtonView");





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.ui.pageview.buttonview.ButtonView.addProperty({ name : "barPosition", type : qx.Const.TYPEOF_STRING, defaultValue : qx.Const.ALIGN_TOP, possibleValues : [ qx.Const.ALIGN_TOP, qx.Const.ALIGN_RIGHT, qx.Const.ALIGN_BOTTOM, qx.Const.ALIGN_LEFT ] });

qx.ui.pageview.buttonview.ButtonView.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "bar-view" });





/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyBarPosition = function(propValue, propOldValue, propData)
{
  var vBar = this._bar;

  // move bar around and change orientation
  switch(propValue)
  {
    case qx.Const.ALIGN_TOP:
      vBar.moveSelfToBegin();
      this.setOrientation(qx.Const.ORIENTATION_VERTICAL);
      break;

    case qx.Const.ALIGN_BOTTOM:
      vBar.moveSelfToEnd();
      this.setOrientation(qx.Const.ORIENTATION_VERTICAL);
      break;

    case qx.Const.ALIGN_LEFT:
      vBar.moveSelfToBegin();
      this.setOrientation(qx.Const.ORIENTATION_HORIZONTAL);
      break;

    case qx.Const.ALIGN_RIGHT:
      vBar.moveSelfToEnd();
      this.setOrientation(qx.Const.ORIENTATION_HORIZONTAL);
      break;
  };

  // force re-apply of states for bar and pane
  this._addChildrenToStateQueue();

  // force re-apply of states for all tabs
  vBar._addChildrenToStateQueue();

  return true;
};
