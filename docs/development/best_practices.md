# Best Practices for Enterprise Application Development

This is a collection of best practices recommended for developing medium to
large-scale Qooxdoo applications.

## Widget Handling

### Share Instances

Creating new widgets is expensive in terms of computation time and memory
consumption. Furthermore, disposing of objects in JavaScript does not guarantee
that the used memory is freed in a timely manner. Especially Internet Explorer
is known to run the garbage collector only on some particular events, like
minimizing the browser window.

As a consequence widget references should be kept if it makes sense to reuse
them later. If a widget is no longer needed at some point, it may be best to
pool it and reconfigure it on later use.

- In cases where new data arrives it is better to update a set of widgets
  instead of replacing existing widgets with newly created ones.

- It is a good idea to use singletons were applicable. For example: dialog
  boxes, where only one is visible at a time, could be shared even when the
  interface should behave like (or better: emulate) multiple instances.

- Even complex dialogs or complete interfaces could be implemented as a
  singleton.

- Pooling is an alternative design pattern when singletons are not enough to
  fulfill the needs.

- It is better to pool full-blown dialogs than pooling single widget instances.
  Start with pools for dialogs. If you are done with that continue with single
  widgets/objects/events.

- Reconfiguring existing instances is typically a lot faster than creating new
  ones.

- Use factories to create widget instances. These factories can hide the
  creation and pooling of widgets (e.g. `createMenuButton()`).

- Create widgets on demand. For example in tab pages it can be useful to create
  the instances of hidden tab pages only when the page gets visible for the
  first time and then save them for later use.

- Do not dispose instances when there may be _a chance_, that you need an
  (almost) identically configured instance again within the same user session.
  This typically applies to dialogs e.g. error reporting, message boxes, confirm
  dialogs, etc.

### Initialize Incrementally

- Normally big applications consist of multiple parts which are not visible
  initially. This is true for many things like hidden tab pages or not yet
  opened dialogs.

- As the entire load process and evaluation of JavaScript costs precious time,
  it is a good idea to load functionality only when needed ("on demand").

- The Compiler makes it possible to easily split application logic into
  so-called ["parts"](howto/parts.md).

- To allow such a functionality, it is a good idea to separate application parts
  from each other as good as possible. It is still possible to connect them
  using callbacks: The usage of another part of the application is checked in
  all places and in the place where the initialisation should happen a callback
  is inserted which waits for the initialisation of the new classes.

## Fine-grained Events

- Events for changes in data models tend to lose information about the
  underlying change.

- For performance reasons it is better to fire more specific events than less
  specific events, even if this means more work for the developer.

- In many cases it is a good idea to invest more time to structurize data
  changes (when the backend is not yet able to do this) into multiple events
  than fire one generic event which updates many areas of the application (where
  many of them are not needed in this specific case).
