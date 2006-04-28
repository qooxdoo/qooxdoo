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

qx.OO.defineClass("qx.ui.pageview.buttonview.ButtonViewButton", qx.ui.pageview.AbstractPageViewButton, 
function(vText, vIcon, vIconWidth, vIconHeight, vFlash) {
  qx.ui.pageview.AbstractPageViewButton.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "bar-view-button" });






/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onkeydown = function(e)
{
  switch(this.getView().getBarPosition())
  {
    case qx.Const.ALIGN_TOP:
    case qx.Const.ALIGN_BOTTOM:
      switch(e.getKeyCode())
      {
        case qx.event.type.KeyEvent.keys.left:
          var vPrevious = true;
          break;

        case qx.event.type.KeyEvent.keys.right:
          var vPrevious = false;
          break;

        default:
          return;
      };

      break;

    case qx.Const.ALIGN_LEFT:
    case qx.Const.ALIGN_RIGHT:
      switch(e.getKeyCode())
      {
        case qx.event.type.KeyEvent.keys.up:
          var vPrevious = true;
          break;

        case qx.event.type.KeyEvent.keys.down:
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
