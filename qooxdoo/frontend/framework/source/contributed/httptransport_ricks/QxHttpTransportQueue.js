/*****************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     (C) 2006 by IT Operations PTY LTD (www.itoperations.com.au)
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Chris Ricks
       <chris at itoperations dot com dot au>

*****************************************************************************/
 
function QxHttpTransportQueue(activeCount, queuedCount) {
  if (!activeCount) {
    throw new Error("Active queue length must be explicitly set.");
  } else {
    this.setActiveLimit(activeCount);
  }
  
  if (queuedCount) {
    this.setQueueLimit(queuedCount);
  }
  
  this._active = new Array();
  
  if (0 != this.getQueueLimit()) {
    this._queued = new Array();
  }
}
 
QxHttpTransportQueue.extend(qx.core.Target, "QxHttpTransportQueue");
 
qx.Proto._activeLimit = -1;

qx.OO.addProperty({name : "queueLimit", type : qx.constant.Type.NUMBER, defaultValue : -1});

qx.Proto.getActiveLimit = function() {
  return this._activeLimit;
}

qx.Proto.setActiveLimit = function(limit) {
  if (0 <= limit && limit != this._activeLimit) {
    if (-1 == this._activeLimit) {
      QxHttpTransport.alterPoolSize(limit);
    } else {
      QxHttpTransport.alterPoolSize(limit - this._activeLimit);
    }
    this._activeLimit = limit;
  }
}

qx.Proto._active = null;
qx.Proto._queued = null;

qx.Proto.add = function() {
  for (var i = 0; i < arguments.length; i++) {
    this._add(arguments[i]);
  }
}

qx.Proto.remove = function() {
  for (var i = 0; i < arguments.length; i++) {
    this._remove(arguments[i]);
  }
}

qx.Proto.contains = function(req) {
  if (this._active.contains(req) || this._queued.contains(req)) {
    return true;
  } else {
    return false;
  }
}

qx.Proto._add = function(req) {
  if (this.contains(req)) {
    return;
  }
  if (this.getActiveLimit() == -1 || this._active.length < this.getActiveLimit()) {
    this._active.push(req);
    req._begin();
    return true;
  } else if (this.getQueueLimit() == -1 || this._queued.length < this.getQueueLimit()) {
    this._queued.push(req);
    return true;
  } else {
    return false;
  }
}

qx.Proto._pump = function() {
  if (this._active.length < this.getActiveLimit() && this._queued.length > 0) {
    var req = this._queued.getFirst();
    this._active.push(req);
    this._queued.remove(req);
    req._begin();
  }
}

qx.Proto.dispose = function() {
  // Cowardly refuse to dispose a non-empty queue instance
  if (0  == this._active.length && 0 == this._queued.length) {
    delete this._active;
    delete this._queued;
    
    return qx.core.Target.prototype.dispose.call(this);
  } else {
    return false;
  }
}

qx.Proto._remove = function(req) {
  this._active.remove(req);
  this._queued.remove(req);
  this._pump();
}