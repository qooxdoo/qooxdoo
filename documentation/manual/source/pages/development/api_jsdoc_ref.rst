JSDoc Reference
*************************

The declarative language used in JSDoc-like comments in %{qooxdoo} has grown including specific extensions, maybe in some cases deviating from the `official implementation <http://code.google.com/p/jsdoc-toolkit/>`_, so it makes sense to summarize the supported constructs.

.. _pages/api_jsdoc_ref#the_structure_of_a_documentation_comment:

Overall JSDoc Structure
========================================

A doc comment appears right before the structure (class, property, method or constant) it describes. It begins with ``/**`` and ends with ``*/``. The rows in between start with a ``*`` followed by the text of the particular row. Within this frame there is a description text at the beginning. Afterwards attributes may follow, describing more aspects.

Description texts may also include HTML tags for a better structuring.

An example:

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



.. _pages/api_jsdoc_ref#inline_markup:

Inline Markup
=============

Running text can be formatted using inline markup which uses special characters around the target text:

* \*strong\* (will render as **strong**)
* \_\_emphasis\_\_  (will render as *emphasis*)

There is no escape character, so in order to e.g. enter a literal "*@*" into the text, use the HTML entity equivalent ("*&#64;*" in this case).

HTML
-----

There is limited support for HTML markup. You should be able to use all of the character-level tags, like ``<a>`` or ``<code>``, as well as paragraph-level tags like ``<p>`` or ``<ul>``. ``<pre>`` is particularly suited for code snippets, as it allows you to add syntax highlighting for %{JS} with ``<pre class="javascript">``.

.. _pages/api_jsdoc_ref#supported_attributes:

Supported sections
====================

A JSDoc comment consists of different sections, where a section is either a leading text, the description, or an entry starting with an ``@`` attribute. Here is a complete list of the supported sections.

.. _pages/api_jsdoc_ref#description:

.. rst-class:: api-ref

Description
------------

**Description**

  General description of the item the JSDoc comment refers to. 

**Syntax**

  Free text, without any leading ``@`` attribute, containing HTML and/or markup, and some ``@`` attributes that may be embedded in text (see further). If given must be the first section in the doc comment.

.. _pages/api_jsdoc_ref#param:

.. rst-class:: api-ref

@param
-------------------------------------------

**Scope**

  functions

**Description**

  Describes a parameter. ``@param`` is followed by the name of the parameter. Following that is the type in curly brackets (Example: ``{Integer}``), followed by the description text.

**Syntax**

  ``@param <name> { <type> } <description>``

**Parameters**

    .. list-table::
      :stub-columns: 1
      :widths: 30 70

      * -  name
        -  Name of formal parameter to function
      * - type
        - Type of parameter. When the parameter is optional, the curly brackets include the default value in addition to the type. The default value implies the value that has to be passed in, in order to get the same effect as when omitting the parameter. Example: ``{Boolean ? true}``. You can also define multiple possible types. Example: ``{Boolean | Integer ? 0}``
      * - description
        - Descriptive text of the parameter
  


.. _pages/api_jsdoc_ref#return:

.. rst-class:: api-ref

@return
---------------------------

**Scope**

  functions

**Description**

  Describes the return value.

**Syntax**

  ``@return { <type> } <description>``

**Parameters**

    .. list-table::
      :stub-columns: 1
      :widths: 30 70

      * - type
        - The type of the return value.
      * - description
        - Descriptive text

**Example**

  ::

    @return {Integer} The sum of the arguments



.. _pages/api_jsdoc_ref#throws:

.. rst-class:: api-ref

@throws
--------------------------------------------

**Scope**

  Functions

**Description**

  Describes in which cases an exception is thrown.

**Syntax**

  ``@throws { <type> } <description>``

**Parameters**

  .. list-table::
    :stub-columns: 1
    :widths: 30 70

    * - type
      - The type of the exception [Not Implemented!]
    * - description
      - Descriptive text under which circumstances this exception is thrown.

**Example**

  ::

    @throws {Error} If the parameter 'X' is out of range.

.. _pages/api_jsdoc_ref#see:

.. rst-class:: api-ref

@see
-----

**Description**

  Adds a cross reference to another structure (class, property, method or constant).
  
**Syntax**

  ``@see <class_item> [<description>]``

**Parameters**

  .. list-table::
     :stub-columns: 1
     :widths: 30 70

     * - class_item
       - A class item is either a class name, or a class name followed by a ``#``, followed by the name of a class attribute like property, method or constant. If you refer to a structure within the same class, then the class name may be omitted. If you refer to a class in the same package, then the package name before the class may be omitted. In all other cases you have to specify the fully qualified class name (e.g. ``qx.ui.table.Table``). Some examples:

         * ``qx.ui.form.Button`` refers to the class ``Button`` in the package ``qx.ui.form``.
         * ``qx.constant.Type#NUMBER`` links to the constant ``NUMBER`` of the class ``qx.constant.Type``.
         * ``qx.core.Init#defineMain`` refers to the method ``defineMain`` in the class ``qx.core.Init``
     * - description
       - An optional display text for the link. If missing ``<class_item>`` is shown.

.. _pages/api_jsdoc_ref#link:

.. rst-class:: api-ref

@link
------

**Scope**

  Embedded in descriptive text, `Description`_.

The ``@link`` attribute is similar to the ``@see`` attribute, but it is used for linking to other structures within description texts. Unlike the other attributes, the ``@link`` attribute is not standalone, but in curly brackets and within the main description text or a description text of another attribute.

.. _pages/api_jsdoc_ref#signature:

.. rst-class:: api-ref

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

.. _pages/api_jsdoc_ref#lint:

.. rst-class:: api-ref

@lint
-------------------------------------------

**Description**

  Taylor warning messages for the source code. This attribute is evaluated at compile time, and influences the warnings issued by the generator. It has no relevance for the API documentation of the code.
  The general idea is to switch off warnings for certain situations in the code, mostly related to the identifiers used.

  Within one JSDoc comment, the same subkey can appear multiple times.

**Syntax**

  ``@lint <subkey> ( <name> ,... )``

**Parameters**

    .. list-table::
      :stub-columns: 1
      :widths: 30 70

      * - subkey
        - The following subkeys are supported:

          .. list-table::
             :stub-columns: 1
             :widths: 30 70

             * - ignoreUnused
               - Scoped variables (parameters or declared with ``var``) which are never used.
             * - ignoreDeprecated
               - Use of deprecated globals (like ``alert``).
             * - ignoreUndefined
               - References to global symbols that are not known to the generator (ie. are not in any known library or known built-ins).
             * - ignoreReferenceField
               - A class map member that is initialized with a reference value (object, array, map, ...), as those will be shared among class instances.
      * - name
        - The identifier in the source code which the lint subkey should be applied to.
  

**Example**

  To turn off warnings for a global symbol ``foo`` that is not known to the generator, but will be available at runtime of the code, use

  .. code-block:: javascript

    @lint ignoreUndefined(foo)



.. _pages/api_jsdoc_ref#handling_of_data_types:

Handling of data types
======================

Because JavaScript has no strong typing, the types of the parameters accepted by a method may not be read from the method's definition. For showing the accepted types in the API documentation the data type may be specified in the doc attributes ``@param`` and ``@return``.

The following types are accepted:

* Primitive: ``var``, "void", "undefined"
* Builtin classes: ``Object``, ``Boolean``, ``String``, ``Number``, ``Integer``, ``Float``, ``Double``, ``Regexp``, ``Function``, ``Error``, ``Map``, ``Date`` and ``Element``
* Other classes: Here the full qualified name is specified (e.g. ``qx.ui.core.Widget``). If the referenced class is in the same package as the currently documented class, the plain class name is sufficient (e.g. ``Widget``).

Arrays are specified by appending one or more ``[]`` to the type. E.g.: ``String[]`` or ``Integer[][]``.

