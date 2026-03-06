# Advanced features of properties

> :memo: Please take a look at `property_features` first to get a compact overview of
> the available features.
## setAsync, asynchronous apply methods and asynchronous event handlers

Sometimes it may be necessary for an applyXxx method to take some time to
complete, in which case it is necessary to consider coding asynchronously to
allow for a better user experience. Perhaps more importantly, if your apply
method includes triggering a server round trip then changes to the specification
(
<https://xhr.spec.whatwg.org/>) have deprecated synchronous XMLHttpRequest, and
some browsers (e.g. Safari) already have very short timeouts for synchronous
XMLHttpRequests which cannot be overridden.

If a property is set using `obj.setProperty(value)` and the `apply` function returns a thenable
(e.g. a Promise), the thenable will not be awaited and the event will be fired in the same tick.

If you want to await until the apply method promise resolves, you need to call `setXxxAsync`.
All properties automatically have setXxxAsync, and resetXxxAsync methods.
This will wait until the apply function promise resolves before firing the change event.
It returns a promise which resolves when the apply function and all asynchronous event handlers
resolve as well.

```javascript
properties :
{
   name :
   {
      init : 0,
      check: "String",
      apply : "_applyName",
      event: "changeName"
   }
},

members :
{
   _applyName(name)
   {
       return new qx.Promise(function(fulfilled) {
           // ... do something asynchronous here
           fulfilled(); // Finally done the asynchronous task
       });
   }
}

// ... snip ...
myObject.setNameAsync("abc").then(function() {
    // only now has the name been changed and the "changeName" event been fired
});
```
Note: Prior to version 8, it was necessary to specify `async: true` in the property definition.
This is no longer supported — all properties now have setAsync methods automatically.
They don't always have `getAsync` methods though, but only when the property storage supports
`getAsync` ([more detail here](#asynchronous-property-storages)). 

## Property storages

Internally, the Qooxdoo property system uses Property Storage objects to store the user-defined values of properties.
You have the freedom to define your custom property storage if you want total control over how property values are stored,
or want to provide init values to properties using an asynchronous function ([full detail here](#asynchronous-property-storages)).

### Defining own property storage

Property values are, by default, stored within the instance object of an instantiated class.
The default storage mechanism is defined in `qx.core.property.SimplePropertyStorage`. 

It is possible to define an alternative storage methodology.
Defining a storage requires defining a `qx.Bootstrap` class which implements `qx.core.property.IPropertyStorage`.
Sometimes it may be sufficient to inherit from `SimplePropertyStorage` and only override necessary methods.
`IPropertyStorage` requires that the following methods need to be implemented:
`get`, `set`, `getAsync`, `supportAsyncGet`, and `dereference`.


If you want your storage to support asynchronous getting (more detail on this later), you will need to implement `getAsync` and `supportAsyncGet` as well, otherwise you can just leave them empty.

An example property storage implementation is shown below:

```js
qx.Bootstrap.define("com.mycompany.myapp.MyPropertyStorage", {
  implement: qx.core.property.IPropertyStorage,
  members: {
    /**
     * @override
     */
    get(thisObj, property) {
      /*
        A storage implementation's `get` method defines how to retrieve the
        property's value from its storage. This implementation
        simply retrieves the value from the `myPropertyValues` object,
        which is a member of the `thisObj`:
        `thisObj` is the object which the property value relates to,
        while `property` is the instance of `qx.core.property.Property`,
        which is the object that represents the property in the class.
      */
      return thisObj.myPropertyValues[property.getPropertyName()];
    },

    /**
     * @override
     */
    set(thisObj, property, value) {
      /*
        A storage implementation's `set` key defines how to store a value for the property in its storage. 
        This implementation stores the value within the `myProperties` object, in a property of the given name:
      */
      thisObj.myPropertyValues[property.getPropertyName()] = value;
    },

    /**
     * @override
     */
    supportsGetAsync() {
      return false;
    },

    /**
     * @override
     */
    getAsync() {
      //empty because this property does not support getAsync
    },

    /**
     * @override
     */
    dereference(thisObj, property) {
      /*
       * If the property configuration includes `dereference : true`,
       * the storage implementation's `dereference` function is called just before the instance's destructor.
       * This implementation deletes the property from the instance:
       */
      delete thisObj.myPropertyValues[property.getPropertyName()];
    }
  }
})
```

You then need to specify your storage class in your property definition like so:

```js
{
  properties: {
    myAsyncProp: {
      check: "com.mycompany.myapp.MyAsyncObject",
      storage: com.mycompany.myapp.MyPropertyStorage // you can also do `new com.mycompany.myapp.MyPropertyStorage()`,
      //but this is less memory efficient if you will use this storage loads of times
      //because it will create multiple instances of the storage
    }
  }
}
```

### Asynchronous property storages
Sometimes, we may want to make getting the initial value of a property asynchronous,
for example when we have an object on the client and getting the property requires a server round trip,
or when fetching data from a database in an ORM system.
In order to achieve this, we need to define our own property storage class, override method `supportGetAsync` to return true,
and override `getAsync` to fetch the value for the property.

Here is an example property storage class which allows us to fetch on-demand properties from the server in a browser environment:
```js
qx.Bootstrap.define("com.mycompany.myapp.OnDemandPropertyStorage", {
  extend: qx.core.property.SimplePropertyStorage,

  members: {
    /**
     * @Override from SimplePropertyStorage
     */
    async getAsync(thisObj, property) {
      let value = this.get(thisObj, property); ///check the cache first
      if (value !== undefined) return value;


      //cache miss, get value from source
      //we use UUIDs to represent the property values that need to be fetched
      let uuid = thisObj.$$propertyValues[property.getPropertyName()]?.uuid;
      if (!uuid) {
        value = null;
      } else {
        value = await com.mycompany.myapp.ServerIo.getInstance().getObjectByUuid(uuid);
      }
      this.set(thisObj, property, value); //cache the result
      return cached;
    },
  
    /**
     * @Override
     */
    supportsGetAsync() {
      return true;
    }
  }
});
```

Now, we can use the `qx.core.property.Property.getAsync` or `object.getPropertyAsync()` method
which returns a promise which resolves to the property value.
It will first attempt to get the property synchronously and then attempt asynchronously if it can't.
NOTE: It is possible but discouraged to call `getAsync` on a property that doesn't support an async getter.
Doing so will print out a warning.

### Inline Property storages

If you want a simpler way to define a property storage without defining a whole class and want to define a one-off storage for one property,
you can add a `get`, `set`, and optionally `getAsync` functions to your definition, like so:

```js
{
  properties: {
    explicitProp: {
      check: "com.myapp.MyObject",
      apply: "_applyExplicitProp",
      /**
       * @this {qx.core.Object} same value as the `thisObj` parameter
       * @param {qx.core.property.IProperty} property the property to get the value of
       * @param {qx.core.Object} thisObj
       */
      get(property, thisObj) {
        return thisObj.myPropertyValues[property.getPropertyName()];
      },
      /**
       * @this {qx.core.Object} same value as the `thisObj` parameter
       * @param {qx.core.Object} thisObj
       * @param {*} value
       * @param {qx.core.property.IProperty} property the property to get the value of
       */
      set(thisObj, value, property) {
        thisObj.myPropertyValues[property.getPropertyName()] = value;
      },
      /**
       * @this {qx.core.Object} same value as the `thisObj` parameter
       * @param {qx.core.property.IProperty} property the property to get the value of
       * @param {qx.core.Object} thisObj
       */
      getAsync(property, thisObj) {
        //You don't have to define this function at all.
        //If you do, this is like returning `true` from your `supportsGetAsync` method,
        //otherwise it's like returning `false`.
      }
    }
  }
}
```

This is known as inline or explicit property storage. This internally uses `qx.core.property.ExplicitPropertyStorage`,
which simply defers to the `get`, `set`, `setAsync` functions in your definition.
