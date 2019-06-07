Environment
===========

Introduction
------------

The environment of an application is a set of values that can be queried through a well-defined interface. Values are referenced through unique keys. You can think of this set as a global key:value store for the application. Values are write-once, read-many, but there are also read-only values. If a value for a certain key can be set, it can be set in various ways, e.g. by code, through build configuration, etc., usually during startup of the application, and not changed later. Other environment values are automatically discovered when they are queried at run time, such as the name of the current browser, or the number of allowed server connections. This way, the environment API also implements browser feature detection, and these values cannot be arbitrarily set.

Environment settings are also used in the framework, among other things to add debug code in the form of additional tests and logging, to provide browser-specific implementations of certain methods, asf. Certain settable environment keys are pre-defined by qooxdoo, the values of which can be overridden by the application. Applications are also free to define their own environment keys and query their values at run time.

So for the application developer, the environment represents a set of global values that mirrors the general parameters under which the application runs. It can be used to both *detect* (e.g. browser features) as well as *inject* such parameters (e.g. through build configuration). For global values that are *not* derived from the outside world in some way, just use e.g. a static application class.

Motivation
----------

Environment settings address various needs around JavaScript applications:

-   Control initial settings of the framework, before the custom classes are loaded.
-   Pass values from outside to the application.
-   Trigger the creation of multiple build files.
-   Query features of the platform at run time (browser engine, HTML5 support, etc.)
-   Create builds optimized for a specific target environment, i.e. feature-based builds.

As there are a number of pre-defined settings in the framework, you can make use of them right away by querying their values in your application code. The next section deals with that. Afterwards, you learn how to override default values or define your own environment settings.

Querying Environment Settings
-----------------------------

In general, there are two different kinds of settings, **synchronous** and **asynchronous**. The asynchronous settings are especially for feature checks where the check itself is asynchronous, like checking for data: URL support. Both kinds have two query methods at the qx.core.Environment class, *.get()* and *select()* for synchronous, and *.getAsync()* and *.selectAsync()* for asynchronous settings.

### Synchronous

Let's first take a look at the synchronous API and the two possibilities of accessing the data:

    qx.core.Environment.get("myapp.key");

The `get` method is likely the most important one. It returns the value for the given key, `myapp.key` in this example.

    qx.core.Environment.select("myapp.key", {
      "value1" : resvalue1,
      "value2" : resvalue2,
      "default" : catchAllValue 
    }

The `select` method is a way to select a value from a given map. This offers a convenient way to select an expression for a given key value. It also allows you to specify the special map key **"default"**, that will be used if the current value of the environment key does not match any of the other map keys. This is very handy when only one of the expected values needs a special case treatment. In the example above, the `resvalue(s)` could be a function or any other valid JavaScript expression.

### Asynchronous

The asynchronous methods are a direct mapping of their synchronous counterparts.

    qx.core.Environment.getAsync("myapp.key", function(result) {
      // callback
    }, context);

As the *.getAsync* does not return a result immediately, you have to specify a callback method which will be executed as soon as the value for the environment key is available. Your callback will be passed this value as the single argument, and the callback is responsible to integrate the result with your application.

This principle carries over to the corresponding select call:

    qx.core.Environment.selectAsync("myapp.key", {
      "value" : function(result) { 
        // callback value 1
      },
      "default" : function(result) {
        // catch all callback
      }
    }, context)

In case of an asynchronous select the type of the values has to be a function, which will be called as soon as the key value is available. Again, you can provide a *"default"* case. As with the callbacks used for *.getAsync*, the callbacks used with *.selectAsync* will also get the key value as parameter, which might come handy especially in the *"default"* case.

### Caching

It sure happens in the live cycle of an application that some key get queried quite often, like the engine name. The environment system caches every value to ensure the best possible performance on expensive feature tests. But in some edge cases, it might happen that you want to redo the test. For such use cases you can invalidate the cache for a given key, to force a re-calculation on the next query:

    qx.core.Environment.invalidateCacheKey("myapp.key"}

This example would clear a previously calculated value for `myapp.key`.

### Removal of Code

Usually, function calls like *qx.core.Environment.get()* are executed at run time and return the given value of the environment key. This is useful if such value is determined only at run time, or can change between runs. But if you want to pre-determine the value, you can set it in the generator config. The generator can then anticipate the outcome of a query and remove code that wouldn't be used at run time.

For example,

    function foo(a, b) {
      if (qx.core.Environment.get("qx.debug") == true) {
        if ( (arguments.length != 2) || (typeof a != "string") ) {
          throw new Error("Bad arguments!");   
        }
      }
      return 3;
    }

will be reduced in the case *qx.debug* is *false* to

    function foo(a, b) {
      return 3;
    }

In the case of a *select* call,

    qx.core.Environment.select("myapp.key", {
      "value1" : resvalue1,
      "value2" : resvalue2
    }

will reduce if *myapp.key* has the value *value2* to just

    resvalue2

The generator documentation \<pages/tool/generator/generator\_config\_articles\#environment\_key\> has more details on optimization of *qx.core.Environment* calls.

### Pre-defined Environment Keys

qooxdoo comes with a set of pre-defined environment settings. You can divide those into two big groups. One is a set of feature tests which cover browser features like support for certain CSS or HTML features. The second group are simple settings for the qooxdoo framework which drive the inner workings of the framework.

For a complete list of predefined environment keys, take a look at the [API documentation of the qx.core.Environment class](http://demo.qooxdoo.org/%{version}/apiviewer#qx.core.Environment).

Defining New Environment Settings
---------------------------------

Now to actually setting new or overriding existing environment settings. The value of an environment key can take one of two forms, as a concrete literal value, or as a function that returns a value at run time. The former can be achieve in various ways (see further), the latter only through application code. (An environment key with its current value is also referred to as an *environment setting*). We go through both ways now.

### As Literal Values

As already mentioned, there are various possibilities to assign a literal value, like `"foo"`, `3` or `true`, to an environment key. You can define the setting

-   in the class map
-   in method code
-   through inline `<script>` code in the index.html
-   in the generator configuration
-   via URL parameter

The list is sorted in ascending precedence, i.e. if a key is defined multiple times, mechanisms further down the list take higher precedence. Those possibilities are explained in the following sections.

#### In the Class Map

You can define a key and its value through the environment \</pages/core/class\_quickref\> key of the map defining a qooxdoo class:

    qx.Class.define("myapp.ClassA", 
    {
      [...]

      environment : {
        "myapp.key" : value
      }
    });

#### In Application Code

You can define a key and its value in a class method using the *qx.core.Environment.add* method:

    qx.core.Environment.add("key", "value");

#### In the Loading index.html

In the web page loading your qooxdoo application, and before the `<script>` tag loading the initial qooxdoo file, add another `<script>` tag with code that assigns a map to `window.qx.$$environment`, containing your environment settings.

``` {.sourceCode .html}
<script>
  window.qx =
  {
    $$environment : {
      "myapp.key" : value
    }
  }
</script>
```

#### In the Generator Config

You can define a key and its value in the environment \<pages/tool/generator/generator\_config\_ref\#environment\> key of the job with which you build the script files of your application (e.g. *source-script*, *build-script*):

    "myjob" : 
    {
      [...]

      "environment" : {
        "myapp.key" : value
      }
    }

Using the generator config adds a special meaning to the provided environment settings. Specifying a **list** of values for a key triggers the creation of multiple output files by the generator. E.g. replacing **value** with **[value1, value2]** in the above example, the generator will create two output files. See the environment \<pages/tool/generator/generator\_config\_ref\#environment\> key for more information on multiple output generation.

#### Via URL parameter

Before using URL parameter to define environment settings, you have to specify another environment setting in the generator configuration which is named `qx.allowUrlSettings`. If the application is generated with this config setting in place, you can then use URL parameter to add further key:value pairs.

``` {.sourceCode .html}
http://my.server.com/path/to/app/index.html?qxenv:myapp.key:value
```

The pattern in the URL parameter is easy. It has three parts separated by colons. The first part is the constant `qxenv`, the second part is the key of the environment setting and the last part is the value of the setting.

> **note**
>
> **qx.allowUrlSettings and "variants" Optimization**
>
> Setting `qx.allowUrlSettings` to true in the configuration somewhat contradicts using the pages/tool/generator/generator\_optimizations\#variants optimization in builds. The variants optimization takes advantage of the values of environment settings given in the configuration, to remove code like calls to `qx.core.Environment.get()` for such a setting and replace it with the corresponding value. That means that changing the value of such a key via URL parameter later has no effect, as the call to retrieve its value is no longer in the code. You can then only set environment values via URL parameter for those keys which have **not** been given a value in the configuration.
>
> Alternatively, you could disable `variants` optimization in the build, or remove the setting you want to change via URL parameter from the config. In the latter case, you have other possibilities to set a default for this setting, by either providing an `environment` key in the %{JS} class map, or a `qx.core.Environment.add()` call in the class' `defer` function.
>
> If you set `qx.allowUrlSettings` to true and have the `variants` optimization enabled for a particular build, the generator will issue a warning.

So much for setting simple key:value pairs. Now for providing a check function as the value of an environment key.

### As a Check Function

As mentioned before, providing a function in place of a value can only be done in application code, so these environment settings are done at run time. The framework settings defined at run time are usually feature checks like checking for dedicated CSS or HTML features. The check function is executed and is responsible for returning a proper value when the environment key is queried later. These checks can be synchronous or asynchronous, and this corresponds to how they are queried. Synchronous checks are queried with the *.get()* and *.select()* methods, asynchronous checks with *.getAsync()* and *.selectAsync()* (see Querying Environment Settings \<pages/core/environment\#querying\>).

#### Synchronous

To add a synchronous check function, the standard *.add()* call is used:

    qx.core.Environment.add("group.feature", function() {
      return !!window.feature;
    });

This example shows the same API used for adding a key:value setting. The only difference is that you add a function as second parameter and not a simple value. This function is responsible for determining and returning the value for the given environment key. In this example, if `window.feature` is defined, the check will return `true`.

#### Asynchronous

To add an asynchronous check, use *.addAsync()*:

    qx.core.Environment.addAsync("group.feature", function(callback) {
      window.setTimeout(function() {
        callback.call(null, true);
      }, 1000);
    });

This example shows how to add a asynchronous feature check. A timeout is used to get the asynchronous behavior in this simple example. That can be more complicated of course but the timeout is good enough to showcase the API. As you can see in the check function we are adding, it has one parameter called `callback` which is the callback passed by *.getAsync()* or *.selectAsync()* asynchronous queries. As before, the check function is responsible for computing the value of the environment key. But rather than just returning the value (as in the synchronous case), it calls the callback function and passes the value. The callback function is then responsible to integrate the result value with the querying layer. In this simple example, the check waits a second and calls the callback with the result `true`.
