# Unit Testing (v.5)

> Unit testing tools will be different for v6 

qooxdoo v5 comes with its own, nicely integrated unit testing environment and the
corresponding application called
[Testrunner](http://www.qooxdoo.org/5.0.1/testrunner). While being similar
to JSUnit, the solution that ships with the qooxdoo SDK does not require any
additional software.

If you look at the component section of a qooxdoo distribution, you will find
the Test Runner tailored to test the functionality of the qooxdoo *framework*.
It provides a convenient interface to test classes that have been written to
that end. You can run single tests, or a whole suite of them at once.

But the Test Runner framework can be deployed for your *own application*. It
provides a GUI, a layer of infrastructure and a certain interface for arbitrary
test classes. You can write your own test classes and take advantage of the Test
Runner environment.

