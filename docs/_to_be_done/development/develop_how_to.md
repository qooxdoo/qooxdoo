How to Develop a %{qooxdoo} Application
=======================================

How you develop a %{qooxdoo} application largely depends on for which target platform you develop (browser, server, mobile, ...), which in turn is reflected by the %{qooxdoo} component \<getting\_started\> (%{Desktop}, %{Website}, ...) and, to a lesser extend, which skeleton type you are using. Please refer to the particular component documentation for its specifics.

Here are some common traits, though, that you will come across when developing an application with %{qooxdoo}:

Application Layout
------------------

Application code is organized in a particular directory layout which is necessary for the tool chain to work properly. The skeletons help you to adhere to that organisation.

Generate before Run
-------------------

In general you need to invoke %{qooxdoo}'s tool chain, particularly the "Generator", before you can run your application. %{qooxdoo} has a Java-like approach to source code, in that it just "sits around" like a bunch of resources. With the help of its configuration the Generator casts all these resources in a runnable application, e.g. by creating a specific loader that loads all necessary class code.

Source versus Build
-------------------

You will usually develop your application in a so-called *source* mode. In this mode individual files are loaded from their original location on disk. This allows changes to source files become apparent immediately, and allows for better inspection and debugging during runtime. Everything is geared towards supporting development activities. There are various jobs of the Generator that generate a source version of your app (*source*, *source-all*, *source-hybrid*), depending on your preferences between convenience and speed.

Once you are satisfied with your application, you will create a *build* version of it. This version will be compressed and optimized, and will be all geared towards deployment and runtime efficiency. But it will be much less amenable to development.
