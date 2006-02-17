/* ****************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2005 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:  //???Olli???
     * Oliver Vogel
       <o dot vogel at muv dot com>

**************************************************************************** */

/* ****************************************************************************

#package(form) //???Olli???
#require(QxBorderObject)
#require(QxTerminator)
#require(QxTimer)

**************************************************************************** */

// the width of the bar itself (in %)
QxProgressanim.BAR_WIDTH = 50;


function QxProgressanim()
{
  QxCanvasLayout.call(this);

  this.setWidth(250);
  this.setHeight(22);
  this.setBorder(QxBorderObject.presets.inset);
  this.setTabIndex(-1);

  // ***********************************************************************
  //   Progress-Bar itself
  // ***********************************************************************
  this._bar = new QxTerminator();
  this._bar.set({ left: 0, bottom: 0, top: 0, border : QxBorder.presets.none });
  this._bar.setBackgroundColor("green");
  this.add(this._bar);
  
  // ***********************************************************************
  //   TIMER FOR ANIMATION
  // ***********************************************************************
  this._timer = new QxTimer(100);
  this._timer.addEventListener(QxConst.EVENT_TYPE_INTERVAL, this._oninterval, this);
  
  // ***********************************************************************
  //   INITIALIZATION
  // ***********************************************************************
  this._position = 0;
  this._leftToRight = true;

  // Hide the Bar
  this.clearBar()
  
};

QxProgressanim.extend(QxCanvasLayout, "QxProgressanim");


/*
------------------------------------------------------------------------------------
  PREFERRED DIMENSIONS
------------------------------------------------------------------------------------
*/

proto._computePreferredInnerWidth = function() { //???Olli???
  return 200;
};

proto._computePreferredInnerHeight = function() { //???Olli???
  return 20;
};


/*
------------------------------------------------------------------------------------
  THE ACTION
------------------------------------------------------------------------------------
*/
proto.startAnimation = function(){
  this._timer.start();
}
proto.stopAnimation = function(){
  this._timer.stop();
}

proto.clearBar = function(){
  // set to a invisible position
  this._position = -QxProgressanim.BAR_WIDTH; // -x% startPosition + x% width of bar = 0!!!
  this._applyChanges();
  // next start of animation is from left to right
  this._leftToRight = true;
}


/*
------------------------------------------------------------------------------------
  INTERNAL STUFF
------------------------------------------------------------------------------------
*/
proto._applyChanges = function(){
  // set position and size of the bar to show the progress
  // if the position is outside, set the position to 0 and the width to the "difference"
  if (this._position < 0) // left outside?
  {
    // set position
    this._bar.setLeft(0);
    this._bar.setWidth((QxProgressanim.BAR_WIDTH - Math.abs(this._position)) + '%');
  QxWidget.flushGlobalQueues(); //???Olli??? is there any other possibility to show the changes imideatelly
    // ready
    return true;
  }
  if (this._position + QxProgressanim.BAR_WIDTH > 100) // right outside?
  {
    // set position
    this._bar.setLeft(this._position + '%');
    this._bar.setWidth((100 - this._position) + '%');
  QxWidget.flushGlobalQueues(); //???Olli??? is there any other possibility to show the changes imideatelly
    // ready
    return true;
  }
  
  // "normal" case (inside)
  // set position
  this._bar.setLeft(this._position + '%');
  this._bar.setWidth(QxProgressanim.BAR_WIDTH + '%');
  QxWidget.flushGlobalQueues(); //???Olli??? is there any other possibility to show the changes imideatelly
  // ready
  return true;
}

/*
------------------------------------------------------------------------------------
  INTERVAL HANDLING
------------------------------------------------------------------------------------
*/
proto._oninterval = function(e)
{
  // handle the direction
  if (this._leftToRight)
  {
    this._position += 2; // new position
    if (this._position >= 100) this._leftToRight = false; // change the direction ?
  }
  else
  {
    this._position -= 2; // new position
    if (this._position + QxProgressanim.BAR_WIDTH <= 0) this._leftToRight = true;  // change the direction ?
  }    
  
  // Show the changes
  this._applyChanges();
};


/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (this._bar)
  {
    this._bar.dispose();
    this._bar = null;
  };
  
  return QxCanvasLayout.prototype.dispose.call(this);
};