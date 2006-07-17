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

#module(menu)

************************************************************************ */

qx.OO.defineClass("qx.renderer.layout.MenuLayoutImpl", qx.renderer.layout.VerticalBoxLayoutImpl, 
function(vWidget)
{
  qx.renderer.layout.VerticalBoxLayoutImpl.call(this, vWidget);

  // We don't need flex support, should make things a bit faster,
  // as this omits some additional loops in qx.renderer.layout.HorizontalBoxLayoutImpl.
  this.setEnableFlexSupport(false);
});


/*!
  Global Structure:
  [01] COMPUTE BOX DIMENSIONS FOR AN INDIVIDUAL CHILD
  [02] COMPUTE NEEDED DIMENSIONS FOR AN INDIVIDUAL CHILD
  [03] COMPUTE NEEDED DIMENSIONS FOR ALL CHILDREN
  [04] UPDATE LAYOUT WHEN A CHILD CHANGES ITS OUTER DIMENSIONS
  [05] UPDATE CHILD ON INNER DIMENSION CHANGES OF LAYOUT
  [06] UPDATE LAYOUT ON JOB QUEUE FLUSH
  [07] UPDATE CHILDREN ON JOB QUEUE FLUSH
  [08] CHILDREN ADD/REMOVE/MOVE HANDLING
  [09] FLUSH LAYOUT QUEUES OF CHILDREN
  [10] LAYOUT CHILD
  [11] DISPOSER


  Inherits from qx.renderer.layout.VerticalBoxLayoutImpl:
  [01] COMPUTE BOX DIMENSIONS FOR AN INDIVIDUAL CHILD
  [02] COMPUTE NEEDED DIMENSIONS FOR AN INDIVIDUAL CHILD
  [03] COMPUTE NEEDED DIMENSIONS FOR ALL CHILDREN
  [04] UPDATE LAYOUT WHEN A CHILD CHANGES ITS OUTER DIMENSIONS
  [05] UPDATE CHILD ON INNER DIMENSION CHANGES OF LAYOUT
  [06] UPDATE LAYOUT ON JOB QUEUE FLUSH
  [08] CHILDREN ADD/REMOVE/MOVE HANDLING
  [09] FLUSH LAYOUT QUEUES OF CHILDREN
  [10] LAYOUT CHILD
  [11] DISPOSER
*/




/*
---------------------------------------------------------------------------
  [07] UPDATE CHILDREN ON JOB QUEUE FLUSH
---------------------------------------------------------------------------
*/

/*!
  Updates children on special jobs
*/
qx.Proto.updateChildrenOnJobQueueFlush = function(vQueue)
{
  var vWidget = this.getWidget();
  var ch, chc;

  if (vQueue.preferredInnerWidth)
  {
    var ch = vWidget.getChildren(), chl = ch.length, chc;
    var sch, schl;

    for (var i=0; i<chl; i++)
    {
      chc = ch[i];
      sch = chc.getChildren();
      schl = sch.length;

      for (var j=0; j<schl; j++)
      {
        sch[j].addToLayoutChanges(qx.ui.core.Widget.JOB_LOCATIONX);

      }
    }
  }

  // Call superclass implementation
  return qx.renderer.layout.VerticalBoxLayoutImpl.prototype.updateChildrenOnJobQueueFlush.call(this, vQueue);
}
