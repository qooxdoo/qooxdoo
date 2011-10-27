.. _pages/generator_config_background#generator_configuration_background_information:

Generator Configuration Background Information
**********************************************

This page gives some background information about how the configuration system is deployed in the SDK. It is interesting if you want to understand some of the inner workings and how things play together. *It is not necessary to know these details if you just want to use the configuration system.*

.. _pages/generator_config_background#cascading_configurations:

Cascading Configurations
========================

The configuration system of qooxdoo is fairly generic and versatile, and it allows you to write stand-alone configuration files from scratch, with just the configuration documentation at hand. But since a lot of configuration options are boilerplate, have to be re-used in various parts of a config, and are applicable to a broad range of applications and libraries, a significant effort has been put into making configuration settings re-usable, and shipping common configuration settings with the SDK. The two major tools in this regard are including one config file from another (through the top-level *include* key), and re-using jobs (through *run* and *extend* keys).

If you create a new application with *create-application.py* you'll find a pre-configured *config.json* in the application directory that is ready to run. When you look into it, you'll find that it provides - besides a handful of macro definitions - only an *include* key to the SDK's central application configuration file, *application.json*.

.. _pages/generator_config_background#application.json_and_base.json:

application.json and base.json
------------------------------

The configuration infrastructure of qooxdoo %{version} is based on two main configuration files, both in the *tool/data/config* folder, *application.json* and *base.json*.

*base.json* defines all the basic jobs that a normal application would want to deploy. Most significant are the *source* and *build* jobs that create the source and build version of an application, respectively. Other jobs contained here are concerned with cleaning up (*clean* and *distclean*), creating translation files (*translate*) or formatting the Javascript code (*pretty*). It is also basic in the sense that it doesn't rely on any other config file.

But there is a distinct class of jobs missing from *base.json*, those that create helper applications for the current project and rely on additional libraries. Currently, this class is represented by the *api* and *test* jobs. 

This is where *application.json* comes into play. *application.json* creates a superset of the jobs from *base.json* by including it, so all of its jobs are available also through *application.json*. The added value of *application.json* is that it also integrates the core configuration files of the *Apiviewer* and the *Testrunner*. These applications export jobs that can be run in the context of other applications, in order to build customized Apiviewer and Testrunner applications, within the respective project.

In order to achieve this, *application.json* tailors those component jobs to e.g. include the classes from the deploying application. All applications including *application.json* in their config get access to all of these jobs.

Why splitting all those jobs into two configuration files? The answer is to disentangle the base jobs from the component jobs. This way the components that provide jobs to *application.json*, and are therefore included with it, can still use *base.json* for their own configuration, without worrying too much about cyclic inclusions. That's it.

Naturally, all these standard jobs are tailored with some sensible defaults. These defaults should be fine for all but a few custom applications. But of course the configuration system has to provide ways to deviate from the standard settings, and without too much repetition. (These different needs of applications are even mirrored in the SDK itself, where some applications are contempt with the default settings like the *Feedreader*, while others need more specific settings, as is the case e.g. with the *Demobrowser*. See their configuration files for more details).

.. _pages/generator_config_background#the_use_of_macros:

The Use of Macros
=================

Within the configuration system, macros (defined with *let* keys) serve a  couple of purposes:

* to keep the use of a specific value consistent within a configuration file (this is how macros are used in many languages)
* to customize settings of imported jobs so they can be controlled by the importing configuration
* to pass parameters into jobs

The last usage is probably the most delicate. Jobs provided by external components or libraries to the deploying application need to learn certain facts about this application, in order to do their job well. As a consequence some components require dedicated macros to be set by the application, e.g the *API_INCLUDE* and *API_EXCLUDE* macros that are required for the *api* job. This is a way of parameterizing jobs. Unfortunately, since every job winds up with a flat set of macros that are available to it (you can think of it as a job having a "global name space" for macros), macros have to be globally unique within the set of configuration files that is used for the particular application.

.. _pages/generator_config_background#application_startup:

Application Startup
===================

While this is not particularly a generator config topic, it has some implications on configuration issues just as well.

An "application" as seen from the qooxdoo point of view is just a set of classes that are run on top of what could be called the qooxdoo runtime system. (In that respect qooxdoo is similar to other object-hosting frameworks, e.g. the `Perl Object Environment (POE) <http://en.wikipedia.org/wiki/Perl_Object_Environment>`_ with the main difference being that POE can host multiple applications and switch between them).

When the application is loaded, qooxdoo first establishes and starts a runtime environment. This comprises of things as divers as defining a handful of global variables and data structures, to setting up its object system, to creating instances of system classes e.g. for logging or event handling.

Once this is established, the qooxdoo runtime starts the *main()* method of the main application class (made known to it through the *qx.application* setting). From there, the application classes  take over and create the application, through instantiating further classes (like IO classes or GUI widgets), setting properties and invoking methods on them.

.. _pages/generator_config_background#config_processing:

Config Processing
=================

This is an account of the principles that rule the processing of config files.

.. _pages/generator_config_background#when_the_config_file_is_read:

When the Config File is Read
----------------------------

* The Json data structure is parsed into an internal data structure; this is standard Json processing.
* If the config file contains a global :ref:`pages/tool/generator_config_ref#let` section these macros are expanded among themselves (for macros referencing other macros) temporarily. This intermediate *let* map is then used for other top-level keys, to expand potential macros and finalize their values. E.g. a global :ref:`include <pages/tool/generator_config_ref#include_top-level>` key might use macros to encode paths to other config files. Then these macros are resolved with the local knowledge to derive real paths. The :ref:`pages/tool/generator_config_ref#jobs` key and the *let* key itself are explicitly not expanded, to allow for later (re-) evaluation in another config file.
* If there is a global *include* key, the listed config files are included (next section).

.. _pages/generator_config_background#when_another_config_file_is_included:

When another Config File is Included
------------------------------------

* The external config file is processes like the original file (previous section); i.e. the initial parsing and including process is applied recursively. The process is checked for cyclic references.
* Then, every job in the *jobs* key of the external config file is processed in the following manner.
* For each external job, a new job for the current config file is created. This is to apply a local *let* section, so it can take preference over the external's job *let* settings. This is done next.
* A potential global *let* section is included into the new job, as if this was a normal *let* key of the job.
* Then, the external job is merged into the new job (see next section).
* A reference to the external config is added to the new job; this way, the original context is retained. This can be important to resolve references to other jobs in the right context.
* For the new job a job name is constructed:
  * If the external config is included without *"as"* parameter, the original name is used. If it is included with *"as"* parameter, its value is prependend to the original name.
  * If no job of the same name already exists in the config, nothing further is done.
  * If, on the other hand, a job of such name already exists, a new, conflict-free name is generated for the new job, and this name is added to the conflicting job's *extend* key, so the existing job will inherit the new job's features.
* Finally, the new job is added to the current config's list of jobs.

.. _pages/generator_config_background#when_jobs_are_merged:

When Jobs are Merged
--------------------

* When two jobs are merged, which happens during *extend* and *run* expansion, and config file inclusion, there is a *source* job, which is merged into the *target* job, so there are distinct roles and a direction of the merging.
* The basic principle is that the target job takes preference over the settings in the source job, like with OO inheritance where child classes can override parent features.
* If a key of the source job is missing in the target job, it is added to the target job.
* If a key of the source job is present in the target job, and has a "=" leading the key name, then the source key is discarded, and is not taken into account for the merging.
* If a key of the source job is present in the target job, and is not protected by the "=" sigil, the following happens:

  * If the key value is a scalar value (string, number, boolean), the target value takes precedence and the source value is discarded.
  * If the key value is a reference value (list or map) then

    * in the case of a list, the elements of the source list are uniquely appended to the target list, i.e. duplicates are omitted in the process.
    * in the case of a map, the merge process is applied recursively.

.. _pages/generator_config_background#the_job_expansion_process:

The Job Expansion Process
-------------------------

* After all include files have been processes, the list of jobs in this config is final. At this stage it can be decided whether the requested jobs (the jobs that are passed as arguments to the generator) are among them and can be run.
* Each job in the list of requested jobs (the "agenda" if you will) is expanded in the following way.
* Then, a potential *run* key has to be processed:
  * For each job in the *run* a new job is created ("synthetic jobs"). This is so they can inherit stuff. The definition of the original job is used - with the *run* key stripped - as the template for all of these jobs, so they have all the original job features.
  * Each job from the original *run* key is then added to the *extend* key of its corresponding synthetic job, so they inherit from their run jobs.
  * The list of synthetic jobs is now added to the agenda in place of the original job that had the *run* key.
* A potential *extend* key has to be processed:
  * For each element in the *extend* key, the corresponding job is searched (see special section below).
  * Each of those jobs are merged into the current one, in the order they appear in the list. This also means that features of each job in the list take precedence over those of jobs that come right to it.
* The last two steps are repeated until no more jobs are on the agenda that have unresolved *extend* or *run* keys.
* Now each job has found its final job definition, and is run by the Generator.

.. _pages/generator_config_background#how_job_references_are_resolved:

How Job References are Resolved
-------------------------------

* *extend* and *run* keys in a job reference other jobs by name. These names have to be resolved to their actual job definitions, in order to complete the expansion of the referencing job.
* When name resolution has to be done, there are two contexts in which the referenced name is looked for:

  * the current config
  * the config in which the job was originally defined; this may be different from the current config, since the job might have been obtained by inclusion of an external configuration file.

* The last point is interesting since a job in the current config might be referencing a job "foo" which might not be present in the current config, e.g. due to filtering this job during import (there are various ways to do this). So the job has to be looked for in one of the external config files. The original config file is chosen since there might be more the one imported config file, and each of those might be defining a "foo" job.

.. _pages/generator_config_background#how_to_add_a_new_component:

How to add a new Component
==========================

qooxdoo comes with a set of helper applications, so called "components", that can be custom-build for any standard application. Examples are the Apiviewer, Testrunner and Inspector. Suppose we had a new such component, how would this be made available as a standard job to skeleton-based applications? This section provides an implementation view to the more end-user oriented introduction :ref:`here <pages/tool/generator_config_articles#include_key_top-level_-_adding_features>`.

.. _pages/generator_config_background#basics:

Basics
------

Usually, you simply want to run a job already defined for the component, such as the *build* job that creates an optimized version of it. But in virtually all cases such a component needs to be passed information about the application that tries to build it. This ranges from simple things like the output path, where a script is stored, over the information which class libraries the application uses (think of the application's test classes for the *Testrunner*),  up to arbitrary modification of job settings (variants, compile options, ...). So, generally speaking, you need to pass some information to, or *parameterize*, the component job. These kinds of modifications are discussed in this section.

The answer to the question how to pass information into a job is generally two-fold:

* **Macros in global let sections**
* **Other Jobs**

Macros in global *let* sections are included automatically into jobs within the current configuration file; they are directly integrated into a job's own *let* key. Jobs themselves can be related to each other, but for this you have to be aware of a general property of jobs in the configuration system:

.. note::

  Within the generator's configuration system, there is only a **single mechanism** how two jobs can pass information between - and thus influence - each other:  **Through Job Extending.**

That means one job has to extend the other, either directly or indirectly (via intermediate "extend" jobs), in order to share information between the jobs.

This also means that the question which job extends which (the *extension order*, if you will) is curcial, as the settings in the extending job always take precedence over those of any extended job. The extending job also has some possibilties to control which keys are being modified by the extended jobs. Within the "extend" list of jobs, those to the left take precedence over those on the right.

.. _pages/generator_config_background#preparing_the_component:

Preparing the component
-----------------------

On that basis we will look at concrete ways to apply this when invoking a component job. The job of the component that is to be run is often referred to as the *"remote job"*, as it is defined remotely to the invoking application, which will be referred to as the *"invoking context"*.

Using the basic principles outlined above, there are **two practical ways** how component jobs can receive information from the invoking context:

* **Macros**
* **Includer Jobs**

In both cases, it is essential that both the invoking environment (custom application) and the providing component agree on the way how information is passed. In clear terms this means, it has to be part of the documentation of the component how it allows its job to be tailored. (This documentation for the existing component jobs of qooxdoo is available from the :doc:`list of default jobs <generator_default_jobs>`).

.. _pages/generator_config_background#parameterizing_a_remote_job_through_macros:

Parameterizing a remote job through Macros
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Macros are a simple way to pass information around. The component job uses a macro in a place that should be parameterized, e.g. a part in a path. 

A typical example is the BUILD_PATH macro. The component job stores its output in a file like this:

::

  "outfile" : "${BUILD_PATH}/job_output.js"

The component will usually provide a sensible default for the macro, e.g.

::

  "BUILD_PATH" : "./script"

The invoking context can now tailor the output path by overriding the BUILD_PATH macro:

::

  "BUILD_PATH" : "my/other/path"

and running the component job with this macro binding will cause the output be written in the alternate directory. Of course you have to make sure the new macro binding is in effect when the component job is being run (see also further down for this). In the simplest case you just put the macro definition in the *global let section* of the application *config.json*. As these let bindings are included in every job of the config, also to the jobs that are imported from other configs, these bindings apply to effectively every job that is accessible through this config. As it is applied very early, the binding in this let section take precedence over bindings of the same macros defined in imported jobs. Thus it is possible to pass the new binding into a job defined in another configuration file.

If you want a more fine-grained control over the scope of a specific macro, you can add a new job definition into your config of the *same name* as the job you want to tweak (but mind any name spacing of names introduced through the *as* key in *include* keys, see further). Through automatic inheritance the remote job will become a parent of the local job. If you give the local job a *let* section with the required macro, this binding will only take effect for the named job (and those extending it), but not for others.

.. _pages/generator_config_background#parameterizing_a_remote_job_through_includer_jobs:

Parameterizing a remote job through Includer Jobs
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

A more powerful but also more complex way to taylor a remote job is through an *includer job*, a job that is included by others to add additional configuration to them. Used to parameterize another job includer jobs are akin to dependency injection in programming languages. 

The component job would *extend* the includer job in its own definition:

::

  "extend" : [ "includer-job" ]

Again, the component would usually provide an *includer-job* of its own, with sensible defaults.

The invoking context can then tailor the remote job by tailoring the includer job:

::

  "includer-job" :
      {
         "library" : { ... },
         "environment" : { ... },
         "compile-options" : { ... },
         ...
      }

Supplying a job with the name of the includer job will make the component's worker job use this definition for its own extend list (through *job shadowing*). As with macros, the invoking application and the component have to agree about the name of the includer job. After that, you can essentially pass all kinds of job keys into the remote job. There is virtually no limit, but usually you will only want to set a few significant keys (Again, this is part of the protocol between application and component and should be stated clearly in the component's documentation). You should also bear in mind the general rules fo job extending, particularly that the main job's settings (the component job in our case) will take precedence over the settings of the includer job, and that the main job can choose to block certain keys from being modified by included jobs.

.. _pages/generator_config_background#adding_a_new_job:

Adding a new job
----------------

So how would you typically use these mechanisms to a new default job for qooxdoo that will build the new component in a custom application? Here is a list of the steps:

* Split the component's *config.json* into two.This is usually helpful to keep config settings for the component that are just necessary to develop the component itself, from the definitions that are interesing to other applications that want to run the "exported" job(s) of that component. See e.g. the *Testrunner* application, where the configuration is split between the local *config.json* and the includeable *testrunner.json*.
* Include the export config of the component in *application.json*. This will usually be done with a dedicated name space prefix, like ::

    {
      "path" : "path/to/component/component.json",
      "as"   : "comp"   // something meaningful
    }

* Create a new job in *application.json*.Choose a name as you would want it to appear to the end user when he invokes ``generate.py x``. Optionally, add a descriptive *"desc"* key that will appear next to the job's name in the listing.
* Make this job extend the component's job you want to make available, e.g. like ::

  "extend" : [ "comp::build" ] // "build" is the job you want in most cases 

* Add further keys, like a *let* section with macros you want to override, or other job keys.
* If the component's job honors an includer job, define such a job in *application.json*. You will usually also need to prefix it with the component's "as" prefix you used above::

    "comp::<includer job name>" : { <includer job keys>... } 

  The component's worker job will automatically include your includer job.
* Add the job to the *export* list in the skeletons that should support it.The skeletons' *config.json* usually contain an *export* key, to filter the list of jobs a user will see with *generate.py x* down to the interesting jobs. Adding the new job name will make sure the users sees it.

