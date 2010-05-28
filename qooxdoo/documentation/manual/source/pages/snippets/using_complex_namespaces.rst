.. _pages/snippets/using_complex_namespaces#using_complex_name_spaces:

Using Complex Name Spaces
*************************

.. _pages/snippets/using_complex_namespaces#overview:

Overview
========

Originally, a qooxdoo application or library had a simple name space, like ``feedreader`` or ``qx``. The classes of a name space would be organized in packages under its root, with arbitrary deep nesting, so you got well-known package names like ``feedreader.view`` or ``qx.ui.core.queue``.

But increasingly, people are using complex name spaces in their qooxdoo projects. This could be because they are following a certain Java-like naming convention in their environment like ``org.myorg.webclient.util``, or maybe they want to break up a larger body of code into multiple libraries, but retain a common root name like ``webclient.pro.util``, ``webclient.pro.ui`` asf.

So expanding on this notion of name spaces and packages, you can have a complex name space as the root for packages under this name space. But this only plays a role when creating the initial structure of applications and managing them in the build process. On the class level, you will not be able to see where the name space ends and the package identifiers start. Also, the directory path leading to a class will reflect this, so you will have a class

::

    qx.Class.define("org.myorg.webclient.util.ClassA", {...})

living in a path like

::

    .../source/class/org/myorg/webclient/util/ClassA.js

The only noticealbe difference on this level to applications with simple name spaces is only the sequence of quasi "empty" directories (apart from subdirectories) leading up to the level where the actual class files start.

.. _pages/snippets/using_complex_namespaces#showcase:

Showcase
========

Here is a simple walk-through through a showcase, where two applications with complex name spaces are being set up, and one is used as a library by the other.

.. _pages/snippets/using_complex_namespaces#create_two_new_apps_with_complex_name_spaces:

Create two new apps with complex name spaces
--------------------------------------------

::

    thron7@pcthron7> create-application.py -n jbb1 -s a.b.c
     >>> Copy skeleton into the output directory: ./jbb1
     >>> Patching file './jbb1/generate.py'
     >>> Patching file './jbb1/config.json'
     >>> Patching file './jbb1/Manifest.json'
     >>> Patching file './jbb1/source/index.html'
     >>> Patching file './jbb1/source/class/a/b/c/Application.js'
     >>> Patching file './jbb1/source/class/a/b/c/test/DemoTest.js'
     >>> Patching file './jbb1/source/class/a/b/c/theme/Color.js'
     >>> Patching file './jbb1/source/class/a/b/c/theme/Decoration.js'
     >>> Patching file './jbb1/source/class/a/b/c/theme/Theme.js'
     >>> Patching file './jbb1/source/class/a/b/c/theme/Font.js'
     >>> Patching file './jbb1/source/class/a/b/c/theme/Appearance.js'
     >>> DONE

    thron7@pcthron7> create-application.py -n jbb2 -s d.e.f
     >>> Copy skeleton into the output directory: ./jbb2
     >>> Patching file './jbb2/generate.py'
     >>> Patching file './jbb2/config.json'
     >>> Patching file './jbb2/Manifest.json'
     >>> Patching file './jbb2/source/index.html'
     >>> Patching file './jbb2/source/class/d/e/f/Application.js'
     >>> Patching file './jbb2/source/class/d/e/f/test/DemoTest.js'
     >>> Patching file './jbb2/source/class/d/e/f/theme/Color.js'
     >>> Patching file './jbb2/source/class/d/e/f/theme/Decoration.js'
     >>> Patching file './jbb2/source/class/d/e/f/theme/Theme.js'
     >>> Patching file './jbb2/source/class/d/e/f/theme/Font.js'
     >>> Patching file './jbb2/source/class/d/e/f/theme/Appearance.js'
     >>> DONE

.. _pages/snippets/using_complex_namespaces#add_a_lib_class_to_jbb2:

Add a lib class to jbb2
--------------------------------------------

::

    thron7@pcthron7> cat > jbb2/source/class/d/e/f/ClassA.js
    qx.Class.define("d.e.f.ClassA", {});
    ^D

.. _pages/snippets/using_complex_namespaces#edit_jbb1/config.json_to_use_the_jbb2_lib_in_jbb1:

Edit jbb1/config.json to use the jbb2 lib in jbb1
-------------------------------------------------

::

    {
      "name"    : "jbb1",

      "include" :
      [
        {
          "path" : "${QOOXDOO_PATH}/tool/data/config/application.json"
        }
      ],

      "let" :
      {
        "APPLICATION"  : "a.b.c",
        "QOOXDOO_PATH" : "../../../qooxdoo.trunk",
        "QXTHEME"      : "a.b.c.theme.Theme",
        "API_EXCLUDE"  : ["qx.legacy.*","qx.test.*"],
        "LOCALES"      : [ "en" ],
        "CACHE"        : "${TMPDIR}/cache",
        "ROOT"         : "."
      },

      "jobs" :
      {
        "libraries" :
        {
          "library" :
          [
            {
              "manifest" : "../jbb2/Manifest.json"
            }
          ]
        }
      }
    }

.. _pages/snippets/using_complex_namespaces#modify_jbb1s_application.js,_to_use_the_classa_from_jbb2:

Modify jbb1's Application.js, to use the ClassA from jbb2
------------------------------------------------------------

::

    qx.Class.define("a.b.c.Application",
    {
      extend : qx.application.Standalone,

      ...

          // Add an event listener
          button1.addListener("execute", function(e) {
            alert("Hello World!");
          });

          var obj = new d.e.f.ClassA();
        }
      }
    });

.. _pages/snippets/using_complex_namespaces#run_the_generator_in_jbb1:

Run the generator in jbb1
------------------------------------------------------------

::

    thron7@pcthron7> cd jbb1; ./generate.py source

    ============================================================================
        INITIALIZING: JBB1
    ============================================================================
     >>> Configuration: config.json
     >>> Jobs: source
     >>> Resolving config includes...
      - ! Shadowing job "libraries" with local one
     >>> Resolving jobs...
     >>> Incorporating job defaults...
     >>> Resolving macros...
     >>> Resolving libs/manifests...

    ============================================================================
        EXECUTING: SOURCE::SOURCE-SCRIPT
    ============================================================================
     >>> Scanning libraries...
      - Scanning /home/thron7/workspace/packages/test/jbb2...
      - Scanning /home/thron7/workspace/packages/test/jbb1...
     >>> Resolving dependencies...
      - Sorting 186 classes...
     >>> Resolving dependencies...
      - Sorting 186 classes...
     >>> Generate source version...
      - Processing translation for 2 locales...
      - Analysing assets...
        - Compiling resource list...
      - Generating boot loader...
     >>> Done

That's it :-) .

