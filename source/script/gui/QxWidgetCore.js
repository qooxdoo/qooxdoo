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
#require(qx.ui.core.Widget)
#require(qx.core.Settings)
#post(qx.ui.basic.Inline)

************************************************************************ */




/*
---------------------------------------------------------------------------
  ALL QUEUES
---------------------------------------------------------------------------
*/

if (qx.core.Settings.enableWidgetDebug)
{
  qx.ui.core.Widget.flushGlobalQueues = function()
  {
    if (qx.ui.core.Widget._inFlushGlobalQueues || !window.application.isReady()) {
      return;
    };

    if (!(qx.ui.core.Widget._globalWidgetQueue.length > 0 || qx.ui.core.Widget._globalElementQueue.length > 0 ||
        qx.ui.core.Widget._globalStateQueue.length > 0  || qx.ui.core.Widget._globalJobQueue.length > 0 ||
        qx.ui.core.Widget._globalLayoutQueue.length > 0 || qx.ui.core.Widget._fastGlobalDisplayQueue.length > 0 ||
        !qx.lang.Object.isEmpty(qx.ui.core.Widget._lazyGlobalDisplayQueue))) {
      return;
    };

    // Also used for inline event handling to seperate 'real' events
    qx.ui.core.Widget._inFlushGlobalQueues = true;

    var vStart;

    vStart = (new Date).valueOf();
    qx.ui.core.Widget.flushGlobalWidgetQueue();
    var vWidgetDuration = (new Date).valueOf() - vStart;

    vStart = (new Date).valueOf();
    qx.ui.core.Widget.flushGlobalStateQueue();
    var vStateDuration = (new Date).valueOf() - vStart;

    vStart = (new Date).valueOf();
    qx.ui.core.Widget.flushGlobalElementQueue();
    var vElementDuration = (new Date).valueOf() - vStart;

    vStart = (new Date).valueOf();
    qx.ui.core.Widget.flushGlobalJobQueue();
    var vJobDuration = (new Date).valueOf() - vStart;

    vStart = (new Date).valueOf();
    qx.ui.core.Widget.flushGlobalLayoutQueue();
    var vLayoutDuration = (new Date).valueOf() - vStart;

    vStart = (new Date).valueOf();
    qx.ui.core.Widget.flushGlobalDisplayQueue();
    var vDisplayDuration = (new Date).valueOf() - vStart;

    var vSum = vWidgetDuration + vStateDuration + vElementDuration + vJobDuration + vLayoutDuration + vDisplayDuration;

    if (vSum > 0)
    {
      qx.dev.Debug("QxWidgetCore", "Flush Global Queues", "info");
      qx.dev.Debug("QxWidgetCore", "Widgets: " + vWidgetDuration + "ms");
      qx.dev.Debug("QxWidgetCore", "State: " + vStateDuration + "ms");
      qx.dev.Debug("QxWidgetCore", "Element: " + vElementDuration + "ms");
      qx.dev.Debug("QxWidgetCore", "Job: " + vJobDuration + "ms");
      qx.dev.Debug("QxWidgetCore", "Layout: " + vLayoutDuration + "ms");
      qx.dev.Debug("QxWidgetCore", "Display: " + vDisplayDuration + "ms");

      window.status = "Flush: Widget:" + vWidgetDuration + " State:" + vStateDuration + " Element:" + vElementDuration + " Job:" + vJobDuration + " Layout:" + vLayoutDuration + " Display:" + vDisplayDuration;
    };

    delete qx.ui.core.Widget._inFlushGlobalQueues;
  };
}
else
{
  qx.ui.core.Widget.flushGlobalQueues = function()
  {
    if (qx.ui.core.Widget._inFlushGlobalQueues || !window.application.isReady()) {
      return;
    };

    // Also used for inline event handling to seperate 'real' events
    qx.ui.core.Widget._inFlushGlobalQueues = true;

    qx.ui.core.Widget.flushGlobalWidgetQueue();
    qx.ui.core.Widget.flushGlobalStateQueue();
    qx.ui.core.Widget.flushGlobalElementQueue();
    qx.ui.core.Widget.flushGlobalJobQueue();
    qx.ui.core.Widget.flushGlobalLayoutQueue();
    qx.ui.core.Widget.flushGlobalDisplayQueue();

    delete qx.ui.core.Widget._inFlushGlobalQueues;
  };
};






/*
---------------------------------------------------------------------------
  WIDGET QUEUE

  Allows widgets to register to the widget queue to do multiple things
  before the other queues will be flushed
---------------------------------------------------------------------------
*/

qx.ui.core.Widget._globalWidgetQueue = [];

qx.ui.core.Widget.addToGlobalWidgetQueue = function(vWidget)
{
  if (!vWidget._isInGlobalWidgetQueue && vWidget._isDisplayable)
  {
    qx.ui.core.Widget._globalWidgetQueue.push(vWidget);
    vWidget._isInGlobalWidgetQueue = true;
  };
};

qx.ui.core.Widget.removeFromGlobalWidgetQueue = function(vWidget)
{
  if (vWidget._isInGlobalWidgetQueue)
  {
    qx.ui.core.Widget._globalWidgetQueue.remove(vWidget);
    delete vWidget._isInGlobalWidgetQueue;
  };
};

qx.ui.core.Widget.flushGlobalWidgetQueue = function()
{
  var vQueue=qx.ui.core.Widget._globalWidgetQueue, vLength, vWidget;

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

qx.ui.core.Widget._globalElementQueue = [];

qx.ui.core.Widget.addToGlobalElementQueue = function(vWidget)
{
  if (!vWidget._isInGlobalElementQueue && vWidget._isDisplayable)
  {
    qx.ui.core.Widget._globalElementQueue.push(vWidget);
    vWidget._isInGlobalElementQueue = true;
  };
};

qx.ui.core.Widget.removeFromGlobalElementQueue = function(vWidget)
{
  if (vWidget._isInGlobalElementQueue)
  {
    qx.ui.core.Widget._globalElementQueue.remove(vWidget);
    delete vWidget._isInGlobalElementQueue;
  };
};

qx.ui.core.Widget.flushGlobalElementQueue = function()
{
  var vQueue=qx.ui.core.Widget._globalElementQueue, vLength, vWidget;

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

qx.ui.core.Widget._globalStateQueue = [];

qx.ui.core.Widget.addToGlobalStateQueue = function(vWidget)
{
  if (!vWidget._isInGlobalStateQueue && vWidget._isDisplayable)
  {
    qx.ui.core.Widget._globalStateQueue.push(vWidget);
    vWidget._isInGlobalStateQueue = true;
  };
};

qx.ui.core.Widget.removeFromGlobalStateQueue = function(vWidget)
{
  if (vWidget._isInGlobalStateQueue)
  {
    qx.ui.core.Widget._globalStateQueue.remove(vWidget);
    delete vWidget._isInGlobalStateQueue;
  };
};

qx.ui.core.Widget.flushGlobalStateQueue = function()
{
  var vQueue=qx.ui.core.Widget._globalStateQueue, vLength, vWidget;

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

qx.ui.core.Widget._globalJobQueue = [];

qx.ui.core.Widget.addToGlobalJobQueue = function(vWidget)
{
  if (!vWidget._isInGlobalJobQueue && vWidget._isDisplayable)
  {
    qx.ui.core.Widget._globalJobQueue.push(vWidget);
    vWidget._isInGlobalJobQueue = true;
  };
};

qx.ui.core.Widget.removeFromGlobalJobQueue = function(vWidget)
{
  if (vWidget._isInGlobalJobQueue)
  {
    qx.ui.core.Widget._globalJobQueue.remove(vWidget);
    delete vWidget._isInGlobalJobQueue;
  };
};

qx.ui.core.Widget.flushGlobalJobQueue = function()
{
  var vQueue=qx.ui.core.Widget._globalJobQueue, vLength, vWidget;

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

  Contains the parents (qx.ui.core.Parent) of the children which needs layout updates
---------------------------------------------------------------------------
*/

qx.ui.core.Widget._globalLayoutQueue = [];

qx.ui.core.Widget.addToGlobalLayoutQueue = function(vParent)
{
  if (!vParent._isInGlobalLayoutQueue && vParent._isDisplayable)
  {
    qx.ui.core.Widget._globalLayoutQueue.push(vParent);
    vParent._isInGlobalLayoutQueue = true;
  };
};

qx.ui.core.Widget.removeFromGlobalLayoutQueue = function(vParent)
{
  if (vParent._isInGlobalLayoutQueue)
  {
    qx.ui.core.Widget._globalLayoutQueue.remove(vParent);
    delete vParent._isInGlobalLayoutQueue;
  };
};

qx.ui.core.Widget.flushGlobalLayoutQueue = function()
{
  var vQueue=qx.ui.core.Widget._globalLayoutQueue, vLength, vParent;

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

qx.ui.core.Widget._fastGlobalDisplayQueue = [];
qx.ui.core.Widget._lazyGlobalDisplayQueues = {};

qx.ui.core.Widget.addToGlobalDisplayQueue = function(vWidget)
{
  if (!vWidget._isInGlobalDisplayQueue && vWidget._isDisplayable)
  {
    var vParent = vWidget.getParent();

    if (vParent.isSeeable())
    {
      var vKey = vParent.toHashCode();

      if (qx.ui.core.Widget._lazyGlobalDisplayQueues[vKey])
      {
        qx.ui.core.Widget._lazyGlobalDisplayQueues[vKey].push(vWidget);
      }
      else
      {
        qx.ui.core.Widget._lazyGlobalDisplayQueues[vKey] = [vWidget];
      };
    }
    else
    {
      qx.ui.core.Widget._fastGlobalDisplayQueue.push(vWidget);
    };

    vWidget._isInGlobalDisplayQueue = true;
  };
};

qx.ui.core.Widget.removeFromGlobalDisplayQueue = function(vWidget) {};

qx.ui.core.Widget.flushGlobalDisplayQueue = function()
{
  var vKey, vLazyQueue, vWidget, vFragment;

  var vFastQueue = qx.ui.core.Widget._fastGlobalDisplayQueue;
  var vLazyQueues = qx.ui.core.Widget._lazyGlobalDisplayQueues;




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

      if (vWidget instanceof qx.ui.basic.Inline)
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
  // because through the recursion from qx.ui.core.Parent
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

qx.ui.core.Widget.getActiveSiblingHelperIgnore = function(vIgnoreClasses, vInstance)
{
  for (var j=0; j<vIgnoreClasses.length; j++) {
    if (vInstance instanceof vIgnoreClasses[j]) {
      return true;
    };
  };

  return false;
};

qx.ui.core.Widget.getActiveSiblingHelper = function(vObject, vParent, vCalc, vIgnoreClasses, vMode)
{
  if (!vIgnoreClasses) {
    vIgnoreClasses = [];
  };

  var vChilds = vParent.getChildren();
  var vPosition = qx.util.Validation.isInvalid(vMode) ? vChilds.indexOf(vObject) + vCalc : vMode == "first" ? 0 : vChilds.length-1;
  var vInstance = vChilds[vPosition];

  while(!vInstance.isEnabled() || qx.ui.core.Widget.getActiveSiblingHelperIgnore(vIgnoreClasses, vInstance))
  {
    vPosition += vCalc;
    vInstance = vChilds[vPosition];

    if (!vInstance) {
      return null;
    };
  };

  return vInstance;
};
