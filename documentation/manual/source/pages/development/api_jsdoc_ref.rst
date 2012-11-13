JSDoc Reference
*************************

The declarative language used in JSDoc-like comments in %{qooxdoo} has grown including specific extensions, maybe in some cases deviating from the `official implementation <http://code.google.com/p/jsdoc-toolkit/>`_, so it makes sense to summarize the supported constructs.

.. _pages/development/api_jsdoc_ref#the_structure_of_a_documentation_comment:

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
    * @param dropType {Integer ? null} the drop type. This is the same type
    *        as used in {@link qx.bla.DragEvent}.
    * @return {Boolean} whether the event was handled.
    * @throws if the targetElement is no child of this drop target.
    *
    * @see #getDragEvent(dragSource, elem, x, y)
    * @see com.ptvag.webcomponent.ui.dnd.DragEvent
    */
    handleDrop : function(dragSource, targetElement, dropType) {	
      ...
    };



.. _pages/development/api_jsdoc_ref#inline_markup:

Inline Markup
=============

Running text can be formatted using inline markup which uses special characters around the target text:

* \*strong\* (will render as **strong**)
* \_\_emphasis\_\_  (will render as *emphasis*)

There is no escape character, so in order to e.g. enter a literal "*@*" into the text, use the HTML entity equivalent ("*&#64;*" in this case).

HTML
-----

There is limited support for HTML markup. You should be able to use all of the character-level tags, like ``<a>`` or ``<code>``, as well as paragraph-level tags like ``<p>`` or ``<ul>``. ``<pre>`` is particularly suited for code snippets, as it allows you to add syntax highlighting for %{JS} with ``<pre class="javascript">``.

.. _pages/development/api_jsdoc_ref#handling_of_data_types:

Handling of Data Types
======================

Because JavaScript has no strong typing, the types of the parameters accepted by a method may not be read from the method's definition. For showing the accepted types in the API documentation the data type may be specified in the doc attributes ``@param`` and ``@return``.

The following type indicators are accepted:

.. list-table::
  :stub-columns: 1
  :widths: 30 70

  * - Primitive
    - ``var``, ``void``, ``undefined``
  * - Builtin classes
    - ``Object``, ``Boolean``, ``String``, ``Number``, ``Integer``, ``Float``, ``Double``, ``Regexp``, ``Function``, ``Error``, ``Map``, ``Date``, ``Element``
  * - Other classes
    - Here the full qualified name is specified (e.g. ``qx.ui.core.Widget``). If the referenced class is in the same package as the currently documented class, the plain class name is sufficient (e.g. ``Widget``).
  * - Lists
    - Homogenous lists are indicated by adding one or more ``[]`` to the type, e.g. ``String[]``, ``Integer[][]``.


.. _pages/development/api_jsdoc_ref#types_syntax:

Syntax of a Type Specification
--------------------------------

Here is the full syntax for a type specification as used in concrete doc attributes::

  `{` [ Type1 `|` Type2 `|` ... [ `?` [<default_value]]  ] `}`

That is, between curly braces an optional list of type indicators (as described above), separated by ``|``, following an optional ``?`` to indicate the entire parameter is optional, followed by an optional default value (the last two for ``@param`` attributes).

For a parameter description the meaning is: The expected parameter can be of Type1 or Type2 or ..., is optional, i.e. can be left out, and will default to *<default_value>*.

**Example**

  ::
  
    {String|Integer ? null}


.. _pages/development/api_jsdoc_ref#symbol_matching:

Matching of Variable Names
===========================

Several of the JSDoc keys take some sort of symbol names as parameters, e.g. the ``foo`` in ``@ignore(foo)``, which are then matched against names found in the code. These parameters include names of global variables, built-in functions, formal arguments, namespaces, and the like. It is important that you are aware of the semantics of those parameters, i.e. the way they are used to establish a match with a name actually found in the code.

* **Exact Match**

  Some keys restrict themselves to exact matches, e.g. the ``alert`` in ``@lint ignoreDeprecated(alert)`` will only match the global symbol ``alert`` in the code, neither ``aler`` nor ``alerty`` nor ``alert.foo``.

  The next two match types include exact match, but also allow other kinds of matches.
* **Prefix Match**

  Some keys regard the name from the code as a prefix of the parameter. This is usually restricted to object boundaries (not just simple string prefixes), so a name of ``foo`` in the code will match a parameter of ``foo.bar``, but not ``foozy.bar``.
  A good example is ``@ignore(foo)``. If you want to ignore the name ``foo`` in your code, it probably makes sense to ignore names nested on ``foo`` as well, like ``foo.bar``, so this key effectively uses prefix matching.
* **Extension Match**

  Some keys regard the parameter as a prefix of the name from the code, again usually restricting it to object boundaries. In that case, a name ``foo.bar`` will match a parameter of ``foo``, while the name ``foozy`` will not.
* **Wildcard Match**

  Some keys need an explicit, glob-style wildcard at the end to support extension matches. In that case you need to provide a hint like ``@somehint somekey(foo.*)``, in order to match a name of ``foo.bar`` from the code with this key. Again, a match has to honor object boundaries. (Mind that in the case of a parameter like ``foo.*``, simply ``foo`` with **not** match; the dot is part of the pattern and has to be present in order for the match to succeed).

The individual keys should make it clear which of those match semantics they use when checking actual code names. Many keys will allow not only one parameter, but a list of parameters. Matching is then applied to each parameter in turn, and if one matches, the key applies.



.. _pages/development/api_jsdoc_ref#supported_attributes:

Section Reference
====================

A JSDoc comment consists of different sections, where a section is either a leading text, the description, or an entry starting with an ``@`` attribute. Here is a complete list of the supported sections.

.. .. contents:: **Overview**
   :local:

**Overview**

.. list-table::
   :widths: 60 40

   * - API Documentation
     - * `Description`_ 
       * `@abstract`_
       * `@childControl`_
       * `@deprecated`_
       * `@internal`_
       * `@link`_
       * `@param`_ 
       * `@return`_ 
       * `@see`_ 
       * `@signature`_
       * `@throws`_
       * `@type`_
   * - Lint Checking
     - * `@lint`_
   * - Compiler
     - * `@attach`_
       * `@attachStatic`_
       * `@ignore`_
       * `@require`_
       * `@use`_
   * - Extra
     - * `@tag`_


.. _pages/development/api_jsdoc_ref#description:

.. rst-class:: api-ref

Description
------------

**Description**

  General description of the item the JSDoc comment refers to. 

**Syntax**

  Free text, without any leading ``@`` attribute, containing HTML and/or markup, and some ``@`` attributes that may be embedded in text (see further). If given must be the first section in the doc comment.

.. _pages/development/api_jsdoc_ref#abstract:

.. rst-class:: api-ref

@abstract
-------------------------------------------

**Scope**

  methods

**Description**

  Used to signify abstract methods in regular classes.

**Syntax**

  ``@abstract``


.. _pages/development/api_jsdoc_ref#childControl:

.. rst-class:: api-ref

@childControl
-------------------------------------------

**Scope**

  class

**Description**

  In a class description of a widget that is composed of various sub-widgets the ``@childControl`` entry informs about those sub-widgets. This is relevant for users that want to apply a :ref:`custom theme <pages/desktop/ui_appearance#appearance>` to the widget (the name is the default appearance ID), or implement :ref:`own widgets <pages/desktop/ui_develop#child_controls>` that derive from this.

**Syntax**

  ``@childControl <name> { <type> } <description>``

**Parameters**

    .. list-table::
      :stub-columns: 1
      :widths: 30 70

      * - name
        - An identifying name for the child control
      * - type
        - The :ref:`type specification <pages/development/api_jsdoc_ref#types_syntax>` of the child control widget
      * - description
        - What the child control is used for in the context of this widget
  
**Example**

  ::

    @childControl title {qx.ui.basic.Label} caption of the window



.. _pages/development/api_jsdoc_ref#param:

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
        - A :ref:`type specification <pages/development/api_jsdoc_ref#types_syntax>` like ``{Boolean | Integer ? 0}``
      * - description
        - Descriptive text of the parameter
  
**Example**

  ::

    @param foo {Integer} The main factor



.. _pages/development/api_jsdoc_ref#type:

.. rst-class:: api-ref

@type
---------------------------

**Scope**

  Data

**Description**

  ``@type`` is usually used to document data items, esp. when the type is not immediately apparent in the code. This is for example the case when a class member is initialized with ``null`` and a map value is assigned in the constructor, so as to not share a single map accross multiple instances.

**Syntax**

  ``@type { <type> }``

**Parameters**

    .. list-table::
      :stub-columns: 1
      :widths: 30 70

      * - type
        - A :ref:`type indicator <pages/development/api_jsdoc_ref#types_syntax>` like ``Map``
  
**Example**

  ::

    @type {Map}



.. _pages/development/api_jsdoc_ref#return:

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
        - The :ref:`type <pages/development/api_jsdoc_ref#types_syntax>` of the return value.
      * - description
        - Descriptive text

**Example**

  ::

    @return {Integer} The sum of the arguments



.. _pages/development/api_jsdoc_ref#throws:

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
      - The :ref:`type <pages/development/api_jsdoc_ref#types_syntax>` of the exception
    * - description
      - Descriptive text under which circumstances this exception is thrown.

**Example**

  ::

    @throws {Error} If the parameter 'X' is out of range.

.. _pages/development/api_jsdoc_ref#see:

.. rst-class:: api-ref

@see
-----

**Description**

  Adds a cross reference to another structure (class, property, method or constant).
  
**Syntax**

  ``@see <class_item> [<link_text>]``

**Parameters**

  .. list-table::
     :stub-columns: 1
     :widths: 30 70

     * - class_item
       - A class item is either a class name, or a class name followed by a ``#``, followed by the name of a class attribute like property, method or constant. If you refer to a structure within the same class, then the class name may be omitted. If you refer to a class in the same package, then the package name before the class may be omitted. In all other cases you have to specify the fully qualified class name (e.g. ``qx.ui.table.Table``). Some examples:

         * ``qx.ui.form.Button`` refers to the class ``Button`` in the package ``qx.ui.form``.
         * ``qx.constant.Type#NUMBER`` links to the constant ``NUMBER`` of the class ``qx.constant.Type``.
         * ``qx.core.Init#defineMain`` refers to the method ``defineMain`` in the class ``qx.core.Init``
     * - link_text
       - An optional display text for the link. If missing ``<class_item>`` is shown.

**Example**

  ``@see qx.constant.Type#NUMBER the NUMBER types``

.. _pages/development/api_jsdoc_ref#link:

.. rst-class:: api-ref

@link
------

**Scope**

  Embedded in descriptive text, `Description`_.

**Description**
  
  The ``@link`` attribute is similar to the `@see`_ attribute, but it is used for linking within description texts. Unlike the other attributes, the ``@link`` attribute is not standalone, but in curly brackets and within the main description text or a description text of another attribute.

**Syntax**

  ``{ @link <class_item> [<link_text>] }``

**Parameters**

  See `@see`_.

**Example**

  ``You will find more information about NUMBER types {@link qx.constant.Type#NUMBER here}.``

.. _pages/development/api_jsdoc_ref#signature:

.. rst-class:: api-ref

@signature
-----------

**Scope**

  Functions

**Description**

  Sometimes the API documentation generator is not able to extract the method signature from the source code. This for example is the case when the method is defined using a ``qx.core.Environment`` selection, or if the method is assigned from a method constant like ``qx.lang.Function.returnTrue``. In these cases the method signature can be declared inside the documentation comment using the ``@signature`` attribute.  You can also add individual parameter names to the signature, but then need to provide ``@param`` entries for each of them.

**Syntax**

  ``@signature function ( <param>, ... )``

**Parameters**

  .. list-table::
    :stub-columns: 1
    :widths: 30 70

    * - param
      - Names for parameters; must match potential ``@param`` sections.

**Example**

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

  With parameters::

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

.. _pages/development/api_jsdoc_ref#internal:

.. rst-class:: api-ref

@internal
-------------------------------------------

**Scope**

  Class, function

**Description**

  Mark the given entity as internal, i.e. not part of the library's public API. A method marked internal will be hidden in the Apiviewer. A class marked internal is still shown in the Apiviewer, but is highlighted as internal. Classes marked internal should not be instantiated in code using the library, internal methods should not be called from outside of it.

**Syntax**

  ``@internal``

**Example**

  ::

    @internal


.. _pages/development/api_jsdoc_ref#deprecated:

.. rst-class:: api-ref

@deprecated
-------------------------------------------

**Scope**

  Class, function

**Description**

  Mark the given entity as deprecated, i.e. library users should no longer use this entry. It will be removed over time.

**Syntax**

  ``@deprecated { <since_version> } <description>``

**Parameters**

    .. list-table::
      :stub-columns: 1
      :widths: 30 70

      * - since_version
        - qooxdoo version with which the corresponding item was deprecated
      * - description
        - Descriptive text of the deprecation
  
**Example**

  ::

    @deprecated {2.1} Please use Object.keys instead


.. _pages/development/api_jsdoc_ref#lint:

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
             * **environmentNonLiteralKey**

               Don't warn about calls to `qx.core.Environment <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.core.Environment>`_ methods without a literal key argument (as such calls cannot be optimized). With no argument, applies to all calls to *qx.core.Environment.(get|select)* in the scope. If given arguments, only the calls using the corresponding variables as keys are exempted.
             * **ignoreDeprecated**

               Use of deprecated globals (like ``alert``).
             * **ignoreNoLoopBlock**
               
               Don't warn about loop or condition statements which don't have a block (``{...}``) as body. Takes no argument.
             * **ignoreReferenceField**
               
               A class map member that is initialized with a reference value (object, array, map, ...), as those will be shared among class instances.
             * **ignoreUndefined**
               
               *(Deprecated)* This key is deprecated for the more general :ref:`@ignore <pages/development/api_jsdoc_ref#ignore>` hint.
             * **ignoreUnused**
               
               Scoped variables (function parameters, function expression's identifier, or variables declared with ``var``) which are never used.
             * **ignoreJsdocKey** *[Not yet implemented]*
               
               JSDoc @ keys which are either unknown (i.e. not documented on this page) or do not comply with the syntax given here.
      * - name
        - The identifier which the lint subkey should be applied to.
  

**Example**

  To turn off warnings for a global symbol ``foo`` that is not known to the generator, but will be available at runtime of the code, use

  ::

    @lint ignoreUndefined(foo)

  To silence warnings for non-literal key arguments in Environment calls use

  ::

    @lint environmentNonLiteralKey()

  To apply this only to calls using a specific key argument ``foo`` use

  ::

    @lint environmentNonLiteralKey(foo)


.. _pages/development/api_jsdoc_ref#attach:

.. rst-class:: api-ref

@attach
-------------------------------------------

**Scope**

  Function

**Description**

  Attach the function to the *members* section of the given class, using the opt. second parameter as the member name.

**Syntax**

  ``@attach { <class> , [<feature_name>] }``

**Parameters**

    .. list-table::
      :stub-columns: 1
      :widths: 30 70

      * - class
        - Class ID where the function should be attached.
      * - feature_name *(opt)*
        - Feature name under which the function should be attached; if missing, the original function name is used.

**Example**

  ``@attach{foo.MyClass, bar}``

  This will attach the given function to the class ``foo.MyClass`` as a member function, under the name ``bar``, so you can call it like ``f=new foo.MyClass(); f.bar()``.


.. _pages/development/api_jsdoc_ref#attachStatic:

.. rst-class:: api-ref

@attachStatic
-------------------------------------------

**Scope**

  Function

**Description**

  As with `@attach`_ above, but attach the function to the *statics* section of the given class, using the opt. second parameter as the statics' name.

**Syntax**

  ``@attachStatic { <class> , [<feature_name>] }``

**Parameters**

    .. list-table::
      :stub-columns: 1
      :widths: 30 70

      * - class
        - Class ID where the function should be attached.
      * - feature_name *(opt)*
        - Feature name under which the function should be attached; if missing, the original function name is used.

**Example**

  ``@attachStatic{foo.MyClass, bar}``

  This will attach the given function to the class ``foo.MyClass`` as a static function, under the name ``bar``, so you can call it like ``foo.MyClass.bar()``.


.. _pages/development/api_jsdoc_ref#require:

.. rst-class:: api-ref

@require
-------------------------------------------

**Scope**

  File

**Description**

  Enforce the inclusion of a required class *before* the current code. Use this only if the generator cannot determine the dependency automatically.

**Syntax**

  ``@require ( <name> ,... )``

**Parameters**

    .. list-table::
      :stub-columns: 1
      :widths: 30 70

      * - name
        - Class name to include.

**Example**

  ``@require(qx.core.Object)``


.. _pages/development/api_jsdoc_ref#use:

.. rst-class:: api-ref

@use
-------------------------------------------

**Scope**

  File

**Description**

  Enforce the inclusion of a required class. Use this only if the generator cannot determine the dependency automatically.

**Syntax**

  ``@use ( <name> ,... )``

**Parameters**

    .. list-table::
      :stub-columns: 1
      :widths: 30 70

      * - name
        - Class name to include.

**Example**

  ``@use(qx.core.Object)``


.. _pages/development/api_jsdoc_ref#ignore:

.. rst-class:: api-ref

@ignore
-------------------------------------------

**Scope**

  File, class, function

**Description**

  Ignore the occurrence of global symbols. This @ hint has two implications:

  * Don't warn about if the symbol is unknown (i.e. is not in any known library or a known built-in), i.e. it influences the lint system.
  * Don't include the symbol in the build, i.e. it influences the compiler system, which also doesn't follow the symbol's dependencies.

**Syntax**

  ``@ignore ( <name> ,... )``

**Parameters**

    .. list-table::
      :stub-columns: 1
      :widths: 30 70

      * - name
        - Class name to include. The name can include trailing wildcards, to ignore entire namespaces, e.g. ``qx.dev.*``.

**Example**

  ``@ignore(qx.dev.unit.TestSuite)``


.. _pages/development/api_jsdoc_ref#tag:

.. rst-class:: api-ref

@tag
-------------------------------------------

**Scope**

  any

**Description**

  The ``@tag`` entry allows to do arbitrary tagging on the entity that is being documented (class, method, ...). This allows for pre-processing of the source code with custom programs, e.g. to extract those tags and make them available to the application at runtime (see the :doc:`/pages/application/demobrowser` application for an example of this).

**Syntax**

  ``@tag <text>``

**Parameters**

    .. list-table::
      :stub-columns: 1
      :widths: 30 70

      * - text
        - Arbitrary text, usually short or composed tag names
  
**Example**

  ::

    @tag noPlayground
    @tag single value binding



