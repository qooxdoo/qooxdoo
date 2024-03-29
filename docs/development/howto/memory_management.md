# Memory Management

## Introduction

NOTE: This is a new feature in Qooxdoo which is enabled by default since Qooxdoo
v6 because it is a "breaking change"; for most applications however, you simply
get free memory management, but you should read this page first to understand
what the changes are and how they might affect your application. You can disable
this feature by specifying the `qx.automaticMemoryManagement` as "false" in your
application's config.json

Generally, Qooxdoo's runtime will take care of most of the issues around object
disposal, so you don't have to be too anxious if you get those 'missing destruct
declaration' messages from a verbose disposer run.

Normally, JavaScript automatically cleans up. There is a built-in garbage
collector in all engines, and while there were bugs in browsers like IE6, this
is no longer the case. In Qooxdoo v6.0 and later, almost all objects can be
disposed automatically.

The principal of using garbage collection for managing objects instead of
explicitly `.dispose()`ing them is that destructors and `dispose()` methods are not
implemented. This is important for many reasons, the principal being that the
Javascript garbage collector does not notify us when an object is about to be
collected.

But this does not mean that objects can’t have startup and shutdown procedures -
many do in fact, it’s just that cycle is (or should be) separate to garbage
collection.

Historically, a common pattern in Qooxdoo classes is to use dispose/destructor
as a general purpose shutdown, so if we want to move to automatic garbage
collection we need to identify those classes which have a special shutdown
procedure so that the calling code can respect that and free up resources. We
could take the view that all destructor/dispose methods mean that the class has
special shutdown procedures but this is unnecessarily harsh because there are a
lot of classes which have trivial destructor implementations, or can be easily
refactored to not have a destructor.

The difficulty here is in making it clear and obvious what needs to be disposed,
and I’ve taken two approaches: first, each class which needs to be disposed
implements the marker interface `qx.core.IDisposable`. Every Object which
implements that interface will be registered with ObjectRegistry exactly as
before, so that it can be identified for debugging purposes. This has the side
effect that fromHashCode will also work for those objects, and that the classes
can be identified reliably via reflection and (potentially) in the API viewer.

Secondly, many destructors simply set member variables to null and these have
been removed. This is because they are unnecessary and by not providing one we
make it clear that it is not necessary.

Thirdly, in some rare cases the code has been refactored to avoid the need for a
destructor where previously there was one - for example, only adding a listener
for the duration of the task and removing at the end of the task, instead of
keeping the listener until dispose is called. Except in one or two places I have
avoided this approach because the risk of introducing bugs with rash, unfocused
changes is high.

In many cases, the destructors are for classes which are typically used as
singletons and need not be tracked - for example the various `qx.event.handler.*`
and qx.event.dispatch.* classes.

There is one remaining global list of objects which could benefit from
refactoring - `qx.data.SingleValueBinding` keeps a global lookup of every bound
object, so any listeners to or from an object property will prevent that object
from being garbage collected. This could be modified so that the bindings are
stored with the object, rather than in a global list indexed by hash code, but
note that even when binding a single property, the target object also has links
back to the source object; this means that unless both source and target are
unbound, the binding will prevent garbage collection of both objects.

The net effect of this patch is that automatic garbage collection is now
possible, with the proviso that (a) if you must release any bindings manually,
and (b) you must observe any “shutdown” requirements of classes.

## Disposing an application

You can look at the `dispose` behaviour of your app if you set the disposer into a
verbose mode and then invoke it deliberately while your app is running. This
will usually render your app unusable, but you will get all those messages
hinting you at object properties that might need to be looked after. How-To
instructions can be found [here](#how-to-test-the-destructor) . But mind that
the disposer output contains only hints, that still need human interpretation.

Example destructor

```javascript
destruct()
{
  this._data = this._moreData = null;
  this._disposeObjects("_buttonOk", "_buttonCancel");
  this._disposeArray("_children");
  this._disposeMap("_registry");
}
```

- `_disposeObjects`: Supports multiple arguments. Dispose the objects (Qooxdoo
  objects) under each key and finally delete the key from the instance.

- `_disposeArray`: Disposes the array under the given key, but disposes all
  entries in this array first. It must contain instances of qx.core.Object only.

- `_disposeMap`: Disposes the map under the given key, but disposes all entries
  in this map first. It must contain instances of `qx.core.Object` only.

## How to test the destructor

The destructor code allows you an in-depth analysis of the destructors and finds
fields which may leak etc. The DOM tree gets also queried for back-references to
Qooxdoo instances. These checks are not enabled by default because of the time
they need on each unload of a typical Qooxdoo based application.

To enable these checks you need to select a variant and configure a setting.

The environment setting `qx.debug` must be `true`. The setting
`qx.debug.dispose.level` must be at least at `1` to show not disposed Qooxdoo
objects if they need to be deleted. A setting of `2` will additionally show non
Qooxdoo objects. Higher values mean more output. Don't be alarmed if some
Qooxdoo internal showing up. Usually there is no need to delete all references.
Garbage collection can do much for you here. For a general analysis `1` should
be enough, a value of `2` should be used to be sure you did not miss anything.

Log output from these settings could look something like this:

```
35443 DEBUG: testgui.Report[1004]: Disposing: [object testgui.Report]FireBug.js (line 75)
Missing destruct definition for '_scroller' in qx.ui.table.pane.FocusIndicator[1111]: [object qx.ui.table.pane.Scroller]Log.js (line 557)
Missing destruct definition for '_lastMouseDownCell' in qx.ui.table.pane.Scroller[1083]: [object Object]Log.js (line 557)
036394 DEBUG: testgui.Form[3306]: Disposing: [object testgui.Form]FireBug.js (line 75)
Missing destruct definition for '_dateFormat' in qx.ui.component.DateChooserButton[3579]: [object qx.util.format.DateFormat]Log.js (line 557)
Missing destruct definition for '_dateFormat' in qx.ui.component.DateChooserButton[3666]: [object qx.util.format.DateFormat]Log.js (line 557)
```

The nice thing here is that the log messages already indicate which dispose
method to use: Every _"Missing destruct..."_ line contains a hint to the type of
member that is not being disposed properly, in the _"[object ...]"_ part of the
line. As a rule of thumb

- native Javascript types (Number, String, Object, ...) usually don't need to be
  disposed.
- for Qooxdoo objects (e.g. `qx.util.format.DateFormat`, `testgui.Report`, ...) use
  `_disposeObjects`
- for arrays or maps of Qooxdoo objects use `_disposeArray` or `_disposeMap`.
- be sure to cut all references to the DOM because garbage collection can not
  dispose object still connected to the DOM. This is also true for event
  listeners for example.
