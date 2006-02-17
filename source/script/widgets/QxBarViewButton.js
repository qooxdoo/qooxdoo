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

#package(barview)

************************************************************************ */

function QxBarViewButton(vText, vIcon, vIconWidth, vIconHeight, vFlash) {
  QxCommonViewButton.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);
};

QxBarViewButton.extend(QxCommonViewButton, "QxBarViewButton");

QxBarViewButton.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "bar-view-button" });






/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onkeydown = function(e)
{
  switch(this.getView().getBarPosition())
  {
    case QxConst.ALIGN_TOP:
    case QxConst.ALIGN_BOTTOM:
      switch(e.getKeyCode())
      {
        case QxKeyEvent.keys.left:
          var vPrevious = true;
          break;

        case QxKeyEvent.keys.right:
          var vPrevious = false;
          break;

        default:
          return;
      };

      break;

    case QxConst.ALIGN_LEFT:
    case QxConst.ALIGN_RIGHT:
      switch(e.getKeyCode())
      {
        case QxKeyEvent.keys.up:
          var vPrevious = true;
          break;

        case QxKeyEvent.keys.down:
          var vPrevious = false;
          break;

        default:
          return;
      };

      break;

    default:
      return;
  };

  var vChild = vPrevious ? this.isFirstChild() ? this.getParent().getLastChild() : this.getPreviousSibling() : this.isLastChild() ? this.getParent().getFirstChild() : this.getNextSibling();

  // focus next/previous button
  vChild.setFocused(true);

  // and naturally also check it
  vChild.setChecked(true);
};
