# Introduction to Object Orientation

qooxdoo allows you to easily leverage many key concepts of
object-oriented programming without bothering about limited native
support in JavaScript.

The main actors of qooxdoo OO are:

  - **Classes**
  - **Interfaces**
  - **Mixins**

When trying to get a grip on the framework code, you should probably
understand all three concepts. As a regular application developer, however,
you can often get by ignoring interfaces and mixins initially, and
just get familiar with *classes*.

## Classes

A "class" is a central concept in most object-oriented languages, and as
a programmer you are certainly familiar with it. qooxdoo supports a
"closed form" of class declaration, i.e. the entire declaration is
provided within a `qx.Class.define(name, config)` statement, where
`name` is the fully-qualified class name, and `config` is a
configuration map with various keys (or "sections").

There are several types of classes available, which are specified by the
`type` key within the `config` map:

  - **regular class**: May contain *class* variables/methods (in a
    `statics` section) and *instance* variables/methods (in a `members`
    section). An instance of the class can be created using the `new`
    keyword. A superclass is specified with `extends`. A constructor 
    may be provided with `construct`. `type` is omitted in this case.
  - **static class**: Only contains class variables and class methods.
    Often a helper or utility class. Use `type : "static"`.
  - **abstract class**: Does not allow an instance to be created.
    Typically classes derive from it and provide concrete
    implementations. `type` is `abstract`.
  - **singleton**: Not more than a single instance of the class may
    exists at any time. A static method `getInstance()` returns the
    instance. Use `type : "singleton"`.

## Interfaces

qooxdoo's interfaces are similar to the ones in Java. They are created with
`qx.Interface.define(name, config)`, and specify an "interface" (typically a
set of empty methods), that classes must implement.

## Mixins

Mixins are a very practical concept that not all programming languages
provide. Unlike interfaces, which require a class to provide concrete
implementations to fulfill the interface contract, mixins include
code which must be generic, as it is "mixed into" other
existing classes. Mixins usually cover only a single aspect of
functionality and therefore tend to be small, but may be "mixed into" 
multiple other classes. They are declared by `qx.Mixin.define(name, config)`.

## Inheritance

Like most programming languages qooxdoo only supports single-inheritance
for classes, not multiple-inheritance, i.e. a class can only derive
directly from a single super class. This is easily modeled by the
`extend` key in the class declaration map.

Since a class may implement/include one or many interfaces/mixins, which
themselves can extend others, some advanced forms of
multiple-inheritance can still be realized.

## qooxdoo OO standalone

If you want to use qooxdoo OO layer standalone take a look at [Server](../server).
