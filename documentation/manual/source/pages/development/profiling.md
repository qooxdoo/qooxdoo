Profiling Applications
======================

qooxdoo has built-in a cross-browser, pure JavaScript profiler. If the profiler is enabled, each call of a method defined by qooxdoo's class declaration can be measured. The profiler is able to compute both the total own time and the call count of any method.

Since the profiler is implemented in pure JavaScript, it is totally cross-browser and works on any supported browser.

How to enable the Profiler
--------------------------

Basically set the environment setting `qx.aspects` to `true` and be sure to include the class [qx.dev.Profile](http://api.qooxdoo.org/#qx.dev.Profile). The class should be included before other classes. The easiest way to achieve that is to extend the `profiling` helper job in a job that creates your application. For example, to enable profiling in the source version of your app, go to the `"jobs"` section of your config.json, and add :

    "source-script" : {
      "extend" : [ "profiling" ]
    }

How to use the Profiler
-----------------------

The profiler can be controlled either hard-wired in the application code, or interactively using a JavaScript shell like FireBug for Firefox or DebugBar for IE.

Profiling a certain action:

-   Open the application in your browser
-   At the JavaScript console type `qx.dev.Profile.stop()` to clear the current profiling data gathered during startup
-   Start profiling using `qx.dev.Profile.start()`
-   Perform the action you want to profile
-   Stop profiling using `qx.dev.Profile.stop()`
-   Open the profiler output window: `qx.dev.Profile.showResults(50)`. The parameter specifies how many items to display. Default value is set to 100. The output will be sorted by the total own time of each method. Alternatively you can work with the raw profiling data returned by `qx.dev.Profile.getProfileData()`.

Limitations
-----------

In order to interpret the results correctly it is important to know the limitations of this profiling approach. The most significant limitation is due to the fact that the profiler itself is written in JavaScript and runs in the same context as the application:

-   The profiler adds some overhead to each function call. The profiler takes this overhead into account in the calculation of the own time but there can still be a small inaccuracy.
-   The result of `new Date()`, which is used for timing, has a granularity of about 10ms on many platforms, so it is hard to measure especially small functions accurately.
-   The application is slowed down because profiling is done by wrapping each function. Profiling should always be turned off in production code before deployment.

Summary
-------

The output of the profiler can be of great value to find hot spots and time-consuming code. The timing data should be interpreted rather qualitatively than quantitatively, though, due to constraints of this approach.

> **note**
>
> The application is slowed down because profiling is done by wrapping each function. Profiling should always be turned off in production code before deployment.
