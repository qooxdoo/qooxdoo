/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

/*!
  The qooxdoo core event object. Each event object for qx.core.Targets should extend this class.
*/
qx.OO.defineClass("qx.event.type.Event", qx.core.Object,
function(vType)
{
  qx.core.Object.call(this, false);

  this.setType(vType);
});

qx.OO.addFastProperty({ name : "type", setOnlyOnce : true });

qx.OO.addFastProperty({ name : "originalTarget", setOnlyOnce : true });
qx.OO.addFastProperty({ name : "target", setOnlyOnce : true });
qx.OO.addFastProperty({ name : "relatedTarget", setOnlyOnce : true });
qx.OO.addFastProperty({ name : "currentTarget" });

qx.OO.addFastProperty({ name : "bubbles", defaultValue : false, noCompute : true });
qx.OO.addFastProperty({ name : "propagationStopped", defaultValue : true, noCompute : true });
qx.OO.addFastProperty({ name : "defaultPrevented", defaultValue : false, noCompute : true });

/**
 * Allow or disallow the event dispatcher to dispose of the event.  The event
 * listener may change this property to false to prevent the dispatcher from
 * disposing of the event.  This would be useful, for example, if the listener
 * wishes to save the event for later processing.
 */
qx.OO.addFastProperty({ name : "allowDispatcherDispose", defaultValue : true });

/**
 * Track whether an event dispatcher wants or does not want the event to be
 * disposed after all event handlers run.
 */
qx.OO.addFastProperty({ name : "dispatcherWantsDispose", defaultValue : true });




/*
---------------------------------------------------------------------------
  SHORTCUTS
---------------------------------------------------------------------------
*/

qx.Proto.preventDefault = function() {
  this.setDefaultPrevented(true);
}

qx.Proto.stopPropagation = function() {
  this.setPropagationStopped(true);
}




/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  }

  this._valueOriginalTarget = null;
  this._valueTarget = null;
  this._valueRelatedTarget = null;
  this._valueCurrentTarget = null;

  return qx.core.Object.prototype.dispose.call(this);
}
