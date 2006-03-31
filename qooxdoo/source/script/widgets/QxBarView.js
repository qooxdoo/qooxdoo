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

#post(QxBarViewBar)
#post(QxBarViewPane)

#package(barview)

************************************************************************ */

/*!
  One of the widgets which could be used to structurize the interface.

  QxBarView creates the typical apple-like tabview-replacements which could also
  be found in more modern versions of the settings dialog in Mozilla Firefox.
*/
function QxBarView()
{
  QxCommonView.call(this, QxBarViewBar, QxBarViewPane);

  this.setOrientation(QxConst.ORIENTATION_VERTICAL);
};

QxBarView.extend(QxCommonView, "QxBarView");





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxBarView.addProperty({ name : "barPosition", type : QxConst.TYPEOF_STRING, defaultValue : QxConst.ALIGN_TOP, possibleValues : [ QxConst.ALIGN_TOP, QxConst.ALIGN_RIGHT, QxConst.ALIGN_BOTTOM, QxConst.ALIGN_LEFT ] });

QxBarView.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "bar-view" });





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
    case QxConst.ALIGN_TOP:
      vBar.moveSelfToBegin();
      this.setOrientation(QxConst.ORIENTATION_VERTICAL);
      break;

    case QxConst.ALIGN_BOTTOM:
      vBar.moveSelfToEnd();
      this.setOrientation(QxConst.ORIENTATION_VERTICAL);
      break;

    case QxConst.ALIGN_LEFT:
      vBar.moveSelfToBegin();
      this.setOrientation(QxConst.ORIENTATION_HORIZONTAL);
      break;

    case QxConst.ALIGN_RIGHT:
      vBar.moveSelfToEnd();
      this.setOrientation(QxConst.ORIENTATION_HORIZONTAL);
      break;
  };

  // force re-apply of states for bar and pane
  this._addChildrenToStateQueue();

  // force re-apply of states for all tabs
  vBar._addChildrenToStateQueue();

  return true;
};
