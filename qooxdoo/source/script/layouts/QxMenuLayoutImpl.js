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

#package(menu)

************************************************************************ */

function QxMenuLayoutImpl(vWidget)
{
  QxVerticalBoxLayoutImpl.call(this, vWidget);

  // We don't need flex support, should make things a bit faster, 
  // as this omits some additional loops in QxHorizontalBoxLayoutImpl.
  this.setEnableFlexSupport(false);    
};

QxMenuLayoutImpl.extend(QxVerticalBoxLayoutImpl, "QxMenuLayoutImpl");


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
  

  Inherits from QxVerticalBoxLayoutImpl:
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
proto.updateChildrenOnJobQueueFlush = function(vQueue)
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
        sch[j].addToLayoutChanges(QxConst.JOB_LOCATIONX);        
        
      };   
    };   
  };
  
  // Call superclass implementation
  return QxVerticalBoxLayoutImpl.prototype.updateChildrenOnJobQueueFlush.call(this, vQueue);
};
