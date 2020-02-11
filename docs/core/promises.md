# Promises

Promises are non-trivial to implement properly, so this class is implemented thanks to BluebirdJS from http://bluebirdjs.com/ (also under MIT license)

## Asynchronous Apply Methods
It is reasonable that any applyXxx method could take some time to complete (including triggering a server roundtrip), in which case it is necessary to delay the firing the changeXxx event until the apply is complete, otherwise the event is fired before the property value is fully applied.
The return value for apply methods is normally ignored, but with this PR if you return a qx.Promise the setXxx will wait for the promise to be fulfilled before firing the event.
As setXxx method normally returns the value which has been set, it is not possible to return the promise to the caller - which is a disadvantage because it follows that there could be other processes which depend on the successful, and sequential, completion of the property apply.

## A new setXxxAsync Method
For properties which are known in advance to have asynchronous apply methods, you can enable a new ```setXxxAsync``` method by setting the ```async: true``` value on the property configuration; the normal property accessors operate in the same way that they always did and remain backward compatible, it’s just that there is ```setXxxAsync``` method that returns a ```qx.Promise```. Note that it always returns a promise, even if the apply method is not asynchronous and does not return anything - this is so that setXxxAsync always operates consistently regardless of how it is implemented.

For example:

```javascript
properties {
  myProp: {
    init: 0,
    async: true,
    apply: “_applyMyProp”
  }
},
members: {
  doStuff: function() {
    this.setMyPropAsync(123).then(function() {
      this.debug(“Set value of myProp to 123”);
    }, this);
  },
  // … snip ….
```

## Setting property values from Promises

When you want to set a property to a value fulfilled by a promise, there is this form:

```javascript
var myPromise = someOtherValue.getSomethingAsync();
myPromise.then(function(value) {
  myObj.setMyProp(value);
});
```

The above example works, but the code remains relatively lengthy for the task you are trying to achieve. The setXxx and setXxxxAsync methods can take values either as ordinary values, or they can be passed a qx.Promise, in which case they will wait for the promise to be fulfilled before applying it. The example 
above can be re-written as:

```javascript
var myPromise = someOtherValue.getSomethingAsync();
myObj.setMyProp(myPromise);
```

The one exception to this is where the property value is expected to be a promise; this is achieved by defining the property with a ```check: “qx.Promise”```, in which case it is stored as-is without waiting for it to be resolved.
