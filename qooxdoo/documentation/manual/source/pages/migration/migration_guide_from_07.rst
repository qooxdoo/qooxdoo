.. _pages/migration_guide_from_07#migration_guide_from_0.7.x:

Migration Guide (from 0.7.x)
****************************

In order to help in migrating your existing application qooxdoo 1.2 includes a legacy qooxdoo 0.7. This allows you to startup your app in a "hybrid" qooxdoo runtime when doing the actual migration. This hybrid mode is to support migration, it should not be used to deploy your application. Most of your
existing 0.7 app should run ok in this hybrid environment (despite some GUI glitches). So you can actually start with a *working* app for migration instead of a broken one, i.e. one which would only work at some point in the
future - after a lot of probably vague code changes. Being able to use a running app as a starting point should be a big plus.

In order to let your existing 0.7 app run in this hybrid environment, you use the migration tools as explained below, that basically rename the existing framework namespaces from ``qx.Foo`` to ``qx.legacy.Foo``.

Since the GUI-related API often changes significantly in 1.2, you can isolate "islands" of 0.7
GUI code, and wrap that into so-called "Future Embeds". Within
those embeds you rewrite your code manually to 1.2 code where necessary. 

When no ``qx.legacy.*`` namespace is left in your application code, you can remove
the legacy qooxdoo 0.7 code from the qooxdoo 1.2 framework. If your app still works, you have successfully migrated your app. ;-)

`Future Embed <http://demo.qooxdoo.org/1.2/demobrowser/index.html#legacy~EmbedFuture_Layout.html>`_ (`API <http://demo.qooxdoo.org/1.2/apiviewer/#qx.legacy.ui.embed.Future>`_)

:doc:`migration_notes_from_07`

.. _pages/migration_guide_from_07#porting_an_application:

Porting an application
======================

The following step-by-step tutorial demonstrates how to migrate an 0.7 app to qooxdoo 1.2. The feedreader demo application is used as a real-life example. Watch the various milestones in this process that you should get to successfully.

.. _pages/migration_guide_from_07#create_a_new_application:

Create a new application
------------------------

The best way to start porting your existing application is to create an empty 1.2 application.
Run the ``create-application.py`` from your ``tool/bin`` folder and specify name and type of your application. The additional parameter ensures that this app is properly configured to hold an app for migration.

::

    ../tool/bin/create-application.py -n feedreader -t migration

::

    >>> Copy skeleton into the output directory: ./feedreader
    >>> Patching file './feedreader/config.json'
    >>> Patching file './feedreader/generate.py'
    >>> Patching file './feedreader/Manifest.json'
    >>> Patching file './feedreader/source/index.html'
    >>> Patching file './feedreader/source/class/feedreader/Application.js'
    >>> Patching file './feedreader/source/class/feedreader/test/DemoTest.js'
    >>> DONE

The generator will create a new folder named *feedreader* inside your application folder.

.. _pages/migration_guide_from_07#generate_a_source_version:

Generate a source version
-------------------------

qooxdoo 1.2 comes with a new build process for generating your application. Instead of calling ``make source`` in your application's folder, you now have to enter ``./generate.py source``:

::

    cd ~/workspace/qooxdoo.trunk/application/feedreader/
    ./generate.py source

After running this command open the file ``index.html`` in the ``source`` folder in your web browser.

**Checkpoint 1**: You should see a button named *First button*. 

.. _pages/migration_guide_from_07#modify_the_config.json:

Modify the config.json
----------------------

With the new generator come new configuration files. A file named ``config.json`` replaces the ``Makefile``. Open the ``config.json`` and enter your settings. You can check the :doc:`Makefile migration <migration_makefile>` for changes in these settings. If in doubt, leave this step for later and continue using the pre-configured ``config.json``.

.. _pages/migration_guide_from_07#copy_the_applications_files:

Copy the application's files
----------------------------

An application's folder structure does not change in 1.2, so you can just copy all your JavaScript classes or application resources to your new application.

::

    cp -r ~/workspace/qooxdoo.legacy_0_7_x/frontend/application/feedreader/source ./

.. _pages/migration_guide_from_07#choose_a_way_of_migrating:

Choose a way of migrating
-------------------------

To migrate your application to qooxdoo 1.2, you have two choices:

(1) Generate a legacy application and port it part by part
(2) Start with a 1.2 application and rewrite the GUI part of your application

Path 1. involves running the migration job (which is detailed further down). This job will re-write parts of your application to use the compatibility classes from the ``qx.legacy.*`` name space. After that your application should be (mostly) runnable with qooxdoo 1.2 without much manual code changes since the old APIs are retained in the ``qx.legacy.*`` name space.

Path 2. skips the migration job. Rather, you will have to re-write all affected parts of your application by hand until the whole code uses the new 1.2 class APIs. 

Most likely the application's GUI part is the most difficult of all parts. Maintaining GUI code often results in many little changes which can lead to unattractive code. The migration to qooxdoo 1.2 might be the chance to start from the scratch and rewrite this section in a clean and modern way. But this is also a tedious procedure, and might take some time before you have a working application again.

On the other hand, creating a legacy application has the advantage of changing the most important parts automatically and keep your application running during the migration. You can then port your code to the new APIs step by step. But you want to make sure you get rid of the compatibility layer eventually.

The remainder of this document assumes that you are using path 1. and are transforming your project into a legacy application. If you decide to go with alternative 2. and do a fully manual port, the :doc:`migration notes <migration_notes_from_07>` might be of help.

.. _pages/migration_guide_from_07#running_the_migration_script:

Running the migration script
----------------------------

The generator will traverse your classes and add the prefix *legacy* to all qooxdoo classes. This will result in a *working* qooxdoo 0.7 application inside the new 1.2 environment. Here is a sample run of the migration job:

::

    ./generate.py migration

::

    NOTE:    To apply only the necessary changes to your project, we
             need to know the qooxdoo version it currently works with.

    Please enter your current qooxdoo version [0.7.3] :   

Enter your qooxdoo version or just hit return if you are using the latest version.

::

    MIGRATION SUMMARY:

    Current qooxdoo version:   0.7.3
    Upgrade path:              1.2-pre1 -> 1.2-pre2 -> 1.2-beta1 -> 1.2-rc1 -> 1.2

    Affected Classes:
        feedreader.view.Header
        feedreader.view.Article
        feedreader.view.Tree
        feedreader.PreferenceWindow
        feedreader.view.ToolBar
        feedreader.FeedParser
        feedreader.view.Table
        feedreader.Application
        feedreader.test.DemoTest

    NOTE:    It is advised to do a 'make distclean' before migrating any files.
             If you choose 'yes', a subprocess will be invoked to run distclean,
             and after completion you will be prompted if you want to
             continue with the migration. If you choose 'no', the making distclean
             step will be skipped (which might result in potentially unnecessary
             files being migrated).

    Do you want to run 'make distclean' now? [yes] : 

Enter "yes".

::

    WARNING: The migration process will update the files in place. Please make
             sure, you have a backup of your project. The complete output of the
             migration process will be logged to 'migration.log'.

    Do you want to start the migration now? [no] : 

Enter "yes".

Check ``migration.log`` for messages that contain *foo.js has been modified. Storing modifications ...* to insure that the migration process worked.

.. _pages/migration_guide_from_07#manual_work:

Manual work
-----------

.. note::

    This is only needed for qooxdoo 1.2. If you are using 0.8.1 or higher (trunk version as well) just skip this part.

Open ``config.json`` and add this block of code in the ``jobs`` section:

::

    "common" :
    {
      "include" : 
      [
        "${APPLICATION}.Application",
        "${QXTHEME}",
        "qx.legacy.theme.ClassicRoyale"
      ],
      "settings" :
      {
        "qx.legacy.theme" : "qx.legacy.theme.ClassicRoyale"
      }
    },

Then change

::

    "extend" : ["appconf::build"]

to 

::

    "extend" : ["common", "appconf::build"]

and

::

    "extend" : ["appconf::source"]

to 

::

    "extend" : ["common", "appconf::source"]

.. _pages/migration_guide_from_07#porting_parts:

Porting parts
-------------
Run ``./generate.py source`` once again.

**Checkpoint 2**: You should see your completely working application.

Congratulations, you have a 0.7 application inside a qooxdoo 1.2 environment.

.. note::

    Please note that your application runs in quirks mode since this is needed to render legacy widgets correctly. The document mode *shouldn't be* a problem if you have a single page application (RIA). If you want to work with HTML just add a valid doctype to the index.html.

.. _pages/migration_guide_from_07#adjust_the_application_class:

Adjust the application class
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You can now replace widgets inside your application with 1.2 widgets by putting them into “Future Embeds”. To be able to use 1.2 widgets you have to change your legacy application to a qooxdoo 1.2 compat application which allows you to use 0.7 and 1.2 widgets.

In order to use the "Future Embeds" widgets you have to change the ``Application.js``.

Change

::

    extend : qx.legacy.application.Gui

into

::

    extend : qx.application.Inline,
    include : [qx.legacy.application.MGuiCompat],

and 

::

    this.base(arguments);

into

::

    this.base(arguments);
    this.compat();

In our demo application (Feedreader), we have to change the name of the overridden method ``postload()`` to ``finalize()``.

.. note::

    Please note that the application lifecycle has changed:
    In 0.8 ``close()`` and ``terminate()`` are **not** called by the framework.
    In 0.8.1 ``close()`` will be called during when a ``onbeforeunload`` event is fired by the browser. It is possible to stop the unload process if the application's ``close()`` method returns an string. (This string will be shown in a ``confirm()`` dialog to inform the user about the unload process.)

We have a list of :doc:`GUI Changes <migration_notes_from_07>` (currently work in progress) containing detailed information.

Run ``./generate.py source`` once again, since some classes (e.g. ``MGuiCompat``) have been added to the application.

**Checkpoint 3**: Your application should still be working.

.. _pages/migration_guide_from_07#migrate_the_tree_widget:

Migrate the tree widget
^^^^^^^^^^^^^^^^^^^^^^^

.. _pages/migration_guide_from_07#add_a_future-embed:

Add a Future-Embed
""""""""""""""""""

All 1.2 widgets have to be placed inside a ``qx.legacy.embed.Future``.

So replace

::

    this._treeView = new feedreader.view.Tree(this);
    horSplitPane.addLeft(this._treeView);

with

::

    this._treeView = new feedreader.view.Tree(this);

    var future = new qx.legacy.ui.embed.Future().set({
      width : "100%",
      height : "100%",
      content : this._treeView
    });

    horSplitPane.addLeft(future);

This will create a widget that uses all available space for its content, the ``feedreader.view.Tree``.

.. _pages/migration_guide_from_07#apply_widget-specific_changes:

Apply widget-specific changes
"""""""""""""""""""""""""""""

Now open ``feedreader/view/Tree.js`` and replace

::

    extend : qx.legacy.ui.tree.Tree,

with

::

    extend : qx.ui.tree.Tree,

and

::

    var folder = new qx.legacy.ui.tree.TreeFolder(db[url].title);

with

::

    var folder = new qx.ui.tree.TreeFolder(db[url].title);

and

::

    this.set(
    {
      height   : "100%",
      width    : "100%",
      padding  : 5,
      border   : "line-right",
      overflow : "auto"
    });

with

::

    this.setDecorator(null);

    var root = new qx.ui.tree.TreeFolder("Feeds");
    this._root = root;
    this.setRoot(root);
    this.select(root);
    root.setOpen(true);

and

::

    this.getManager().addEventListener("changeSelection", this._onChangeSelection, this);

with

::

    this.addListener("changeSelection", this._onChangeSelection, this);

and finally

::

    this.add(folder);

with

::

    this._root.add(folder);

Again, run ``./generate.py source`` and reload the application.

**Checkpoint 4:** Your application should contain a 1.2 tree widget.

Congratulations, you have just embedded a qooxdoo 1.2 widget into an 1.2 compat application! ;-)

You can continue replacing widgets one by one until no more ``qx.legacy.*`` classes are used in your application.

