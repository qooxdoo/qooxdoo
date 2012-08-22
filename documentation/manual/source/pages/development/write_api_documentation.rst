.. _pages/write_api_documentation#writing_api_documentation:

Writing API Documentation
*************************

For documenting the qooxdoo API special comments in the source code (so-called "doc comments") are used. The doc comments in qooxdoo are similar to `JSDoc comments <http://code.google.com/p/jsdoc-toolkit/>`_ or `Javadoc <http://docs.oracle.com/javase/7/docs/technotes/tools/solaris/javadoc.html>`_ comments. To account for some qooxdoo specific needs there are certain differences to the two systems mentioned above.

.. _pages/write_api_documentation#the_structure_of_a_documentation_comment:

The structure of a documentation comment
========================================

A doc comment appears right before the structure (class, property, method or constant) it describes. It begins with ``/**`` and ends with ``*/``. The rows in between start with a ``*`` followed by the text of the particular row. Within this frame there is a description text at the beginning. Afterwards attributes may follow, describing more aspects.

Description texts may also include HTML tags for a better structuring.

An example:

::

    /**
     * Shows a message to the user.
     *
     * @param text {string} the message to show.
     */
    showMessage : function(text) {
      ...
    }

This comment describes the method ``showMessage``. At the beginning there is a short text, describing the method itself. A ``@param`` attribute follows, describing the parameter ``text``.

The docgenerator recognizes the following structures:

::

    /** Class definitions (resp. constructors). */
    qx.Class.define("mypackage.MyClass",
    {
      extend : blubb.MySuperClass,

      construct : function() {
        ...
      }
    });

    /** Property definitions. */
    properties : 
    {
       "myProperty" :
        {
           check : "Number",
           init : 0
        } 
    },

    /** Method definitions. */
    members :
    {
      myMethod : function(bla, blubb)
      {
        ...
      }
    },

    /** Static method definitions. */
    statics : 
    {
      myStaticMethod : function(bla, blubb)
      {
        ...
      },

      MY_CONSTANT : 100
    },

The class description is taken as the first comment in the file which starts with ``/**``. Therefore if you have a comment at the start of the file which has a first line of ``/**********``, that will be taken as the class description, overriding any comment above the class itself. Therefore use ``/* *********`` or ``/* ==========`` etc.

.. _pages/write_api_documentation#inline_markup:

Inline Markup
=============

Running text can be formatted using inline markup which uses special characters around the target text:

* \*strong\* (will render as **strong**)
* \_\_emphasis\_\_  (will render as *emphasis*)

There is no escape character, so in order to e.g. enter a literal "*@*" into the text, use the HTML entity equivalent ("*&#64;*" in this case).

HTML
-----

There is limited support for HTML markup. You should be able to use all of the character-level tags, like ``<a>`` or ``<code>``, as well as paragraph-level tags like ``<p>`` or ``<ul>``. ``<pre>`` is particularly suited for code snippets, as it allows you to add syntax highlighting for %{JS} with ``<pre class="javascript">``.

.. _pages/write_api_documentation#supported_attributes:

Supported attributes
====================

Within a doc comment the following attributes are supported:

.. _pages/write_api_documentation#param:

@param
-------------------------------------------
*(only for methods and constructors)*

Describes a parameter. ``@param`` is followed by the name of the parameter. Following that is the type in curly brackets (Example: ``{Integer}``), followed by the description text. Types are described more in detail in the next section.

When the parameter is optional, the curly brackets include the default value in addition to the type. The default value implies the value that has to be passed in, in order to get the same effect as when omitting the parameter. Example: ``{Boolean ? true}``

You can also define multiple possible types. Example: ``{Boolean | Integer ? 0}``

.. _pages/write_api_documentation#return:

@return
---------------------------
*(only for methods)*

Describes the return value. After the ``@return`` comes the type in curly brackets followed by the description text.

.. _pages/write_api_documentation#throws:

@throws
--------------------------------------------
*(only for methods and constructors)*

Describes in which cases an exception is thrown.

.. _pages/write_api_documentation#see:

@see
-----

Adds a cross reference to another structure (class, property, method or constant). The text is structured as follows: At first comes the full name of the class to link to. If you want to link to a property, method or constant, then a ``#`` comes, followed by the name of the property, method or constant.

If you refer to a structure within the same class, then the class name may be omitted. If you refer to a class in the same package, then the package name before the class may be omitted. In all other cases you have to specify the fully qualified class name (e.g. ``qx.ui.table.Table``).

Some examples:

* ``qx.ui.form.Button`` refers to the class ``Button`` in the package ``qx.ui.form``.
* ``qx.constant.Type#NUMBER`` links to the constant ``NUMBER`` of the class ``qx.constant.Type``.
* ``qx.core.Init#defineMain`` refers to the method ``defineMain`` in the class ``qx.core.Init``

After this target description an alternative text may follow. If missing the target description is shown.

.. _pages/write_api_documentation#link:

@link
------

The ``@link`` attribute is similar to the ``@see`` attribute, but it is used for linking to other structures within description texts. Unlike the other attributes, the ``@link`` attribute is not standalone, but in curly brackets and within the main description text or a description text of another attribute.

.. _pages/write_api_documentation#signature:

@signature
-----------

Sometimes the API documentation generator is not able to extract the method signature from the source code. This for example is the case when the method is defined using a ``qx.core.Environment`` selection, or if the method is assigned from a method constant like ``qx.lang.Function.returnTrue``.

In these cases the method signature can be declared inside the documentation comment using the ``@signature`` attribute.

Example:

::

    members :
      {
        /**
         * Always returns true
         *
         * @return {Boolean} returns true
         * @signature function()
         */
        sayTrue: qx.lang.Function.returnTrue;
      }

You can also add individual parameter names to the signature, but then need to provide ``@param`` entries for each of them::

    members :
      {
        /**
         * Always returns false, but takes some parameters.
         *
         * @return {Boolean} returns false
         *
         * @signature function(foo, bar, baz)
         * @param foo {String} ...
         * @param bar {Integer} ...
         * @param baz {Map} ...
         */
        sayFalse: function() {
          ...
        }
      }

.. _pages/write_api_documentation#example:

Example
=======

Example for a fully extended doc comment:

::

    /**
    * Handles a drop.
    *
    * @param dragSource {qx.bla.DragSource} the drag source that was dropped.
    * @param targetElement {Element} the target element the drop aims to.
    * @param dropType {Integer ? null} the drop type. This is the same type as used in
    *        {@link qx.bla.DragEvent}.
    * @return {Boolean} whether the event was handled.
    * @throws if the targetElement is no child of this drop target.
    *
    * @see #getDragEvent(dragSource, elem, x, y)
    * @see com.ptvag.webcomponent.ui.dnd.DragEvent
    */
    handleDrop : function(dragSource, targetElement, dropType) {	
      ...
    };


.. _pages/write_api_documentation#handling_of_data_types:

Handling of data types
======================

Because JavaScript has no strong typing, the types of the parameters accepted by a method may not be read from the method's definition. For showing the accepted types in the API documentation the data type may be specified in the doc attributes ``@param`` and ``@return``.

The following types are accepted:

* Primitive: ``var``, "void", "undefined"
* Builtin classes: ``Object``, ``Boolean``, ``String``, ``Number``, ``Integer``, ``Float``, ``Double``, ``Regexp``, ``Function``, ``Error``, ``Map``, ``Date`` and ``Element``
* Other classes: Here the full qualified name is specified (e.g. ``qx.ui.core.Widget``). If the referenced class is in the same package as the currently documented class, the plain class name is sufficient (e.g. ``Widget``).

Arrays are specified by appending one or more ``[]`` to the type. E.g.: ``String[]`` or ``Integer[][]``.

.. _pages/write_api_documentation#__init__.js_files:

__init__.js Files
=================

While using doc comments in class files where they are interleaved with the class code is straight forward, this is not so trivial if you want to provide documentation for a *package*, i.e. a collection of classes under a common name space (like *qx.ui.core*, *qx.util*, etc.).

In order to fill this gap you can add a __init.js__ file to a package. This file should only contain a single doc comment that describes the package as a whole. These files are then scanned during a ``generate.py api`` run and the documentation is inserted at the package nodes of the resulting documentation tree.
