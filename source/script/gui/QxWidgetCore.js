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

#package(guicore)
#require(QxWidget)
#require(QxSettings)
#post(QxInline)

************************************************************************ */




/*
---------------------------------------------------------------------------
  ALL QUEUES
---------------------------------------------------------------------------
*/

if (QxSettings.enableWidgetDebug)
{
  QxWidget.flushGlobalQueues = function()
  {
    if (QxWidget._inFlushGlobalQueues || !window.application.isReady()) {
      return;
    };

    if (!(QxWidget._globalWidgetQueue.length > 0 || QxWidget._globalElementQueue.length > 0 ||
        QxWidget._globalStateQueue.length > 0  || QxWidget._globalJobQueue.length > 0 ||
        QxWidget._globalLayoutQueue.length > 0 || QxWidget._fastGlobalDisplayQueue.length > 0 ||
        !QxUtil.isObjectEmpty(QxWidget._lazyGlobalDisplayQueue))) {
      return;
    };

    // Also used for inline event handling to seperate 'real' events
    QxWidget._inFlushGlobalQueues = true;

    var vStart;

    vStart = (new Date).valueOf();
    QxWidget.flushGlobalWidgetQueue();
    var vWidgetDuration = (new Date).valueOf() - vStart;

    vStart = (new Date).valueOf();
    QxWidget.flushGlobalStateQueue();
    var vStateDuration = (new Date).valueOf() - vStart;

    vStart = (new Date).valueOf();
    QxWidget.flushGlobalElementQueue();
    var vElementDuration = (new Date).valueOf() - vStart;

    vStart = (new Date).valueOf();
    QxWidget.flushGlobalJobQueue();
    var vJobDuration = (new Date).valueOf() - vStart;

    vStart = (new Date).valueOf();
    QxWidget.flushGlobalLayoutQueue();
    var vLayoutDuration = (new Date).valueOf() - vStart;

    vStart = (new Date).valueOf();
    QxWidget.flushGlobalDisplayQueue();
    var vDisplayDuration = (new Date).valueOf() - vStart;

    var vSum = vWidgetDuration + vStateDuration + vElementDuration + vJobDuration + vLayoutDuration + vDisplayDuration;

    if (vSum > 0)
    {
      QxDebug("QxWidgetCore", "Flush Global Queues", "info");
      QxDebug("QxWidgetCore", "Widgets: " + vWidgetDuration + "ms");
      QxDebug("QxWidgetCore", "State: " + vStateDuration + "ms");
      QxDebug("QxWidgetCore", "Element: " + vElementDuration + "ms");
      QxDebug("QxWidgetCore", "Job: " + vJobDuration + "ms");
      QxDebug("QxWidgetCore", "Layout: " + vLayoutDuration + "ms");
      QxDebug("QxWidgetCore", "Display: " + vDisplayDuration + "ms");

      window.status = "Flush: Widget:" + vWidgetDuration + " State:" + vStateDuration + " Element:" + vElementDuration + " Job:" + vJobDuration + " Layout:" + vLayoutDuration + " Display:" + vDisplayDuration;
    };

    delete QxWidget._inFlushGlobalQueues;
  };
}
else
{
  QxWidget.flushGlobalQueues = function()
  {
    if (QxWidget._inFlushGlobalQueues || !window.application.isReady()) {
      return;
    };

    // Also used for inline event handling to seperate 'real' events
    QxWidget._inFlushGlobalQueues = true;

    QxWidget.flushGlobalWidgetQueue();
    QxWidget.flushGlobalStateQueue();
    QxWidget.flushGlobalElementQueue();
    QxWidget.flushGlobalJobQueue();
    QxWidget.flushGlobalLayoutQueue();
    QxWidget.flushGlobalDisplayQueue();

    delete QxWidget._inFlushGlobalQueues;
  };
};






/*
---------------------------------------------------------------------------
  WIDGET QUEUE

  Allows widgets to register to the widget queue to do multiple things
  before the other queues will be flushed
---------------------------------------------------------------------------
*/

QxWidget._globalWidgetQueue = [];

QxWidget.addToGlobalWidgetQueue = function(vWidget)
{
  if (!vWidget._isInGlobalWidgetQueue && vWidget._isDisplayable)
  {
    QxWidget._globalWidgetQueue.push(vWidget);
    vWidget._isInGlobalWidgetQueue = true;
  };
};

QxWidget.removeFromGlobalWidgetQueue = function(vWidget)
{
  if (vWidget._isInGlobalWidgetQueue)
  {
    QxWidget._globalWidgetQueue.remove(vWidget);
    delete vWidget._isInGlobalWidgetQueue;
  };
};

QxWidget.flushGlobalWidgetQueue = function()
{
  var vQueue=QxWidget._globalWidgetQueue, vLength, vWidget;

  while ((vLength=vQueue.length) > 0)
  {
    for (var i=0; i<vLength; i++)
    {
      vWidget = vQueue[i];

      vWidget.flushWidgetQueue();
      delete vWidget._isInGlobalWidgetQueue;
    };

    vQueue.splice(0, vLength);
  };
};









/*
---------------------------------------------------------------------------
  ELEMENT QUEUE

  Contains the widgets which should be (dom-)created
---------------------------------------------------------------------------
*/

QxWidget._globalElementQueue = [];

QxWidget.addToGlobalElementQueue = function(vWidget)
{
  if (!vWidget._isInGlobalElementQueue && vWidget._isDisplayable)
  {
    QxWidget._globalElementQueue.push(vWidget);
    vWidget._isInGlobalElementQueue = true;
  };
};

QxWidget.removeFromGlobalElementQueue = function(vWidget)
{
  if (vWidget._isInGlobalElementQueue)
  {
    QxWidget._globalElementQueue.remove(vWidget);
    delete vWidget._isInGlobalElementQueue;
  };
};

QxWidget.flushGlobalElementQueue = function()
{
  var vQueue=QxWidget._globalElementQueue, vLength, vWidget;

  while ((vLength=vQueue.length) > 0)
  {
    for (var i=0; i<vLength; i++)
    {
      vWidget = vQueue[i];

      vWidget._createElementImpl();
      delete vWidget._isInGlobalElementQueue;
    };

    vQueue.splice(0, vLength);
  };
};






/*
---------------------------------------------------------------------------
  STATE QUEUE

  Contains the widgets which recently changed their state
---------------------------------------------------------------------------
*/

QxWidget._globalStateQueue = [];

QxWidget.addToGlobalStateQueue = function(vWidget)
{
  if (!vWidget._isInGlobalStateQueue && vWidget._isDisplayable)
  {
    QxWidget._globalStateQueue.push(vWidget);
    vWidget._isInGlobalStateQueue = true;
  };
};

QxWidget.removeFromGlobalStateQueue = function(vWidget)
{
  if (vWidget._isInGlobalStateQueue)
  {
    QxWidget._globalStateQueue.remove(vWidget);
    delete vWidget._isInGlobalStateQueue;
  };
};

QxWidget.flushGlobalStateQueue = function()
{
  var vQueue=QxWidget._globalStateQueue, vLength, vWidget;

  while ((vLength=vQueue.length) > 0)
  {
    for (var i=0; i<vLength; i++)
    {
      vWidget = vQueue[i];

      vWidget._applyStateAppearance();

      delete vWidget._isInGlobalStateQueue;
    };

    vQueue.splice(0, vLength);
  };
};







/*
---------------------------------------------------------------------------
  JOBS QUEUE

  Contains the widgets which need a update after they were visible before
---------------------------------------------------------------------------
*/

QxWidget._globalJobQueue = [];

QxWidget.addToGlobalJobQueue = function(vWidget)
{
  if (!vWidget._isInGlobalJobQueue && vWidget._isDisplayable)
  {
    QxWidget._globalJobQueue.push(vWidget);
    vWidget._isInGlobalJobQueue = true;
  };
};

QxWidget.removeFromGlobalJobQueue = function(vWidget)
{
  if (vWidget._isInGlobalJobQueue)
  {
    QxWidget._globalJobQueue.remove(vWidget);
    delete vWidget._isInGlobalJobQueue;
  };
};

QxWidget.flushGlobalJobQueue = function()
{
  var vQueue=QxWidget._globalJobQueue, vLength, vWidget;

  while ((vLength=vQueue.length) > 0)
  {
    for (var i=0; i<vLength; i++)
    {
      vWidget = vQueue[i];

      vWidget._flushJobQueue(vWidget._jobQueue);
      delete vWidget._isInGlobalJobQueue;
    };

    vQueue.splice(0, vLength);
  };
};






/*
---------------------------------------------------------------------------
  LAYOUT QUEUE

  Contains the parents (QxParent) of the children which needs layout updates
---------------------------------------------------------------------------
*/

QxWidget._globalLayoutQueue = [];

QxWidget.addToGlobalLayoutQueue = function(vParent)
{
  if (!vParent._isInGlobalLayoutQueue && vParent._isDisplayable)
  {
    QxWidget._globalLayoutQueue.push(vParent);
    vParent._isInGlobalLayoutQueue = true;
  };
};

QxWidget.removeFromGlobalLayoutQueue = function(vParent)
{
  if (vParent._isInGlobalLayoutQueue)
  {
    QxWidget._globalLayoutQueue.remove(vParent);
    delete vParent._isInGlobalLayoutQueue;
  };
};

QxWidget.flushGlobalLayoutQueue = function()
{
  var vQueue=QxWidget._globalLayoutQueue, vLength, vParent;

  while ((vLength=vQueue.length) > 0)
  {
    for (var i=0; i<vLength; i++)
    {
      vParent = vQueue[i];

      vParent._flushChildrenQueue();
      delete vParent._isInGlobalLayoutQueue;
    };

    vQueue.splice(0, vLength);
  };
};







/*
---------------------------------------------------------------------------
  DISPLAY QUEUE

  Contains the widgets which should initially become visible
---------------------------------------------------------------------------
*/

QxWidget._fastGlobalDisplayQueue = [];
QxWidget._lazyGlobalDisplayQueues = {};

QxWidget.addToGlobalDisplayQueue = function(vWidget)
{
  if (!vWidget._isInGlobalDisplayQueue && vWidget._isDisplayable)
  {
    var vParent = vWidget.getParent();

    if (vParent.isSeeable())
    {
      var vKey = vParent.toHashCode();

      if (QxWidget._lazyGlobalDisplayQueues[vKey])
      {
        QxWidget._lazyGlobalDisplayQueues[vKey].push(vWidget);
      }
      else
      {
        QxWidget._lazyGlobalDisplayQueues[vKey] = [vWidget];
      };
    }
    else
    {
      QxWidget._fastGlobalDisplayQueue.push(vWidget);
    };

    vWidget._isInGlobalDisplayQueue = true;
  };
};

QxWidget.removeFromGlobalDisplayQueue = function(vWidget) {};

QxWidget.flushGlobalDisplayQueue = function()
{
  var vKey, vLazyQueue, vWidget, vFragment;

  var vFastQueue = QxWidget._fastGlobalDisplayQueue;
  var vLazyQueues = QxWidget._lazyGlobalDisplayQueues;




  /* -----------------------------------------------
      Flush display queues
  ----------------------------------------------- */

  // Work on fast queue
  for (var i=0, l=vFastQueue.length; i<l; i++)
  {
    vWidget = vFastQueue[i];
    vWidget.getParent()._getTargetNode().appendChild(vWidget.getElement());
  };


  // Work on lazy queues: Inline widgets
  for (vKey in vLazyQueues)
  {
    vLazyQueue = vLazyQueues[vKey];

    for (var i=0; i<vLazyQueue.length; i++)
    {
      vWidget = vLazyQueue[i];

      if (vWidget instanceof QxInline)
      {
        vWidget._beforeInsertDom();

        try
        {
          document.getElementById(vWidget.getInlineNodeId()).appendChild(vWidget.getElement());
        }
        catch(ex)
        {
          vWidget.debug("Could not append to inline id: " + vWidget.getInlineNodeId() + ": " + ex);
        };

        vWidget._afterInsertDom();
        vWidget._afterAppear();

        // Remove inline widget from queue and fix iterator position
        vLazyQueue.remove(vWidget);
        i--;

        // Reset display queue flag
        delete vWidget._isInGlobalDisplayQueue;
      };
    };
  };


  // Work on lazy queues: Other widgets
  for (vKey in vLazyQueues)
  {
    vLazyQueue = vLazyQueues[vKey];

    // test for minimum childrens which should
    // be added to the same parent
    if (document.createDocumentFragment && vLazyQueue.length >= 3)
    {
      // creating new document fragment
      vFragment = document.createDocumentFragment();

      // appending all widget elements to fragment
      for (var i=0, l=vLazyQueue.length; i<l; i++)
      {
        vWidget = vLazyQueue[i];

        vWidget._beforeInsertDom();
        vFragment.appendChild(vWidget.getElement());
      };

      // append all fragment data at once to
      // the already visible parent widget element
      vLazyQueue[0].getParent()._getTargetNode().appendChild(vFragment);

      for (var i=0, l=vLazyQueue.length; i<l; i++)
      {
        vWidget = vLazyQueue[i];
        vWidget._afterInsertDom();
      };
    }
    else
    {
      // appending all widget elements (including previously added children)
      // to the already visible parent widget element
      for (var i=0, l=vLazyQueue.length; i<l; i++)
      {
        vWidget = vLazyQueue[i];

        vWidget._beforeInsertDom();
        vWidget.getParent()._getTargetNode().appendChild(vWidget.getElement());
        vWidget._afterInsertDom();
      };
    };
  };






  /* -----------------------------------------------
      Cleanup and appear signals
  ----------------------------------------------- */

  // Only need to do this with the lazy queues
  // because through the recursion from QxParent
  // all others get also informed.
  for (vKey in vLazyQueues)
  {
    vLazyQueue = vLazyQueues[vKey];

    for (var i=0, l=vLazyQueue.length; i<l; i++)
    {
      vWidget = vLazyQueue[i];

      if (vWidget.getVisibility()) {
        vWidget._afterAppear();
      };

      // Reset display queue flag
      delete vWidget._isInGlobalDisplayQueue;
    };

    delete vLazyQueues[vKey];
  };

  // Reset display queue flag for widgets in fastQueue
  for (var i=0, l=vFastQueue.length; i<l; i++) {
    delete vFastQueue[i]._isInGlobalDisplayQueue;
  };

  // Remove fast queue entries
  vFastQueue.removeAll();
};








/*
---------------------------------------------------------------------------
  GLOBAL HELPERS
---------------------------------------------------------------------------
*/

QxWidget.getActiveSiblingHelperIgnore = function(vIgnoreClasses, vInstance)
{
  for (var j=0; j<vIgnoreClasses.length; j++) {
    if (vInstance instanceof vIgnoreClasses[j]) {
      return true;
    };
  };

  return false;
};

QxWidget.getActiveSiblingHelper = function(vObject, vParent, vCalc, vIgnoreClasses, vMode)
{
  if (!vIgnoreClasses) {
    vIgnoreClasses = [];
  };

  var vChilds = vParent.getChildren();
  var vPosition = QxUtil.isInvalid(vMode) ? vChilds.indexOf(vObject) + vCalc : vMode == "first" ? 0 : vChilds.length-1;
  var vInstance = vChilds[vPosition];

  while(!vInstance.isEnabled() || QxWidget.getActiveSiblingHelperIgnore(vIgnoreClasses, vInstance))
  {
    vPosition += vCalc;
    vInstance = vChilds[vPosition];

    if (!vInstance) {
      return null;
    };
  };

  return vInstance;
};
