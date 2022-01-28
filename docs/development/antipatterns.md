# Avoiding anti-Patterns

This page should give you an overview (in no particular order) about programming
pattern you should avoid when developing with Qooxdoo.

### Don't break encapsulation

This is pretty straightforward when you're developing in OO-way. You violate the
encapsulation if you call a foreign objects private methods, so you should
always refrain from doing it.

The point to mention this here again is that calling `private methods` of other
classes can break the build version of a Qooxdoo application. Since Qooxdoo uses
private optimization by default one cannot rely on the names of the private
methods of another class. If violate this can end up with a runtime error very
difficult to debug.

### Creating multiple instances of the same widget

Do not create multiple instances of a widget which is added/removed multiple
times when it is sufficient to e.g. only change the data represented by the
widget.

### Synchronous requests

Using synchronous requests will block the whole GUI until the response is
received. Always use asynchronous requests to give the control back to the user.

### Long-running tasks

Running intensive tasks on the client should not be an option. Such tasks should
reside on the server-side. If it not possible (or not desired) there should be
at least a reasonable feedback to the user about the intensive task currently
running. If long-running tasks can be split into a sequence of small tasks, the
Progressive (qx.ui.progressive.Progressive) widget may allow you to progressive
execute the sequence of small tasks without blocking other operation of your
application. Organizing your application around a finite state machine
(qx.util.fsm.FiniteStateMachine) may also help to avoid the pitfalls of
long-running tasks.

### Reference types in member section

Data fields (every data attached to `this`) can and should be declared in the
members section. This makes it easier to find the data fields, which a may
otherwise be deeply hidden in the code.

It is possible to initialize these data fields in the members section with
primite data types like `String` or `Number` but it should never be initialized
with reference types. Reference types are `Object` (Maps), `Array`, `Date` and
`RegExp`. The reason for this is that these references will be shared by all
instances of the class. This is typically not the desired behavior. It is better
to set the value of these fields in the members section to `null` and initialize
them in the constructor.

BAD:

```javascript
members :
{
  __myArray : [], // <-- don't do this!
  __myMap : {},  // <-- don't do this!
  //...
}
```

GOOD:

```javascript
construct()
{
  super();
  //...

  this.__myArr = [];
  this.__myMap = {};
}

members :
{
  __myArray : null,
  __myMap : null,

  //...
}
```

For the same reason reference types should not be used as `init` values in
property definitions.

### Abundantly "requiring" other classes

"requires" in the Qooxdoo context are dependencies of a class to other classes
which have to be available at _load-time_, i.e. at the time the class code is
read and evaluated by Qooxdoo's class factory (currently `qx.Class.define`).
This is in contrast to dependencies which come into play only at _run-time_ of
the class code, e.g. when its constructor or member functions are invoked.
(Run-time dependencies are usually easy to fullfill since they don't impose an
order in which classes are loaded into the browser's Javascript interpreter; in
general, they just have to be loaded eventually).

There are exactly 4 ways to establish a load-time requirement of a class:

- **@require hint**: Explicitly requiring another
  class by using a `@require` hint in the source file of the class.

- **statics section**: Initializing a `statics` member in the class definition
  with a class instance (using the `new` operator) or by calling a static class
  method makes the referenced class a requirement of the referencing class.

- **properties section**: Instantiating another class or calling one of its
  static methods, in order to provide a value for the `init` attribute of a
  property definition, makes the other class a required class.

- **defer section**: All references to other classes (instantiations, static
  method invocations) in the `defer` section of a class makes those other
  classes "requires" of the current class.
  

All those possibilities should be avoided or at least used as sparingly as
possible. Those requires make dependency tracking difficult and furthermore
impedes partitioning the application into parts if this is desired.

## Do not name variables like native objects

Qooxdoo comes with a powerful variable optimizer to shrink down the size of your
javascript code delivered to the browsers. This optimization is performed with
the `build` version of your application by default. To avoid any runtime errors
it is recommended to not name your variables like native browser objects.

Consider the following:

```javascript
var myIframe = new qx.ui.embed.Iframe(mySourceURL);

...

var document = myIframe.getDocument();

// this piece
document.body.appendChild(myChildNode);

// will end up in "build" version with
p.body.appendChild(myChildNode);
// assuming the "document" variable is optimized with "p" as variable name
```

### Do not use for-in-loops for arrays

---

We modified the prototype of the `array` class to add some functions to it, but
unfortunately this has a side effect: if you try to loop through an array using
a for-in-loop you will not only get the content of the array but also the new
functions.

So loop trough an array with an normal loop:

```javascript
var a = [1, 2, 3];
for (var i=0, l=a.length; i<l; i++) {
  this.debug(a[i]);
}
```

```
