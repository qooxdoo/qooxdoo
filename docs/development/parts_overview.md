Parts and Packages Overview
===========================

> **note**
>
> This is an advanced feature. While it has been put to good use in various applications it requires special care when being deployed.

Motivation
----------

*Packages* are a concept that allows you to partition your application physically. The idea is to spread the entire application over multiple JavaScript files, in order to optimize download and startup behaviour. On page load only the essential first part of the application is loaded (commonly called the *boot* part), while others remain on the server and will only be loaded on demand. As a consequence, the initial code part is smaller, so it's faster to download, consumes less bandwidth and starts up faster in the browser. Other parts are then loaded on demand during the user session. This incurs a bit of latency when the user enters a certain application path for the first time and the corresponding part has to be loaded. On the other side, parts that pertain to a certain application path (e.g. an options dialogue) never have to be downloaded if this application path is not entered during the running session.

Development Model
-----------------

In order to realize this concept, you have the option to specify *parts* of your application, while the build process takes care of mapping these (logical) parts to physical packages that are eventually written to disk. At run time of your application, the initial package will contain loader logic that knows about the other parts.

There are two different but related terms here: You as the developer define **parts** of your application. These are logical or visual related elements, like all elements that make up a complex dialogue, or the contents of an interactive tab pane. The build process then figures out all the dependencies of these parts and collects them into **packages**, which eventually map to physical files on disk. Since some parts might have overlapping dependencies, these are optimized so that they are not included twice in different packages. Also, you might want to specify which parts should be collapsed into as few packages as possible, how small a package might be, and so forth. So you define the logical partitioning of your application and specify some further constraints, and the build process will take care of the rest, producing the best physical split of the entire app under the given constraints.

Loading Parts
-------------

In your application code, you then load the defined parts at suitable situations, e.g. when the user opens a dialogue defined as a part, using qooxdoo's [PartLoader](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.io.PartLoader) API. The PartLoader keeps track of which parts have already been loaded, and provides some further housekeeping. But it is your responsibility to "draw in" a given part at the right moment.

Consequently, the configuration of your application allows you to specify those logical parts of your application, by giving a suitable name to each and listing the top-level classes or class patterns for each. You are using these part names with the PartLoader in your application code. Further config keys allow you tailor more specifics, as mentioned above. See the packages key \<pages/tool/generator/generator\_config\_ref\#packages\> reference section for the config key nitty-gritty.
