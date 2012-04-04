.. _pages/introduction_sdk#introduction_to_the_sdk:

Introduction to the SDK
***********************

While the :ref:`Hello World <pages/getting_started/helloworld#helloworld>` tutorial shows you how to use it, this page walks you through the basic structure of the %{qooxdoo} SDK itself.

The SDK, when unpacked to your disk, is simply a structure of files and folders under a common root directory. Main ingredients include the %{qooxdoo} class library, sample and helper applications for the browser, and the scripts, modules and data files of the tool chain.

* In the SDK's root directory there is - besides *readme.txt* and *license.txt* - an *index.html* that gives you an overview over and access to most of the SDK's browser-based applications and components. Just be aware (as mentioned on that page) that all of them need a ``generate.py build`` first in their respective directories. Only few like the Apiviewer for the framework are shipped pre-built and can be invoked immediately.

* The :doc:`physical structure <sdk_structure>` of the SDK gives you a high-level view of its files and folders. As you can see there the SDK has four main components represented through the subdirectories *application*, *component*, *framework* and *tool*. Three of them, *application*, *component* and *framework* contain (either directly or in further subdirectories) %{qooxdoo} applications or libraries that follow the general scheme for a :doc:`%{qooxdoo} application <application_structure>`. 

* In each you will find a :ref:`Manifest.json <pages/application_structure/manifest#manifest.json>` file which signifies the adherence to the skeleton scheme. They also all contain a *generate.py* script which offers all or a subset of the standard :doc:`%{qooxdoo} jobs </pages/tool/generator_usage>` that you can run on a library, like *source*, *build*, *test* or *api*.

* The fourth component, *tool*, comprises the tool chain and its various parts. You shouldn't need to worry about those files since you interact with the tool chain through its executable programs, like *generate.py* or *create-application.py*.

