# Promises and Async Programming

Promises are a well understood and very useful tool for developing asynchronous
software, although their implementation is deceptively simple; the specification
at <https://promisesaplus.com/> shows that a promise is little more than an
object that has a `then()` method. In reality, that specification is lacking a
range of useful tools and features that day to day programming benefit from and
the Qooxdoo `qx.Promise` class has been developed to bridge that gap. The
Qooxdoo `qx.Promise` is also guaranteed cross platform, so even if you still
depend on older browsers such as IE11 which do not have native support for
Promises built in, you can start using them today.

Promises are non-trivial to implement properly, so this class is implemented
thanks to BluebirdJS from <http://bluebirdjs.com/> (also under MIT license)

## Introduction

Promises are really easy use - a lot of the detail and subtleties are beyond the
scope of this article, but any documentation you can find on how to use native
`Promise` will apply to Qooxdoo promises, all you need to do is substitute
`Promise` in other documentation with `qx.Promise`.

Here's a basic example:

```javascript
function connectToServer() {
  return new qx.Promise((resolve, reject) => {
    // Connect to the server asynchronously here; if the server call is successful,
    //  we call resolve() and handle errors by calling reject().
    resolve("Success");
  });
}

function main() {
  connectToServer().then((result) => {
    console.log("Connecting to server responded: " + result);
  });
}

main();
```

In that example, the console will print:

```
Connecting to server responded: Success
```

Promises are the code that makes `async` and `await` work in ES6 (which you can
also use cross platform with Qooxdoo, provided you use the Qooxdoo-compiler):

```javascript
function connectToServer() {
  new qx.Promise((resolve, reject) => {
    // Connect to the server asynchronously here; if the server call is successful,
    //  we call resolve() and handle errors by calling reject().
    resolve("Success");
  });
}

async function main() {
  let result = await connectToServer();
  console.log("Connecting to server responded: " + result);
}

main();
```

## Creating Asynchronous Properties

When you write a Qooxdoo object, you typically create properties with `apply`
methods and change events, and its quite possible that your apply method could
take some time to complete - for example, setting a property could require an
asynchronous server roundtrip. When this happens, it is necessary to delay the
firing the change event until the apply is complete, otherwise the event could
be fired before the property value is fully applied.

The return value for apply method can be a qx.Promise, in which case Qooxdoo
will wait for the promise to resolve successfully before firing the event; if
promise is rejected, then the value will not be set at all - ie the effect will
be the same as if your apply method had just thrown an exception.

However, as the `set` method for your property normally returns the value which
has been set, it is not possible to return the promise to the caller - which is
a problem because it follows that there could be other processes which depend on
the successful, and sequential, completion of the apply method.

### A new setXxxAsync Method

For properties which are known in advance to have asynchronous apply methods,
you can enable a new `setXxxAsync` method by setting the `async: true` value on
the property configuration; the normal property accessors operate in the same
way that they always did and remain backward compatible, it’s just that there is
`setXxxAsync` method that returns a `qx.Promise`. Note that it always returns a
promise, even if the apply method is not asynchronous and does not return
anything - this is so that setXxxAsync always operates consistently regardless
of how it is implemented.

For example:

```javascript
properties {
  myProp: {
    init: 0,
    async: true,
    apply: "_applyMyProp"
  }
},
members: {
  doStuff: function() {
    this.setMyPropAsync(123).then(function() {
      this.debug("Set value of myProp to 123");
    }, this);
  },
  // … snip ….
```

### Setting property values from Promises

When you want to set a property to a value fulfilled by a promise, there is this
form:

```javascript
var myPromise = someOtherValue.getSomethingAsync();
myPromise.then(function (value) {
  myObj.setMyProp(value);
});
```

The above example works, but the code remains relatively lengthy for the task
you are trying to achieve. The setXxx and setXxxxAsync methods can take values
either as ordinary values, or they can be passed a qx.Promise, in which case
they will wait for the promise to be fulfilled before applying it. The example
above can be re-written as:

```javascript
var myPromise = someOtherValue.getSomethingAsync();
myObj.setMyProp(myPromise);
```

The one exception to this is where the property value is expected to be a
promise; this is achieved by defining the property with a `check: "qx.Promise"`,
in which case it is stored as-is without waiting for it to be resolved.

## Asynchronous Events

One step beyond asynchronous properties is asynchronous events - in the same way
that `apply` methods could trigger some asynchronous process, it's just as
likely that an event handler could trigger the same server round trip.

In many cases, a single event (such as the user clicking a button) can trigger
an entire graph of effects, for example clicking the mouse triggers multiple
gesture and pointer events, which filter down to application events such as a
button's `execute` event, leading to property changes, triggering more events
etc - and any of the apply methods, event handlers, and utility methods in that
graph of effects could be asynchronous and return a promise.

When an event handler returns a `qx.Promise`, this will suspend the normal event
handling process until that promise completes, and by paying attention to how
your code fires events and sets property values, it is possible for that graph
of effects to be suspended and then resumed once the promise resolves.

### Firing asynchronous events

In addition to the "normal" `fireEvent`, `fireDataEvent`, and
`fireNonBubblingEvent` in Qooxdoo objects (ie `qx.Object`) there are the three
asynchronous equivalents `fireEventAsync`, `fireDataEventAsync`, and
`fireNonBubblingEventAsync`. These differ in that the "normal" versions return
truethy when the event was not cancelled (ie `event.preventDefault()` was not
called), but the Async versions return a promise that will resolve if the event
completed and `preventDefault` was not called; the promise will be rejected if
`preventDefault` is called.

Note that if an event handler returns a promise and you use one the the "normal"
fireXxx methods, the method will return a promise and not `true` - this is
because the event is not being cancelled (not immediately anyway).

All this means is that if you care about asynchronous event handlers you need to
switch to the fireXxxAsync methods.
