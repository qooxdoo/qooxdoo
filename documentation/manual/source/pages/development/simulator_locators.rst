.. _pages/development/simulator_locators#simulator_locators:

Simulator: Locating elements
****************************

Selenium locators
-----------------

Selenium offers several built-in `locator strategies <http://seleniumhq.org/docs/02_selenium_ide.html#locating-elements>`_.

* `Identifier locators <http://seleniumhq.org/docs/02_selenium_ide.html#locating-by-identifier>`_ are very fast and reliable, but IDs must be assigned manually by the application developer, e.g.:

::

  firstButton.getContainerElement().getDomElement().id = "firstButton";

* `XPath locators <http://seleniumhq.org/docs/02_selenium_ide.html#locating-by-xpath>`_ are not well suited for qooxdoo applications which usually consist of a great number of DOM elements that can take quite a while to traverse, especially when using wildcards. More importantly, the DOM is likely to change during the application's runtime, making XPath locators unreliable.

* The same caveat applies to `DOM locators <http://seleniumhq.org/docs/02_selenium_ide.html#locating-by-dom>`_

qooxdoo-specific locators
-------------------------

These are custom locator strategies designed specifically for qooxdoo applications.

.. _pages/development/simulator_locators#qxh:

qxh Locator: Search the qooxdoo widget hierarchy
================================================

This strategy locates elements within the application's widget hierarchy by following relations between JavaScript objects.
In order to achieve this, it uses a syntax that is very similar to XPath, but also differs in significant ways.

A qxh locator is a sequence of one or more location steps, separated by /. No leading or trailing / is allowed. All searches are anchored to the root object (which is either the Application object or the application root widget, see further down). During the search each location step selects an object which will be used as the root for the rest of the search. The following possibilities exist to specify a location step:

* **<string>** A simple string that cannot be resolved otherwise is taken to be the literal identifier of a JavaScript property of the current object. So a locator step of ``mytoolbar`` will signify a JavaScript property named ``mytoolbar`` on the current object.

::

  qxh=mytoolbar

  
* **qx. ...** A string starting with qx. is taken to be a qooxdoo classname, e.g. qx.ui.basic.Label. It signifies a child which is an instance of the given class.

::

  qxh=qx.ui.form.Button


* **child[N]** Signifies the Nth child of the object returned by the previous step.

::

  qxh=child[3]


* **[@attrib{=value}]** Selects a child that has a property *attrib* which has a value of *value*. The specification of a value is optional. "Property" here covers both qooxdoo as well as generic JavaScript properties.

::

  qxh=[@label=".*Label$"]


As for the values, only string comparisons are possible, but you can specify a RegExp as value as the comparisons will be RegExp matches.

* The special token ***** is a wildcard operator. It covers the semantics of XPath's *//* and *descendant-or-self* constructs. The wildcard can span zero to multiple levels of the object hierarchy. This saves you from always specifying absolute locators, e.g.

::

  qxh=*/[@label="My Button"]

This will recursively search from the first level below the search root for an object with a label property that matches the string “My Button”. As you might expect, these recursive searches take more time than other searches, so it is good advice to be as specific in your locator as possible. To that end, you can use mutliple wildcards in the same locator, like

::

  qxh=*/[@label="Section 3"]/[@page]/*/[@label="First Button"]

This will search recursively from the root for an object with label “Section 3” and then, assuming it is a ButtonView which has a page property, navigate to the corresponding page, where it again searches recursively for an item with label “First Button”. This is much more effective than searching the entire object space with “\*/[@label=“First Button”]”.

* **app:** Three special operators at the beginning of a locator specify which object space you want to search:

  * *app:* signifies the object space down from ``qx.core.Init.getInstance().getApplication()``
  * *inline:* signifies the object space down from the root widget of a "qooxdoo isle" in an inline application. See `this article <http://qooxdoo.org/contrib/project/simulator/qooxdoo-tests-with-selenium#testing_inline_applications>`_ for details.
  * *doc:* (or anything else for that matter, including nothing) signifies the object space down from the application's root widget, i.e. ``qx.core.Init.getApplication().getRoot()``.

As with all Selenium locators, there are no set-valued results (as with generic XPath), and each locator has to come up with at most one result element. Therefore, for each location step, the first match wins, i.e. if there are multiple children that match the current specification, the first child is taken as the root for the rest of the search. Backtracking is only done for wildcard (*) searches.

.. _pages/development/simulator_locators#qxhv:

qxhv Locator: Search visible widgets only
=========================================
The ``qxhv=`` locator works just like ``qxh=``, except that for each step, only qooxdoo widgets with the "visibility" property set to "visible" are considered. This means that no descendants of invisible container widgets will be found. In some cases, this can lead to unexpected results. For example, in many qooxdoo applications, the root folder of a qx.ui.tree.Tree is set to be invisible. In that case, the ``qxhv`` locator would never find the root node's descendants, even though they are visible in the GUI.

.. _pages/development/simulator_locators#qxidv:

qxidv Locator: Search visible widgets using HTML IDs
====================================================
The ``qxidv=`` locator searches for an HTML element with the given ID and looks at the qooxdoo widget it belongs to. Only if the widget is visible is the element returned, otherwise the locator will fail.

.. _pages/development/simulator_locators#qxhybrid:

qxhybrid locator: Combine locator strategies
============================================

The ``qxhybrid=`` locator allows you to combine different locator strategies. It consists of multiple sub-locators separated by double ampersands (&&), each of which is applied to the DOM element returned by the previous locator. The first sub-locator can be of any supported type (qx* or any of Selenium's built-in locator types) while the following steps can be either qx* or XPath locators.

The primary use case for this strategy is testing applications where HTML IDs have been assigned to container widgets but not to child widgets such as e.g. list items (that may be generated during the application's runtime).

An example: Suppose an application contains a list widget (``qx.ui.form.List``) with the HTML ID "options". This is easy to find using Selenium's default ID locator:

::

  options

Now in order to find a list item which has the label text "Foo", the following hybrid locator could be used:

::

  qxhybrid=options&&qxh=[@label=Foo]