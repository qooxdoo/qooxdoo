.. _pages/introduction_sdk#introduction_to_the_sdk:

Introduction to the SDK
***********************

Or *"Everything is a library."*

While the :doc:`Hello World <helloworld>` tutorial is geared towards getting you started with your own project, this page walks you through the basic structure of the qooxdoo SDK itself.

There is a page that gives you an overview of the :doc:`physical structure <framework_structure>` of the SDK. As you can see there the SDK has four main components represented through the subdirectories *application*, *component*, *framework* and *tool*. Three of them, *application*, *component* and *framework* contain (either directly or in further subdirectories) qooxdoo applications or libraries that follow the general scheme for a :doc:`qooxdoo application <application_structure>`. In each you will find a *Manifest.json* file which signifies the adherance to the skeleton scheme. They also all contain a *generate.py* script which offers all or a subset of the standard :doc:`qooxdoo jobs </pages/tool/generator_usage>` that you can run on a library, like *source*, *build*, *test* or *api*.

The fourth component, *tool*, comprises the :doc:`tool chain </pages/tool/generator>` and its various parts. You shouldn't need to worry about that since you interact with the tool chain through the *generate.py* script or one of the tool/bin scripts like *create-application.py*.

In the SDK's root directory there is - besides *readme.txt* and *license.txt* - an *index.html* that gives you an overview over and access to most of the SDK's applications and components. Just be aware (as mentioned on that page) that all of them need a ``generate.py build`` first in their respective directories. Only the Apiviewer for the framework is shipped pre-built with the SDK currently and can be invoked immediately.