# Events

Events are a key concept of data binding. They are responsible for notifying
every connected view (which can be more than one) to update their representation
of the data stored in the model. You can see the events as a nervous system for
your data bound app. In general, there are two different kinds of events.

## Change Events

The basic events used in the data binding are the change events of the
[Qooxdoo property system](/core/understanding_properties). You will find some
details about the
[change events of properties](/core/understanding_properties#change_events) in
the documentation. Those events are fired as soon as a property changes.

### Array

- There is also an event for [data arrays](models#data_array), which will fire
  events on every change as well. This event is called `change` and is a data
  array containing additional information. The information is stored as data in
  a map and contains the following keys.

  - `start`: The start index of the change e.g. 0 if the index 0 has been
    written.
  - `end`: The end index of the change. This might often be the same as the
    start index but there are some operation which might take action on a range
    of items like `sort` or `splice`.
  - `type`: The type of the change as a String. This can be 'add', 'remove' or
    'order'.
  - `items`: The items which has been changed (as a JavaScript array).

## Bubbling Events

Regular change events might not be enough in every use case. If we consider a
huge tree like data model, it's quite a lot of work to add a listener to every
model object to get updates for the view. Therefore, the data binding also
supports bubbling events named `changeBubbles`. These events are provided by a
mixin named  
[MEventBubbling](apps://apiviewer/#qx.data.marshal.MEventBubbling).

### Enabling

These bubbling events are disabled by default because firing an additional event
for every change is not always necessary. There are two ways for enabling the
events. The most easy and preferred way is to use the
`marhsalerdata_binding/models.md#json_marshaller` to create the models. You will
find more details about how to do that in the
`marhsaler sectiondata_binding/models.md#json_marshaller`. A second way is to
include the mixin to your own classes. More details on that in the
[API documentation of that mixin](apps:/apiviewer/#qx.data.marshal.MEventBubbling)
.

### Details

This event, like the regular change event of the Array, also offers additional
information on the kind of change and where the change initially happened. The
data of the event contains a map offering the following keys:

> - `value`: The new value of the property.
> - `old`: The old value of the property.
> - `name`: The name of the property including its parents e.g. `bar[3].baz` .
> - `item`: The model item that has been changed.

### Array

The data array also offers bubble events with the same details. But the arrays
don't have properties which change. You can see the index of the array as
property instead. So here is a sample what a unshift action on an array might
look like:

```
var array = new qx.data.Array("a", "b", "c");
array.addListener("changeBubble", function(e) {
  var data = e.getData();
  // do something with the data
});
array.unshift("X");
```

Think of the unshift action as something which manipulates the index 0 because
it adds one item at the index 0 and moves every item by one index. This unshift
will produce the following data in the changeBubble event:

> - `value`: `['X']` (An array containing the new value at the index 0)
> - `old`: `['a']` (An array containing the old value at the index 0)
> - `name`: `0` (The name of the changed index)
> - `item`: _(array)_ (The array itself)

The properties `value` and `old` are always an array because there are
operations which change several indexes at once like `splice`.
