Resources
=========

Resources comprise images, icons, style sheets, Flash files, helper HTML files, and so forth. The framework itself provides many icons and some other useful resources you can use right away in your application without any customization. This article however explains how to specify and use custom resources for your application.

Technical overview
------------------

Resources live in the `source/resource/<namespace>` subtree of each library. You explicitly reference a resource in your application code by just naming the path of the corresponding file **under** this root (This is also referred to as the **resource id**).

So if there is a resource in your "myapp" application under the path `myapp/source/resource/myapp/icons/tray.png` you would refer to it in your application code with `myapp/icons/tray.png`.

To find the corresponding file during a build, qooxdoo searches all those paths of all the libraries your application is using. The first hit will be regarded as the resource you want to use. (During the generation of a `build` version of your app, these resource files will be copied to the `build` folder, so your build version will be self-contained).

The libraries are searched in the order they are declared in your config.json file. This usually means that your own resource folder comes first, then the framework's resource folder, and then the resource folders of all further libraries you have included. This way, you can *shadow* resources of like names, e.g. by adding a file `qx/static/blank.gif` under your source/resource folder you will shadow the file of the same resource id in the framework.

Declaring resources in the code
-------------------------------

You have to declare the resources you wish to use in your application code in an `@asset` compiler hint near the top of your source file.

    /**
     *
     * @asset(myapp/icons/16/folder-open.png)
     */

This is essential, since these hints are evaluated during the compile step, which searches for the corresponding files, generates appropriate URIs to them and copies them to the `build` folder.

Instead of adding meta information for each individual resource, you may as well use simple (shell) wildcards to specify a whole set of resources:

    /**
     *
     * @asset(myapp/icons/16/*)
     */

This is all you need to configure if your application code uses any of the icons in the given folder.

Using resources with widgets
----------------------------

Once you've declared the resource in your code, you can equip any compatible widget with it.

Here's an example:

    var button = new qx.ui.form.Button("Button B", "myapp/icons/16/folder-open.png");

Using qooxdoo icons with widgets
--------------------------------

If you want to use some of the icons as resources that are part of the icon themes that come with qooxdoo, there are the following ways to do so:

1.  Use the explicit resource ID of the icons from the qx namespace. The icons are then taken from the framework resource folder, and contain the icons' theme name explicitly.
2.  Use a macro to get the icons from the current theme. This would allow for a later change of icon themes at the config file level, without the need to adjust any resource IDs in your application code. The Generator documentation
    \<pages/tool/generator/generator\_config\_articles\#asset-let\_key\> explains how to declare these macros.
3.  Copy the icons you are interested in from the original location in the %{qooxdoo} framework to the local resource folder of your application. You are now independent of the qooxdoo icon theme folders and can manage these icons as you would with any other custom images.

<!-- -->

    /**
     * @asset(qx/icon/Oxygen/16/apps/utilities-dictionary.png)
     * @asset(qx/icon/${qx.icontheme}/16/apps/utilities-dictionary.png)
     * @asset(myapp/icons/16/utilities-dictionary.png)
     */

    ...

    var button1 = new qx.ui.form.Button("First Button", 
           "qx/icon/Oxygen/16/apps/utilities-dictionary.png");
    var button2 = new qx.ui.form.Button("Second Button", 
           "icon/16/apps/utilities-dictionary.png");
    var button3 = new qx.ui.form.Button("Third Button", 
           "myapp/icons/16/utilities-dictionary.png");

(The constructor call for button2 also relies on a resource alias to hide the current icon theme).

When you use the asset macro variant the used theme and the used icon theme need to be in sync. The default icon set for most themes is *Tango*, but if you want to use the *Classic* theme make sure that icons from the *Oxygen* icon theme are used. You can achieve this by editing your config.json like this:

    {
      "name"    : "myapp",

      ...

      "let" :
      {
        "APPLICATION"  : "myapp",
        ...
        "QXTHEME"      : "qx.theme.Classic",
        "QXICONTHEME"  : ["Oxygen"],
        ...
        "ROOT"         : "."
      }
    }

Obtaining the URL for a resource
--------------------------------

To obtain a URL for a resource, use the [ResourceManager](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.util.ResourceManager):

    var iframe = new
    qx.ui.embed.Iframe(qx.util.ResourceManager.getInstance().toUri("myapp/html/FAQ.htm"));

Modifying the resource or script URIs at runtime
------------------------------------------------

In some usage scenarios, it can be necessary to modify the URIs used to reference code and resources after the application was started. This can be achieved using the [Library Manager](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.util.LibraryManager):

    qx.util.LibraryManager.getInstance().set("myapp", "resourceUri", "http://example.com/resources");
    qx.util.ResourceManager.getInstance().toUri("myapp/html/FAQ.htm"); //returns "http://example.com/resources/myapp/html/FAQ.htm"
