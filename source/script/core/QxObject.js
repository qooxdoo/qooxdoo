/* ********************************************************************
   Class: QxObject
******************************************************************** */

function QxObject(autoDispose)
{
  this._pos = QxObject._counter++;
  this._hash = "h" + String(Math.round(Math.random() * 1e6));

  if (typeof autoDispose != "boolean" || autoDispose) {
    QxObject._db.push(this);
  };
};

QxObject.extend(Object, "QxObject");

QxObject._counter = 0;
QxObject._siteCounter = 0;
QxObject._db = [];

QxObject.toHash = function(o)
{
  if(o._hash != null) {
    return o._hash;
  };

  return o._hash = "h" + String(Math.round(Math.random() * 1e6));
};

QxObject.dispose = function()
{
  for (var i=QxObject._db.length-1; i>=0; i--)
  {
    if (typeof QxObject._db[i] != "undefined")
    {
      QxObject._db[i].dispose();

      if (typeof QxObject._db == "undefined") {
        break;
      };

      delete QxObject._db[i];
    };
  };

  delete QxObject._db;
};

QxObject.addProperty({ name : "enabled", type : Boolean, defaultValue : true, getAlias : "isEnabled" });

proto.debug = function(m) {
  QxDebug(this.classname + "[" + this._pos + "]", m);
};

proto.subug = function(m) {
  QxDebug(this.classname + "[" + this._pos + "]", ":: " + m);
};

proto.toString = function()
{
  if(this.classname) {
    return "[object " + this.classname + "]";
  };

  return "[object Object]";
};

proto.toHash = function() {
  return this._hash;
};

proto._modifyEnabled = function(propValue, propOldValue, propName, uniqModIds) {
  return true;
};

proto._disposed = false;

/*!
  Dispose this object
*/
proto.dispose = function()
{
  if (this._disposed) {
    return;
  };

  this._disposed = true;

  delete QxObject._db[this._pos];
};

/*!
  Returns true if the object is disposed.
*/
proto.getDisposed = function() {
  return this._disposed;
};

/*!
  Returns true if the object is disposed.
*/
proto.isDisposed = function() {
  return this._disposed;
};

/*!
Set multiple properties at once by using a property list

#param propertyValues[Property List]: A hash of key-value pairs.
*/
proto.set = function(propertyValues)
{
  if (typeof propertyValues != "object") {
    throw new Error("Please use a valid hash of property key-values pairs.");
  };

  for (var prop in propertyValues)
  {
    try{
      this["set" + prop.toFirstUp()](propertyValues[prop]);
    }
    catch(ex)
    {
      throw new Error("Setter of property " + prop + " returned with an error: " + ex);
    };
  };
  
  return this;
};

/*!

*/
proto.get = function(propertyNames, outputHint)
{
  switch(typeof propertyNames)
  {
    case "string":
      return this["get" + propertyNames.toFirstUp()]();

    case "object":
      if (typeof propertyNames.length == "number")
      {
        if (outputHint == "hash")
        {
          var h = {};

          propertyLength = propertyNames.length;
          for (var i=0; i<propertyLength; i++)
          {
            try{
              h[propertyNames[i]] = this["get" + propertyNames[i].toFirstUp()]();
            }
            catch(ex)
            {
              throw new Error("Could not get a valid value from property: " + propertyNames[i] + "! Is the property existing? (" + ex + ")");
            };
          };

          return h;
        }
        else
        {
          propertyLength = propertyNames.length;
          for (var i=0; i<propertyLength; i++)
          {
            try{
              propertyNames[i] = this["get" + propertyNames[i].toFirstUp()]();
            }
            catch(ex)
            {
              throw new Error("Could not get a valid value from property: " + propertyNames[i] + "! Is the property existing? (" + ex + ")");
            };
          };

          return propertyNames;
        };
      }
      else
      {
        for (var i in propertyNames) {
          propertyNames[i] = this["get" + i.toFirstUp()]();
        };

        return propertyNames;
      };

    default:
      throw new Error("Please use a valid array, hash or string as parameter!");
  };
};