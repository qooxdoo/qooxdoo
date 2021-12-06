# Debugging Applications

You have several options at hand when it comes to debugging a Qooxdoo
application.

## Introspection

- [`qx.lang.Json.stringify()`](apps://apiviewer/#qx.lang.Json~stringify)
- [`qx.dev.Debug()`](apps://apiviewer/#qx.dev.Debug)

Included in the latter is qx.dev.Debug.debugObject() which will print out a
complete recursive hierarchy (or up to some max level) of an object.

This is taken from a interactive javascript console session:

```text
>>> var myTest = {a:1, b:[2,3], c:4}
>>> qx.dev.Debug.debugObject(myTest)
1665905: Object, count=3:
------------------------------------------------------------
a: 1
b: Array
 0: 2
 1: 3
c: 4
==================================

```

## Debugging API

These are helpful idioms you might want to include in your code, i.e. you use
them at _programming time_.

### this.debug()

With `this.debug()` you can print out any string you want to see in the console
during execution of your application. Of course you might want to interpolate
variable values in the output. If you pass an entire object reference, the whole
object will by stringified and printed. So beware: for big objects you get the
entire instantiation in code printed out!

Example:

```javascript
this.debug("I found this value for myVar: " + myVar);
```

### console.log()

In contrast to this.debug(), if you pass an object reference to `console.log()`
Firebug will provide you with a nice hyperlink to the live object which you can
follow to inspect the object in a structured way. This is much easier to
navigate than to skim through pages of source output.

```javascript
var b = new qx.ui.form.Button();
console.log(b);
```

### this.trace()

Will log the current stack trace using the defined logger. This can be useful to
inspect from which method the current function was called.

```javascript
this.trace();
```

## Getting at your Objects

This section shows you how to access objects of your application at _ run time_,
i.e. while it executes. Access to those objects is possible through JavaScript,
either in the form of another piece of JavaScript code, or - especially
interesting for debugging - from an interactive shell, like Firebug or Venkman,
that allows for interactive input and execution of JavaScript commands.

### qx.core.Init.getApplication()

In your running app, the singleton `Init` object provides you with the
`getApplication()` method, to access the root object of your application. All
members and sub-members that you have attached to your application class in your
code are accessible this way.

```javascript
qx.core.Init.getApplication();
```
