/* ********************************************************************
   Class: QxTarget
******************************************************************** */

/*!
This is the main constructor for all objects that need to be connected to QxEvent objects.

In objects created with this constructor, you find functions to addEventListener or
removeEventListener to or from the created object. Each event to connect to has a type in
form of an identification string. This type could be the name of a regular dom event like "click" or
something self-defined like "ready".
*/
function QxTarget()
{
  QxObject.call(this);

  // Do not use copyCreateHash here, this duplicate the calls to
  // the registered events, which is unwanted!
  this._listeners = {};
};

QxTarget.extend(QxObject, "QxTarget");

proto._modifyEnabled = function(propValue, propOldValue, propName, uniqModIds)
{
  QxObject.prototype._modifyEnabled.call(this, propValue, propOldValue, propName, uniqModIds);

  return true;
};

/*!
  Add event listener to object
*/
proto.addEventListener = function(eType, eFunc, eObject)
{
  if(this._disposed) {
    return;
  };

  if(typeof eFunc != "function") {
    throw new Error("'" + eFunc + "' is not a function!");
  };

  // If this is the first event of given type, we need to create a subobject
  // that contains all the actions that will be assigned to this type
  if(typeof this._listeners[eType] == "undefined") {
    this._listeners[eType] = {};
  };

  // Create a special key string to allow identification of each bound action
  var key = QxObject.toHash(eFunc) + (eObject ? "::" + QxObject.toHash(eObject) : "");

  // Finally set up the listeners object
  this._listeners[eType][key] = {
    handler : eFunc,
    object : eObject
  };
};

/*!
  Check if there are one or more listeners for an event type
*/
proto.hasEventListeners = function(eType) {
  return typeof this._listeners[eType] != "undefined";
};

/*!
  Remove event listener from object
*/
proto.removeEventListener = function(eType, eFunc, eObject)
{
  if(this._disposed || typeof this._listeners[eType] == "undefined") {
    return;
  };

  if(typeof eFunc != "function") {
    throw new Error("'" + eFunc + "' is not a function!");
  };

  // Create a special key string to allow identification of each bound action
  var key = QxObject.toHash(eFunc) + (eObject ? "::" + QxObject.toHash(eObject) : "");

  // Delete object entry for this action
  delete this._listeners[eType][key];
};

proto.dispatchEvent = function(e, dispose)
{
  // Ignore event if eventTarget is disposed
  if(this._disposed) {
    return;
  };

  // Setup Target
  if (!e._target) {
    e._target = this;
  };

  // Dispatch Event
  this._dispatchEvent(e, dispose);

  return !e._defaultPrevented;;
};

// Internal dispatch implementation
proto._dispatchEvent = function(e, dispose)
{
  if(this._disposed) {
    return;
  };

  // Setup current target
  e.setCurrentTarget(this);

  // Shortcut for listener data
  var fs = this._listeners[e.getType()];

  if(fs)
  {
    var f, o;

    // Handle all events for the specified type
    for(var hc in fs)
    {
      // Shortcuts for handler and object
      f = fs[hc].handler;
      o = fs[hc].object;

      // Call object function
      if(typeof f == "function") {
        f.call(typeof o == "object" ? o : this, e);
      };
    };
  };

  // Bubble event to parents
  var p = this.getParent();

  if(e.getBubbles() && !e.getPropagationStopped() && p && p.getEnabled()) {
    p._dispatchEvent(e, false);
  };

  // Dispose event?
  if (dispose) {
    e.dispose();
  };
};

proto.getParent = function() {
  return null;
};

proto.dispose = function(propValue, propOldName, propName, uniqModIds)
{
  if(this._disposed) {
    return;
  };

  if (typeof this._listeners == "object")
  {
    for(var eType in this._listeners)
    {
      for(var eKey in this._listeners[eType])
      {
        delete this._listeners[eType][eKey];
      };

      delete this._listeners[eType];
    };
  };

  delete this._listeners;

  return QxObject.prototype.dispose.call(this);
};
