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

/**
 * QxHttpTransport
 *
 * This class aims to provide robust XMLHttpRequest-based communication for the Qooxdoo framework.
 *
 * The following events are defined:
 *
 * - init 
 * - connect
 * - download
 * - done
 * - error
 * - progress
 *
 * Each of init, connect, download and done map to readyState 1 - 4. error is dispatched upon an error occuring and progress is
 * dispatched upon the size of the received content increasing.
 */
 
/*! 
 * Constructor 
 */

function QxHttpTransport() {
  qx.core.Target.call(this);
  
  if (QxHttpTransport._requestCtor == QxHttpTransport._dummyRequest) {
    throw new Error("Your current browser and/or configuration does not allow for XML HTTP requests to be issued.");
  } else {
    // Set up initial state
    
    var obj = this;
    this.__handleStateChange = function() {
      obj._handleStateChange();
    }
    
    with (this) {
      _lastReadyState = 0;
      _activeTimeouts = new Array();
      _pendingTimeouts = new Array();
    }
  }
}

// Extend base class

QxHttpTransport.extend(qx.core.Target, "QxHttpTransport");

/*!
 * _requestCtor - Holds a reference to the actual XMLHttpRequest constructor to use at runtime to avoid checking 
 * for browser version at each invocation 
 */
 
QxHttpTransport._requestCtor = QxHttpTransport._dummyRequest;

/*!
 * _activeXType - Determines which ActiveX XML provider will be used by IE
 */
 
QxHttpTransport._activeXType = null;

// Set up static constants








/*
 * Static methods and members
 */
 
/*!
 * Current maximum request pool size
 */
 
QxHttpTransport._poolSize = 0;

/*!
 * Queue to hold active XMLHttpRequest objects
 */
 
QxHttpTransport._activePool = new Array();
 
/*!
 * Queue to hold inactive XMLHttpRequest objects
 */
 
QxHttpTransport._idlePool = new Array();













 /*!
 * readyStates - Array mapping readyStates to events to dispatch upon reaching a given state
 */

QxHttpTransport._readyStates = new Array();

QxHttpTransport._readyStates[1] = "init";
QxHttpTransport._readyStates[2] = "connect";
QxHttpTransport._readyStates[3] = "download";
QxHttpTransport._readyStates[4] = "done";

/*!
 * Fetch current pool size
 */
 
QxHttpTransport.getPoolSize = function() {
  return QxHttpTransport._poolSize;
}

/*!
 * Sets the pool size to 'size'
 */

QxHttpTransport.setPoolSize = function(size) {
  QxHttpTransport._poolSize = size;
}

/*!
 * Alter the current pool size by 'difference' amount
 */
 
QxHttpTransport.alterPoolSize = function(difference) {
  QxHttpTransport._poolSize += difference;
}





/*!
 * Acquire new request
 */
 
QxHttpTransport._getXMLHttpRequest = function() {
  if (0 < QxHttpTransport._idlePool.length) {
    var req = QxHttpTransport._idlePool.pop();
    QxHttpTransport._activePool.push(req);
    return req;
  } else if (QxHttpTransport._activePool.length < QxHttpTransport._poolSize) {
    var req = QxHttpTransport._requestCtor();
    QxHttpTransport._activePool.push(req);
    return req;
  }
}

QxHttpTransport._releaseXMLHttpRequest = function(req) {
  with (QxHttpTransport) {
    if (_poolSize < _activePool.length + _idlePool.length) {
      // Delete request
      delete req;
    } else {    
      _idlePool.push(req);
      _activePool.remove(req);
    }
  }
}






// Private members

/*! 
 *_lastReadyState - Holds the last ready state seen for this instance, allowing us to quickly check to see if any events need to be fired 
 */
 
qx.Proto._lastReadyState = 0;

/*! 
 * _requestHeaders - Hash containing headers to be added to the request 
 */

qx.Proto._requestHeaders = {}

/*! _req - Holds the XMLHttpRequest object used to actually make requests */

qx.Proto._req = null;

/*! _queue - The QxHttpTransportQueue that this request object belongs to */

qx.Proto._queue = null;

/*! _inProgress - Boolean used to record whether or not a request is in progress */

qx.Proto._inProgress = false;

/*! _pendingTimeouts - An array of arrays, with indexes 0 through 3, with each of those indexes containing an array of qx.client.Timer objects.
  * Each index corresponds to the readyState at which all qx.client.Timer objects in the array at that index will be started */

qx.Proto._pendingTimeouts = null;

/*! 
* _activeTimeouts - An array of arrays, with indexs 1 through 4. Each index corresponds to the readyState at which the corresponding
* qx.client.Timer objects will be stopped. 
*/

qx.Proto._activeTimeouts = null;

/*!
 * _aborted - Indicates if this request was aborted due to error or user intervention
 */
 
qx.Proto._aborted = false;

/*!
 * _responseText - Holds the response text provided by the last request
 */
 
qx.Proto._responseText = null;

/*!
 * _responseXML - Holds the response XML provided by the last request
 */
 
qx.Proto._responseXML = null;

/*!
 * _status - Holds the status code provided by the last request
 */
 
qx.Proto._status = -1;

/*!
 * _responseHeaders - Holds response headers provided by the last invocation
 */
 
qx.Proto._responseHeaders = null;

/*!
 * _statusText - Holds the last status text result
 */
 
qx.Proto._statusText = null;

// Object properties
 











/*!
 * Determines whether or not multiple events will be fired for a given ready state. Some browsers will call onreadystatechange multiple times for a single ready state.
 * Setting this property to true will result in your event listeners being called for each reported state change, as opposed to the default behaviour of only emitting
 * a given event once per request.
 */
 
qx.OO.addProperty({name : "multipleReadyStateEvents", type : qx.constant.Type.NUMBER, defaultValue : false});

// Public methods

/*!
 * Adds a qx.client.Timer event to the list of timeouts.
 *
 * Any added Timers will be processed (if the startState warrants it) upon the next state change.
 *
 * @param timer - qx.client.Timer object set with desired interval
 * @param startState - Integer corresponding to the readyState to start the timer at
 * @param endState - Integer corresponding to the readyState to stop the timer at
 */

qx.Proto.addTimeout = function(timer, startState, endState) {
  if (startState >= endState) {
    throw new Error("Start state must be less than end state.");
  }
  
  if (0 > startState || 3 < startState) {
    throw new Error("Start state must be in the range 0 - 3.");
  }
  
  if (1 > endState || 4 < endState) {
    throw new Error("End state must be in the range 1 - 4.");
  }
  
  // Add timer to pending list
  
  if (!this._pendingTimeouts[startState]) {
    this._pendingTimeouts[startState] = new Array();
  }
  
  timer.addData("startstate", startState);
  timer.addData("endstate", endState);
  
  this._pendingTimeouts[startState].push(timer);
}

/*!
 * Sets the queue that this request belongs to
 */

qx.Proto.setQueue = function(queue) {
  if (!this.requestInProgress()) {
    this._queue = queue;  
  }
}

/*!
 * Returns the current queue that this request object belongs to
 */

qx.Proto.getQueue = function() {
  return this.queue;
}

/*!
 * Returns true on this request being in progress, false otherwise.
 */

qx.Proto.requestInProgress = function() {
  return this._inProgress;
}













/*!
 * Alias for getStatusCode
 */

qx.Proto.getStatus = qx.Proto.getStatusCode;







/*!
 * Initialises the request, adding it to the queue.
 */

qx.Proto.send = function() {
  if (true == this._inProgress) {
    return;
  }
  
  // Check that required properties are set

  if (this.getTarget() == null) {
    throw new Error("Null target set for QxHttpRequest.");
  }

  
  this._aborted = false;
  this._req = null;
  this._responseText = null;
  this._responseXML = null;
  this._responseHeaders = null;
  this._status = -1;
  this._statusText = null;
  
  // If we've gotten this far, add it to the queue if applicable - otherwise dispatch the request
  
  if (this._queue) {
    this._queue._add(this);
  } else {
    this._begin();
  }
}

/*!
 * Abort the request. Also removes the request from it's current queue.
 */

qx.Proto.abort = function() {
  if (typeof(this._req.abort) != qx.constant.Type.UNDEFINED) {
    this._req.abort();
  }
  if (this.queue) {
    this._queue._remove(this);
    QxHttpTransport._releaseXMLHttpRequest(this._req);
    this._req = null;
  }
  this._aborted = true;
  this._inProgress = false;
  this._pumpTimeouts();
}

/*!
 * Disposal method
 */
 
qx.Proto.dispose = function() {
  if (this._disposed) {
    return;
  } else if (this._req) {
    this._req = null;
  }
  
  return qx.core.Target.prototype.dispose.call(this);
}

// Private / internal use methods

/*!
 * readystatechange handler - determines when to fire events and updates various object properties as
 * appropriate.
 */
 
qx.Proto._handleStateChange = function() {
  var readyState = this._req.readyState;
  if (3 == readyState) {
    if (this.hasEventListeners("progress")) {
      this.dispatchEvent(new qx.event.type.Event("progress"));
    }
    this._responseText = this._req.responseText;
    this._responseXML = this._req.responseXML;
  }
  
  if (!this.getMultipleReadyStateEvents() && this._lastReadyState == readyState) {
    if (this.hasEventListeners(QxHttpTransport._readyStates[readyState])) {
      this.dispatchEvent(new qx.event.type.Event(QxHttpTransport._readyStates[readyState]));
    }
  } else if (this._lastReadyState < readyState) {
    this._lastReadyState = readyState;
    switch (this._req.readyState) {
      case 0:
        // We should never get here
        throw new Error("readyState 0 encountered inside QxHttpTransport");
        break;
      case 1:
        // Nothing to do here for the moment
        break;
      case 2:
        if (QxHttpTransport._requestCtor != QxHttpTransport._activeXRequest) {
          this._status = this._req.status;
          this._statusText = this._req.statusText;
          if (this._req.status != 200 && this._req.status != 0) {
            this.abort();
            this._raiseError();
          }
        }
        break;
      case 3:
        // Attempt to get length
        try {
          var length = this.getResponseHeader("Content-Length");
          if (typeof(length) != qx.constant.Type.NUMBER) {
            length = -1;
          }
        } catch (ex) {
          length = -1;
        }
        this.setResponseSize(length);
        break;
      case 4:
        this._status = this._req.status;
        this._statusText = this._req.statusText;
        if (this._req.status != 200 && this._req.status != 0) {
          this.abort();
          this._raiseError();
        }
        
        // Assume that readyState 4 only ever gets fired once
        
        this._inProgress = false;
        this._lastReadyState = 0;
        this._responseText = this._req.responseText;
        this._responseXML = this._req.responseXML;
        this._responseHeaders = this._req.getAllResponseHeaders();
        
        if (this._queue) {
          this._queue._remove(this);
          QxHttpTransport._releaseXMLHttpRequest(this._req);
          this._req = null;
        } 
        
        break;
      default:
        throw new Error("Out of range readyState encountered inside QxHttpTransport");
        break;
    }
    if (this.hasEventListeners(QxHttpTransport._readyStates[readyState])) {
      this.dispatchEvent(new qx.event.type.Event(QxHttpTransport._readyStates[readyState]));
    }
    this._pumpTimeouts(readyState);
  }  
}

/*!
 * Called by the queue holding this object when the request is to be issued.
 */

qx.Proto._begin = function() {
  this._inProgress = true;
  
  if (null == this._queue) {
    if (this._req) {
      this._req.abort();
    } else {
      this._req = QxHttpTransport._requestCtor();
    }
  } else {
    this._req = QxHttpTransport._getXMLHttpRequest();
  }
  
  this._req.onreadystatechange = this.__handleStateChange;
  
  for (i in this._requestHeaders) {
    this._req.setRequestHeader(i, this._requestHeaders[i]);
  }
  if (null != this.getUsername()) {
    if (null == this.getPassword()) {
      this._req.open(this.getRequestMethod(), this.getTarget(), this.getAsync(), this.getUsername());
    } else {
      this._req.open(this.getRequestMethod(), this.getTarget(), this.getAsync(), this.getUsername(), this.getPassword());
    }
  } else {
    this._req.open(this.getRequestMethod(), this.getTarget(), this.getAsync());
  }
  this._req.send(this.getPayload());
  this._pumpTimeouts(0);
}

/*!
 * Obtain new XMLHttpRequest objects according to policy
 */
 
qx.Proto._newRequest = function() {
  if (null == this._queue) {
    // Return new object as required
    return this._requestCtor();
  }
}

/*!
 * Dispatches an "error" event
 */

qx.Proto._raiseError = function() {
  if (this.hasEventListeners("error")) {
    this.dispatchEvent(new qx.event.type.Event("error"));
  }
}

/*!
 * Pumps the timeout queue
 */
 
qx.Proto._pumpTimeouts = function(rs) {
  var i;
  
  if (-1 == rs || 4 == rs || this._aborted) {
    // Put all timeouts back in the "pending queue"
    for (var i = 0; i < this._activeTimeouts.length; i++) {
      this._depopulateActiveTimeoutQueue(this._activeTimeouts[i]);
    }
  } else {
    // Stop all current timers
    if (this._activeTimeouts[rs]) {
      this._depopulateActiveTimeoutQueue(this._activeTimeouts[rs]);
    }
    
    // Start current timers
    
    if (this._pendingTimeouts[rs]) {
      for (i in this._pendingTimeouts[rs]) {
        var timeout = this._pendingTimeouts[rs][i];
        var endState = timeout.getData("endstate");
        
        this._activeTimeouts[endState].push(timeout);
        this._pendingTimeouts[rs].removeAt(i);
        timeout.start();
      }
    }
  }
}

qx.Proto._depopulateActiveTimeoutQueue = function(queue) {
  for (var i = 0; i < queue.length; i++) {
    var timeout = queue[i];
    var startState = timeout.getData("startstate");
    
    timeout.stop();
    this._pendingTimeouts[startState].push(timeout);
    queue.removeAt(i);
  }
}

