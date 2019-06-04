Using Parts
===========

Basic Usage
-----------

Parts allow you partition your application into multiple Javascript files.There is an initial part, the *boot* part, that is loaded at application start-up. All other parts have to be loaded explicitly in your application code.

To use parts in your application, you have to do two things:

-   declare the parts in your application's *config.json* configuration file
-   load each part other than the boot part explicitly at suitable situations in your application code

Here is an example:

Suppose you have a settings dialog in your application that is only needed occasionally. You want to save the memory footprint of the involved classes, and only load the dialog on demand when the user hits an "Open Settings Dialog" button during a session. If the user doesn't invoke the dialog, the necessary classes are not loaded and the application uses less memory in the browser. In all cases, application start-up is faster since less code has to be loaded initially.

### Add Parts to your Config

In your configuration file, add the following job entries (assuming you are using a standard GUI application with a name space of *custom*):

    "my-parts-config":
    {
      "packages" :
      {
        "parts"  :
        {
          "boot"     :
          {
            "include" : [ "${QXTHEME}", "custom.Application" ]
          },
          "settings" :
          {
            "include" : [ "custom.Settings" ]
          }
        }
      }
    },

    "source" :
    {
      "extend" : [ "my-parts-config" ]
    },

    "build" :
    {
      "extend" : [ "my-parts-config" ]
    }

This will inject your part configuration into the standard build jobs (*source* and *build*), instructing the generator to generate JS files for the "boot" and the additional "settings" part (a single part may be made up of multiple JS files, depending on cross class dependencies with other parts). In the *boot* part, you are repeating the main include \<pages/tool/generator/generator\_config\_ref\#include\> list of class patterns for you application (the example above mirrors this list of a standard GUI app). In the part you want to separate from the initial boot part, like *settings* above, you carve out some top-level classes or name spaces that constitute the part you want to specify. In our example, this is just the name of the top-level dialog class.

### Add Part Loading to your Class Code

Next, you have to add code to your application to load any part other than the boot part. Carrying on with our example, at a suitable spot in your application code, you have to load the *settings* part, e.g. when some "Open Settings Dialog" button is pressed which is available from your main application class. We put the loading action in the tap event listener of the button:

    var settingsButton = new qx.ui.toolbar.Button("Open Settings Dialog");

    settingsButton.addListener("execute", function(e)
    {
      qx.io.PartLoader.require(["settings"], function()
      {
        // if the window is not created
        if (!this.__settingsWindow)
        {
          // create it
          this.__settingsWindow = new custom.Settings();
          this.getRoot().add(this.__settingsWindow);
        }

        // open the window
        this.__settingsWindow.center();
        this.__settingsWindow.open();
      }, this);

    }, this);

The main thing to note here is that upon pressing the "Open Settings Dialog" button *qx.io.PartLoader.require* is invoked to make sure the *settings* part will be loaded (It doesn't hurt to invoke this method multiple times, as the PartLoader knows which parts have been loaded already).

The first argument to the *require* method is a list containing the parts you want to be loaded (just *"settings"* in our example). The second argument specifies the code that should be run once the part is successfully loaded. As you can see, the *custom.Settings* class which is loaded with this part is being instantiated.

This section also shows that you cannot run the same application with and without parts. In order to use parts, you have to "instrument" your application code with calls to *qx.io.PartLoader.require*, and currently there is no way these calls can fail gracefully. You have to make a decision.

These are the essential ingredients to set up and use parts in your application. For full details on the *packages* configuration key, see the configuration reference \<pages/tool/generator/generator\_config\_ref\#packages\>. For some additional usage information relating to this key, see this article \<pages/tool/generator/generator\_config\_articles\#packages\_key\>. For a complete application that uses parts, check the [Feedreader sources](https://github.com/qooxdoo/qooxdoo/tree/%{release_tag}/application/feedreader/).

In Depth: Configuring the "include" Key of your Parts
-----------------------------------------------------

The most crucial and at the same time most difficult aspect of using parts is configuring the parts in your *config.json*. More specifically, the definition of the *include* key for each part requires thought and consideration to get right. This section tries to give you a set of technical guidelines to help you with that.

**"include" lists must be free of overlap**  
Don't list classes in the *include* list of one part which also appear in another. This becomes less obvious when you use wildcards in your *include* lists: `[ "foo.bar.*" ]` overlaps with `[ "foo.bar.baz" ]`, and with `[ "foo.*" ]`! So think of what these expressions will expand to. The generator will complain should two *include* lists overlap.

**Don't put load dependencies of one part in the "include" list of another**  
This is even less obvious. The base line is that you must not have classes in the *include* list of one part that are needed by classes of another part at load time. (Mind that this is **not** only referring to the *include* list of the other part, but to all its classes!). A good criterion to follow is: Stick to classes that are only used in some **member method** of another class. Then you are usually on the safe side, and are only using classes for your part definition that are required by others at run time, not load time. (Counter examples would be classes that are used as super classes by others (they show up in their *extend* entry), or are used in the *defer* section of another class, or are used to directly initialize a map entry, like an attribute, of another class definition). The generator will complain if load dependencies of one part are listed in the definition of another.

**Don't group classes "physically"**  
That means: Don't think about how classes are organized in terms of libraries or name spaces. This is not a good defining principle for parts. Try to think in terms of **logical** or **visual** components, and let the generator figure out which classes from which libraries and name spaces need to go into that part. Visual or logical components usually map to *execution paths* in your running app. A dialog, a window, a certain tab view that are only reached when the user makes some specific interactions with your application, thus following a specific execution path in your code, those are good candidates for defining a part. Of course, e.g. when you are using a library or contribution in your application which exhibits one class as its published API and which you instantiate at one specific point in your application, this might also make for a good part, but would be merely coincidental.

**Don't define parts with framework classes**  
This is just a concrete example of the previous point, but happens so often that it merits its own mentioning. It is generally a bad idea to use framework classes to define a part. Framework classes should be free to be added where they are needed *by your classes' dependencies*. And although there are high-level widgets in the framework, like the DateChooser or the HtmlArea, you always have application code wrapped around them. Then it's good practice to forge this code into its own custom class, and make this class the entry point for a part.

Advanced Usage: Part Collapsing
-------------------------------

This section reflects part collapsing, i.e. the merging of one package into another which reduces the number of packages a part depends on.

### Motivation and Background

You as the application developer define *parts* to partition your application. %{qooxdoo}'s build system then partitions each part into *packages*, so that each part is made up of some of the set of all packages. Each package contains class code, and maybe some more information that pertains to it. So the classes making up a part are spread over a set of packages. Several parts can share one or more packages.

This way we obtain maximum flexibility for loading parts in your application. Whenever a part is requested through the *PartLoader* it checks which packages have already been loaded with earlier parts, and loads the remaining packages that complete the requested part. No class is loaded twice, and no unnecessary classes are loaded with each part.

The upper limit for the number of packages which are initially constructed from the definition of the parts is **(2 \^ number\_of(parts)) - 1** (That is two to the power of the number of parts, minus one). E.g. if you have defined 3 parts, the initial number of packages can be 7. (This is due to the fact that each package is defined by the set of classes that are required by the same parts). But there are situations where you might want to give up on this optimal distribution of classes across packages:

-   when packages become **too small**; sometimes packages derived with the basic procedure turn out to be too small, and the benefit of loading no unnecessary classes is outweigh by the fact that you have to make an additional net request to retrieve them.
-   when you know the **order** in which parts are loaded during run time in advance; then it makes sense to be "greedy" in retrieving as many classes as possible in a single package, as other parts needing the same classes of the (now bigger) package, but are known to load later, can rely on those classes being loaded already, without being affected by the extra classes that get loaded.

These are situations where *part collapsing* is useful, where packages are merged into one another. This is discussed in the next sections.

### How Packages are Merged

*(This is a more theoretical section, but it is kept here for the time being; if you are only looking for how-to information, you can skip this section).*

During what we call part collapsing, some packages are merged into others. That means the classes that are contained a source package are added to a target package, and the source package is deleted from all parts referencing it.

Obviously, it is crucial that the target package is referenced in all those parts where the source package was referenced originally, so that a part is not loosing the classes of the source package. This is taken care of by the selection process that for any given source package picks an appropriate target package. (Target packages are searched for in the set of already defined packages, and there are no new packages being constructed during the collapsing process).

After the source package has been merged into the target package, and has been removed from all parts, there are two cases:

-   For parts that referenced both (source and target) package initially, there is no difference. The same set of classes is delivered, with the only difference that they come in one, as opposed to two, packages.
-   Parts that only reference the target package now reference more classes then they really need. But this should be acceptable, as either negligible (in the case of merging packages by size), since the additional weight is marginal; or as without negative effect (in the case of merging by load order), since the "overladen" package is supposed to be loaded earlier with some other part, and will already be available when this part is loaded.

### Collapsing By Package Size

Collapsing by package size is straight forward. You can specify a minimal package size (in KB) that applies to all packages of your application. If a package's size, and it is its *compiled* size that matters here, is beneath this threshold the package will be merged into another. This avoids the problem of too much fragmentation of classes over packages, and trades optimally distributing the classes (to always load only necessary classes) for minimizing net requests (when loading packages for a part).

Collapsing by size is disabled by default. You enable it by specifying size attributes in your parts configuration:

    "packages" :
    {
      "sizes"    :
      {
        "min-package" : 20,
        "min-package-unshared" : 10
      },
      ...
    }

The *min-package* setting defines a general lower bound for package sizes, the *min-package-unshared*, which defaults to *min-package* if not given, allows you to refine this value specifically for those packages which pertain to only one part.

### Collapsing By Load Order

Collapsing by load order is always useful when you know in advance the order of at least some of your parts, as they are loaded during the app's run time. This is e.g. the case when you have a part that uses other parts to do its work (a big dialogue that has sub-controls like a tabview). The enclosing part is always loaded before its sub-parts can be used. Or there is a part that is only accessible after it has been enabled in another part. These situations can be captured by assigning a load order to (some of) your parts in your configuration.

    "packages" :
    {
      "parts"  :
      {
        "boot" :
        {
          "include"   : [ "${QXTHEME}", "app.Application" ]
        },
        "some-part" :
        {
          "include"   : [ "app.Class1", "app.Class2" ],
          "expected-load-order" : 1
        },
        "other-part" :
        {
          "include"   : [ "app.Class3", "app.Class4" ],
          "expected-load-order" : 2
        },
        ...
      },
      ...
    }

The *boot* part has always the load index 0, as it is always loaded first. The other parts that have a load index (1 and 2 in the example) will be collapsed with the expectation that they are loaded in this order. Parts that don't have an *expected-load-order* setting are not optimized by part collapsing, and there are no assumptions made as to when they are loaded during run time.

The important thing to note here is that the load order you define is **not destructive**. That means that parts are still self-contained and will continue to function *even if the expected load order is changed during run time*. In such cases, you only pay a penalty that classes are loaded with a part that are actually not used by it. But the overall functionality of your application is not negatively affected.
