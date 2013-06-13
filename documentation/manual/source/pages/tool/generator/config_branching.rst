Branching in Configuration Files
================================

In general there is no way of conditional branching in the
:doc:`configuration DSL </pages/tool/generator/generator_config>`
of the tool chain. qooxdoo configuration files are JSON-based and have
no *"if"* construct of any kind. So there is no way of directly
expressing e.g. *"If the value of this macro is true include this list
of classes, otherwise include a different list"*. But you can achieve
much of the same by using the values of macros in references to other job
names. Here is how to do that.

Includer Jobs
-------------

In qooxdoo configurations the general way to inject settings into a job
is by using the
`extend <http://manual.qooxdoo.org/2.1.x/pages/tool/generator/generator_config_ref.html#extend>`_
key. So if you want settings from one job to propagate into another job
you make the second job extend the first:
::

    "jobA" : {
      "environment" : { "foo" : "bar" }
    },

    "jobB" : {
      "extend" : [ "jobA" ],
      ... // more job settings
    }

So now *jobB* will get the environment setting from *jobA* as if you had
written them into *jobB* directly (There is some conflict resolution going
on if *jobB* already has an *environment* key). This of course makes more
sense if you want to have more than one job inherit these settings, like
when you substitute "jobB" with "source" and "build". It's a common way
in qooxdoo configs to maintain multiply used settings in a single place.
As in this example the job names in the *extend* key can refer to jobs
that do nothing on their own and are just provided to hold some setting
to be used in other jobs (often referred to as :doc:`"includer jobs"
</pages/tool/generator/default_jobs_includers>` ).

Using Macros in Job Names
-------------------------

What's also interesting here is that the names in the *extend* key can
contain macros. This allows you to select a job according to the value
of some macro.  ::

    "jobA1" : {
      "environment" : { "foo" : "bar" }
    },

    "jobA2" : {
       "environment" : { "foo" : "xyz" }
    },

    "jobB" : {
      "extend" : [ "job${JobSuffix}" ]
      ...
    }

By setting the value of the *JobSuffix* macro to either "A1" or "A2" you
now select which job is being included into the extending job, and by
that select the configuration keys and values that come with it. In this
example you could either specify the concrete value of *JobSuffix* in
the global "let" section of the configuration file ::

    "let" : {
      "JobSuffix" : "A1"     // or "A2"
    }

or you could provide it on the command line when invoking the generator::

    generate.py -m JobSuffix:A2 ...

Pairs of Includers
------------------

Often you will create pairs of includer jobs like in the above example
for the same set of settings, to provide alternative values. To pick up
the example from the beginning, to provide two different include lists
to a source job you could write::

    "oneInclude" : {
      "=include" : [ "foo.ClassA", "foo.theme.ThemeA" ]
    },

    "otherInclude" : {
      "=include" : [ "foo.ClassB", "foo.theme.ThemeB" ]

    "source" : {
      "extend" : [ "${IncJob}Include" ]
    }

(Don't worry about the equal sign in ``"=include"`` for the moment). Now
you only have to provide the value for the *IncJob* macro, either
``"one"`` or ``"other"``, and your *source* job will use the
corresponding include lists. This basically is it, you can now construct
different jobs by just assigning different values to macros. Mind that
this kind of selecting includer jobs will only work with values of
macros, and only if those values are strings. This also means you cannot
e.g. refer to the value of a specific *environment* setting. But in many
cases you can work the other way round and make the value of an
environment setting part of an includer job which is then selected by
the value of a macro.
