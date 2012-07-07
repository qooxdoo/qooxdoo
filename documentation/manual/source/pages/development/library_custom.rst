Custom Libraries
****************

Once your application has grown beyond a certain size, or when you start a second application that could re-use some of the code of the first, you start thinking about factoring code out into separately manageable units. This is where custom libraries come into play.

In qooxdoo, all application files are organized in what we call "libraries". This affects source code, but also other resources like images, media files with sound or video, or static HTML pages. In this sense, the framework class library and its resources is nothing more than a library. But also your application is in that sense a library. (The fact that it has a "main" class which can be run as an application doesn't matter here). Hence there is this little saying in qooxdoo that *"everything is a library"*.

What constitutes a library is just its :doc:`Manifest.json </pages/tool/manifest>`, which provides the main meta-data, and a *source* path with corresponding subdirectories that holds the class code and resources. That's it, and this is exactly what most application :doc:`skeletons </pages/development/skeletons>` like "desktop" or "server" create. So once you've run *create-application.py* the result can immediately be used as a library.

Creating a Custom Library
=========================

Just run :doc:`create-application.py </pages/tool/create_application>`. The default application type ("desktop") is good enough for this purpose. If you have existing code that you want to put into the library, just move the files over to their new location under the *source/class/<namespace>* path. Don't forget to adapt the class name as given in the call to e.g. *qx.Class.define*. The name passed in this call has to match the path suffix of the class file, like *"<namespace>.Foo"*.

If you don't plan to develop a small demo application along with the library classes, you could put away with the *Application.js* file that is part of every skeleton by default. But you could just as well keep this file, as it allows you to build an application in your library directly (also see further).

Using the Library
=================

In an existing application, to use your new library you have to do two things.

Make it known to the Generator
-------------------------------

You need to make the new library known to the existing application so it knows where to look for resources. In principle this means that every job that evaluates libraries (like *source*, *build*, etc.) needs to be informed about it through the :ref:`library <pages/tool/generator_config_ref#library>` configuration key.

To make it easier for you, so you don't have to add the new library to each and every job individually, there is the *libraries* job. If you override this one, all standard jobs that use the *library* key will automatically inherit it::

  "libraries" : [
    {
      "manifest": "path/to/new/library/Manifest.json"
    }
  ]

It suffices that you enter the new library, since other default libraries will be added automatically.

Use it in your Code
-------------------

Now all you have to do is just to reference resources from the new library, e.g. a library class, in your code::

  var c = new mylib.Foo();

"Building" the library itself
------------------------------

This was what you have to do to use the library in *another* application. But there is nothing to stop you from creating a little demo application in the library as well. This is quite useful as it helps you to develop your library API further without the need to test it in other (potentially complex) applications which include it. Just keep the default *Application.js* class around and use it to instantiate and exercise classes from the library. You don't have to change anything in the library's *config.json*, as the "local" library is always included.

Without the main *Application.js* there is not much sense in running the application-generating build jobs of the tool chain in the library directly, like "source" or "build". You can still run other jobs that do not create an application from your code, like "api", "test" or "lint".


Sharing a Namespace
===================

You can share a common namespace prefix across libraries. This is especially interesting if you split up a large application into multiple libraries that can be developed independently. But it is important that every library has its own, individual namespace.

Let's illustrate that with an example. Imagine you have been developing your application to quite some size. You have already organized the classes in subdirectories of the namespace root, e.g. like this

.. code-block:: text

  source/class/myapp
                 /model
                   Foo.js
                 /view
                   Bar.js
                 Application.js

Now you want to factor out the *model* and *view* components into their own libraries. In a suitable path you create two new skeletons:

.. code-block:: bash

   $ create-application.py -n my_model -s myapp.model
   $ create-application.py -n my_view  -s myapp.view

Now you can move *Foo.js* to the first library, into the *source/class/myapp/model/* path, and *Bar.js* to the second, into the *source/class/myapp/view/* path. So together with you initial application you now have three libraries, with namespaces *myapp*, *myapp.model* and *myapp.view*, respectively. They are all distinct, but share the common prefix *myapp*.

Mind that in the original situation *Foo*'s class id was *myapp.model.Foo*. This hasn't changed! The class id is the same in the new library, so you don't have to edit the class itself (it's call to *qx.Class.define*), nor do you have to adapt any location referencing *Foo* in other code (like in *"var c = new myapp.model.Foo();"*). But strictly speaking the class was formerly allocated in a namespace *myapp* with a path of *model/Foo.js*, while now it is allocated in a namespace *myapp.model* with a path of *Foo.js*. 
