Adding Dependency Information Manually
*****************************************

When the automatic dependency analysis misses dependencies, e.g. because a
method is instantiating a class that has been passed in as a formal parameter,
or you are calling a method on one class that is attached to it from another
class dynamically, you need to inform the Generator about these dependencies
explicitly. There are different ways to achieve that.

In the class file
==================

You can declare dependencies at the top of the class file using the :ref:`require <pages/code_structure#details>` and
:ref:`use <pages/code_structure#details>` compiler hints. They are embedded in specific comments and don't interfere
with normal %{JS} syntax. For example

::

  /**
   * @require(qx.module.Animation)
   * @use(qx.module.Cookie)
   */

Mind the difference between ``require`` and ``use``. ``use`` should be preferred
as it only says that the required class has to be available "eventually" at
runtime. ``require`` imposes a stronger constraint as it demands that the
required class is loaded *ahead* of the current class, and should only be used
when the required class is used at load-time of the current class (e.g. in the
*defer* method).

In the configuration
=====================

You can specify dependencies in the configuration of the jobs that create your
application. The corresponding configuration keys are (not surprisingly)
:ref:`pages/tool/generator/generator_config_ref#require` and
:ref:`pages/tool/generator/generator_config_ref#use`. Here is an example::

  "source-script" :
  {
    "require" : 
    {
      "myapp.ClassA" : ["qx.module.Animation"]
    },
    "use" :
    {
      "myapp.ClassA" : ["qx.module.Cookie"]
    }
  }

Remember that source and build jobs are independent from each other so you
usually want to add this configuration also to the ``build-script`` job to have
the dependencies available in both build types.

Passing dependency information via configuration is interesting when you don't
want to hard-wire this information into the class file. E.g. if you are building
variants of your application where you want to inject variant-specific classes as
dependencies, the configuration method is preferable.
