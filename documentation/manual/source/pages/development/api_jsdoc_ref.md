tocdepth  
3

JSDoc Reference
===============

The declarative language used in JSDoc-like comments in %{qooxdoo} has grown including specific extensions, maybe in some cases deviating from the [official implementation](http://code.google.com/p/jsdoc-toolkit/), so it makes sense to summarize the supported constructs.

Overall JSDoc Structure
-----------------------

A doc comment appears right before the structure (class, property, method or constant) it describes. It begins with `/**` and ends with `*/`. The rows in between start with a `*` followed by the text of the particular row. Within this frame there is a description text at the beginning. Afterwards attributes may follow, describing more aspects.

Description texts may also include HTML tags for a better structuring.

An example:

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

Inline Markup
-------------

Running text can be formatted using inline markup which uses special characters around the target text:

-   \*strong\* (will render as **strong**)
-   \_\_emphasis\_\_ (will render as *emphasis*)

There is no escape character, so in order to e.g. enter a literal ["\*@\*](mailto:"*@*)" into the text, use the HTML entity equivalent ("*&\#64;*" in this case).

### HTML

There is limited support for HTML markup. You should be able to use all of the character-level tags, like `<a>` or `<code>`, as well as paragraph-level tags like `<p>` or `<ul>`. `<pre>` is particularly suited for code snippets, as it allows you to add syntax highlighting for %{JS} with `<pre class="javascript">`.

Attributes / Documentation Tags
-------------------------------

After the general description text there may follow any number of attributes or "documentation tags" (as the JSDoc3 spec calls them). They all have a common general syntax:

    '@' <key> <key_data>

That is they all start with an at-sign, `@`, as the first thing on a line within the JSDoc comment block. Then follows a special key from a pre-defined set of keys, like param, return, throws and the like. The key data is then key-specific and varies a bit. There might be keys that have no data at all. Some use a parenthesized syntax to indicate arguments (like "@ignore(foo)"), other use a more verb-like syntax (like "@deprecated {%{version}} use bar
instead"). Many of them allow free comment text at the end. See the Section
Reference\_ for a full list of supported attributes and their individual syntaxes.

A new attribute entry or the end of the JSDoc comment terminate an attribute specification. Attributes may stretch across multiple lines. Lines following an attribute key are logically appended to the first line (i.e. the effect is as if you had written one long line).

You can **comment out** an attribute by just prefixing it with another `@`, like

    @@ignore(foo)

Then this attribute will simply be ignored.

The following sections before the reference list of supported attributes give some general information that apply to some of them.

Handling of Data Types
----------------------

Because JavaScript has no strong typing, the types of the parameters accepted by a method may not be read from the method's definition. For showing the accepted types in the API documentation the data type may be specified in the doc attributes `@param` and `@return`.

The following type indicators are accepted:

> stub-columns  
> 1
>
> widths  
> 30 70
>
> -   -   Primitive
>
>     - `var`, `void`, `undefined`
> -   -   Builtin classes
>
>     - `Object`, `Boolean`, `String`, `Number`, `Integer`, `Float`,  
>     `Double`, `Regexp`, `Function`, `Error`, `Map`, `Date`, `Element`
>
> -   -   Other classes
>
>     - Here the full qualified name is specified (e.g. `qx.ui.core.Widget`). If  
>     the referenced class is in the same package as the currently documented class, the plain class name is sufficient (e.g. `Widget`).
>
> -   -   Lists
>     -   Homogenous lists are indicated by adding one or more `[]` to the type, e.g. `String[]`, `Integer[][]`.

### Syntax of a Type Specification

Here is the full syntax for a type specification as used in concrete doc attributes:

    `{` [ Type1 `|` Type2 `|` ... [ `?` [<default_value]]  ] `}`

That is, between curly braces an optional list of type indicators (as described above), separated by `|`, following an optional `?` to indicate the entire parameter is optional, followed by an optional default value (the last two for `@param` attributes).

For a parameter description the meaning is: The expected parameter can be of Type1 or Type2 or ..., is optional, i.e. can be left out, and will default to *\<default\_value\>*.

**Example**

>     {String|Integer ? null}

Matching of Names in Code
-------------------------

Many of the JSDoc keys take some sort of symbol names as parameters, e.g. the `foo` in `@ignore(foo)`, which are then matched against names found in the code. These parameters include global variables, built-in functions, function arguments, namespaces, and the like. It is important that you are aware of the semantics of those parameters, i.e. the way they are used to establish a match with a name actually found in the code. The left arrow in the schematics, `->`, can be read as "matches".

-   **Exact Match**

    The name matches the parameter exactly. Some keys restrict themselves to exact matches, e.g. the *alert* in `@lint ignoreDeprecated(alert)` will only match the global symbol *alert* in the code, neither *aler* nor *alerty* nor *alert.foo*.

        foo (parameter) -> foo (name)

    The following match types include exact match, but also allow other kinds of matches. Non-exact matches always honor object boundaries (not just simple string prefixes), so e.g. `foo` might match `foo.bar` but will never match `foobar`.

-   **Prefix Match**

    The name matches a prefix of the parameter. Some keys regard the name from the code as a (pot. complete) prefix of their parameters. E.g. if you use `foo.bar.baz` as a parameter, `foo`, `foo.bar` and `foo.bar.baz` will be matched.

        foo.bar (parameter) -> foo (name)

-   **Extension Match**

    The parameter matches a prefix of the name. Some keys regard the parameter as a prefix of the name from the code, again usually restricting it to object boundaries. In that case, a name `foo.bar` will match a parameter of `foo`, while the name `foozy` will not.

        foo (parameter) -> foo.bar (name)

-   **Wildcard Match**

    Some keys need an explicit, glob-style wildcard at the end to support extension matches. In that case you need to provide a parameter like `foo.*`, in order to match a name of `foo.bar` from the code . Again, a match has to honor object boundaries. In the case of a wildcard like `foo.*`, a simple `foo` will also be matched, so the exact match (without dot and wildcard) is included.

        foo.* (parameter) -> foo.bar (name)

The individual tags should make it clear which of those match semantics they use when checking actual code names. Many keys will allow not only one parameter, but a list of parameters. Matching is then applied to each parameter in turn, and if one of them matches the key applies.

Section Reference
-----------------

A JSDoc comment consists of different sections, where a section is either a leading text, the description, or an entry starting with an `@` attribute. Here is a complete list of the supported sections.

**Overview**

### Description

**Description**

> General description of the item the JSDoc comment refers to.

**Syntax**

> Free text, without any leading `@` attribute, containing HTML and/or markup, and some `@` attributes that may be embedded in text (see further). If given must be the first section in the doc comment.

### @abstract

**Scope**

> methods

**Description**

> Used to signify abstract methods in regular classes.

**Syntax**

> `@abstract`

### @childControl

**Scope**

> class

**Description**

> In a class description of a widget that is composed of various sub-widgets the `@childControl` entry informs about those sub-widgets. This is relevant for users that want to apply a custom theme \<pages/desktop/ui\_appearance\#appearance\> to the widget (the name is the default appearance ID), or implement own widgets \<pages/desktop/ui\_develop\#child\_controls\> that derive from this.

**Syntax**

> `@childControl <name> { <type> } [<description>]`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   name
> >
> >     - An identifying name for the child control
> > -   -   type
> >
> >     - The type specification \<pages/development/api\_jsdoc\_ref\#types\_syntax\> of the child control widget
> > -   -   description
> >     -   *(opt.)* What the child control is used for in the context of this widget

**Example**

>     @childControl title {qx.ui.basic.Label} caption of the window

### @param

**Scope**

> functions

**Description**

> Describes a parameter. `@param` is followed by the name of the parameter. Following that is the type in curly brackets (Example: `{Integer}`), followed by the description text.

**Syntax**

> `@param <name> { <type> } [<description>]`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   name
> >
> >     - Name of formal parameter to function
> > -   -   type
> >
> >     - A type specification \<pages/development/api\_jsdoc\_ref\#types\_syntax\> like `{Boolean | Integer ? 0}`
> > -   -   description
> >     -   *(opt.)* Descriptive text of the parameter

**Example**

>     @param foo {Integer} The main factor

### @protected

**Scope**

> functions

**Description**

> Marks the method as protected. This is helpful if for some reason a protected method name cannot start with "\_" (single underscore). With this attribute the Apiviewer can still classify the method as protected.

**Syntax**

> `@protected [<description>]`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   description
> >     -   *(opt.)* Descriptive text of the parameter

**Example**

>     @protected

### @type

**Scope**

> Data

**Description**

> `@type` is usually used to document data items, esp. when the type is not immediately apparent in the code. This is for example the case when a class member is initialized with `null` and a value of some other type is then assigned in the constructor, so as to not share a single data value across multiple instances.

**Syntax**

> `@type { <type> } [<description>]`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   type
> >
> >     - A type indicator \<pages/development/api\_jsdoc\_ref\#types\_syntax\> like `Map`
> > -   -   description
> >     -   *(opt.)* Descriptive text of the type

**Example**

>     @type {Map}

### @return

**Scope**

> functions

**Description**

> Describes the return value.

**Syntax**

> `@return { <type> } [<description>]`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   type
> >
> >     - The type \<pages/development/api\_jsdoc\_ref\#types\_syntax\> of the return value.
> > -   -   description
> >     -   *(opt.)* Descriptive text

**Example**

>     @return {Integer} The sum of the arguments

### @throws

**Scope**

> Functions

**Description**

> Describes in which cases an exception is thrown.

**Syntax**

> `@throws { <type> } [<description>]`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   type
> >
> >     - The type \<pages/development/api\_jsdoc\_ref\#types\_syntax\> of the exception
> > -   -   description
> >     -   *(opt.)* Descriptive text under which circumstances this exception is thrown.

**Example**

>     @throws {Error} If the parameter 'X' is out of range.

### @see

**Description**

> Adds a cross reference to another structure (class, property, method or constant).

**Syntax**

> `@see <class_item> [<link_text>]`

**Parameters**

**Example**

> `@see qx.constant.Type#NUMBER the NUMBER types`

### @link

**Scope**

> Embedded in descriptive text, Description\_.

**Description**

> The `@link` attribute is similar to the @see\_ attribute, but it is used for linking within description texts. Unlike the other attributes, the `@link` attribute is not standalone, but in curly brackets and within the main description text or a description text of another attribute.

**Syntax**

> `{ @link <class_item> [<link_text>] }`

**Parameters**

> See @see\_.

**Example**

> `You will find more information about NUMBER types {@link qx.constant.Type#NUMBER here}.`

### @signature

**Scope**

> Functions

**Description**

> Sometimes the API documentation generator is not able to extract the method signature from the source code. This for example is the case when the method is defined using a `qx.core.Environment` selection, or if the method is assigned from a method constant like `qx.lang.Function.returnTrue`. In these cases the method signature can be declared inside the documentation comment using the `@signature` attribute. You can also add individual parameter names to the signature, but then need to provide `@param` entries for each of them.

**Syntax**

> `@signature function ( <param>, ... )`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   param
> >     -   Names for parameters; must match potential `@param` sections.

**Example**

>     members :
>       {
>         /**
>          * Always returns true
>          *
>          * @return {Boolean} returns true
>          * @signature function()
>          */
>         sayTrue: qx.lang.Function.returnTrue;
>       }
>
> With parameters:
>
>     members :
>       {
>         /**
>          * Always returns false, but takes some parameters.
>          *
>          * @return {Boolean} returns false
>          *
>          * @signature function(foo, bar, baz)
>          * @param foo {String} ...
>          * @param bar {Integer} ...
>          * @param baz {Map} ...
>          */
>         sayFalse: function() {
>           ...
>         }
>       }

### @internal

**Scope**

> Class, function

**Description**

> Mark the given entity as internal, i.e. not part of the library's public API. A method marked internal will be hidden in the Apiviewer. A class marked internal is still shown in the Apiviewer, but is highlighted as internal. Classes marked internal should not be instantiated in code using the library, internal methods should not be called from outside of it.

**Syntax**

> `@internal`

**Example**

>     @internal

### @deprecated

**Scope**

> Class, function

**Description**

> Mark the given entity as deprecated, i.e. library users should no longer use this entry. It will be removed over time.

**Syntax**

> `@deprecated { <since_version> } [<description>]`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   since\_version
> >
> >     - qooxdoo version with which the corresponding item was deprecated
> > -   -   description
> >     -   *(opt.)* Descriptive text of the deprecation

**Example**

>     @deprecated {2.1} Please use Object.keys instead

### @lint

**Description**

> Taylor warning messages for the source code. This attribute is evaluated at compile time, and influences the warnings issued by the generator. It has no relevance for the API documentation of the code. The general idea is to switch off warnings for certain situations in the code, mostly related to the identifiers used.
>
> Within one JSDoc comment, the same subkey can appear multiple times.

**Syntax**

> `@lint <subkey> ( <name> ,... )`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   subkey
> >
> >     - The following subkeys are supported:  
> >     -   **environmentNonLiteralKey**
> >
> >         Don't warn about calls to [qx.core.Environment](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.core.Environment) methods without a literal key argument (as such calls cannot be optimized). With no argument, applies to all calls to *qx.core.Environment.(get|select)* in the scope. If given arguments, only the calls using the corresponding variables as keys are exempted.
> >     -   **ignoreDeprecated**
> >
> >         Use of deprecated globals (like `alert`).
> >     -   **ignoreNoLoopBlock**
> >
> >         Don't warn about loop or condition statements which don't have a block (`{...}`) as body. Takes no argument.
> >     -   **ignoreReferenceField**
> >
> >         A class map member that is initialized with a reference value (object, array, map, ...), as those will be shared among class instances.
> >     -   **ignoreUndefined**
> >
> >         *(Deprecated)* This key is deprecated for the more general @ignore \<pages/development/api\_jsdoc\_ref\#ignore\> hint.
> >     -   **ignoreUnused**
> >
> >         Scoped variables (function parameters, function expression's identifier, or variables declared with `var`) which are never used.
> >     -   **ignoreJsdocKey**
> >
> >         JSDoc @ keys which are either unknown (i.e. not documented on this page) or do not comply with the syntax given here.
> >     -   **ignoreUndeclaredPrivates**
> >
> >         Private members in class code which are not declared in the class map.
> >
> > -   -   name
> >     -   The identifier which the lint subkey should be applied to.

**Example**

> To turn off warnings for a global symbol `foo` that is not known to the generator, but will be available at runtime of the code, use
>
>     @lint ignoreUndefined(foo)
>
> To silence warnings for non-literal key arguments in Environment calls use
>
>     @lint environmentNonLiteralKey()
>
> To apply this only to calls using a specific key argument `foo` use
>
>     @lint environmentNonLiteralKey(foo)

### @cldr

**Scope**

> Class

**Description**

> This hint indicates that the class needs CLDR data (e.g. names of months or week-days). It takes no arguments.

**Syntax**

> `@cldr()`

**Example**

> `@cldr()`

### @asset

**Scope**

> Class

**Description**

> Request resources, like images, that this class uses to be included in a build.
>
> You can also use `*` as a wildcard character, to request entire resource namespaces: `@asset(foo/*)` will request all resources found under the "foo/" namespace.

**Syntax**

> `@asset ( <resource_id> , [<resource_id>] )`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   resource\_id
> >     -   The resource ID or resource pattern to be added.

**Example**

> `@asset(custom/test.png)`
>
> This will add the image `custom/test.png` to the build.
>
> `@asset(custom/*)`
>
> Add all resources under the `custom` name space to the build.

### @attach

**Scope**

> Function

**Description**

> Attach the function to the *members* section of the given class, using the opt. second parameter as the member name.

**Syntax**

> `@attach { <class> , [<feature_name>] }`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   class
> >
> >     - Class ID where the function should be attached.
> > -   -   feature\_name
> >     -   *(opt.)* Feature name under which the function should be attached; if missing, the original function name is used.

**Example**

> `@attach{foo.MyClass, bar}`
>
> This will attach the given function to the class `foo.MyClass` as a member function, under the name `bar`, so you can call it like `f=new foo.MyClass(); f.bar()`.

### @attachStatic

**Scope**

> Function

**Description**

> As with @attach\_ above, but attach the function to the *statics* section of the given class, using the opt. second parameter as the statics' name.

**Syntax**

> `@attachStatic { <class> , [<feature_name>] }`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   class
> >
> >     - Class ID where the function should be attached.
> > -   -   feature\_name
> >     -   *(opt.)* Feature name under which the function should be attached; if missing, the original function name is used.

**Example**

> `@attachStatic{foo.MyClass, bar}`
>
> This will attach the given function to the class `foo.MyClass` as a static function, under the name `bar`, so you can call it like `foo.MyClass.bar()`.

### @group

**Scope**

> Class

**Description**

> Adds a 'group' attribute to the API data of this class. This attribute is additionally copied to every method in this class that also has an @attach or @attachStatic hint.

**Syntax**

> `@group ( <name> )`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   name
> >     -   Group name.

**Example**

> `@group (Event_Normalization)`

### @require

**Scope**

> File

**Description**

> Enforce the inclusion of a required class *before* the current code. Use this only if the generator cannot determine the dependency automatically.
>
> There is one special name, `feature-checks`, which is reserved for internal use and shouldn't be used in normal application code. This will add all known feature check classes as load time dependencies to the current class.

**Syntax**

> `@require ( <name> ,... )`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   name
> >     -   Class name to include.

**Example**

> `@require(qx.core.Object)`

### @use

**Scope**

> File

**Description**

> Enforce the inclusion of a required class. Use this only if the generator cannot determine the dependency automatically.
>
> There is one special name, `feature-checks`, which is reserved for internal use and shouldn't be used in normal application code. This will add all known feature check classes as run time dependencies to the current class.

**Syntax**

> `@use ( <name> ,... )`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   name
> >     -   Class name to include.

**Example**

> `@use(qx.core.Object)`

### @ignore

**Scope**

> File, class, function

**Description**

> Ignore the occurrence of global symbols. This @ hint has two implications:
>
> -   Don't warn about it if the symbol is unknown (i.e. is not in any known library or a known built-in), i.e. it influences the lint system.
> -   Don't include the symbol in the build, i.e. it influences the compiler system which then also doesn't follow the symbol's dependencies.
>
> There are two special names that may be used in application code:
>
> -   **auto-require** : Ignore all load time dependencies detected by the automatic analysis; they will not be added to the class' load dependencies. *This effectively turns off the automatic processing of load time dependencies for this class*.
> -   **auto-use** : Ignore all run time dependencies detected by the automatic analysis; they will not be added to the class' run dependencies. *This effectively turns off the automatic processing of run time dependencies for this class*.
>
> You can also use `*` as a wildcard character, to ignore entire class APIs or namespaces: `@ignore(foo.*)` will ignore "foo" and any symbol starting with "foo.". Otherwise, matches are exact so @ignore(foo) will only ignore "foo", but not "foo.bar".

**Syntax**

> `@ignore ( <name> ,... )`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   name
> >     -   Class name to include. The name can include trailing wildcards, to ignore entire class APIs or namespaces, e.g. `qx.dev.Debug.*` or `qx.dev.unit.*`.

**Example**

> `@ignore(qx.dev.unit.TestSuite)`

**See**

> Special section on /pages/development/api\_jsdoc\_at\_ignore.

### @tag

**Scope**

> any

**Description**

> The `@tag` entry allows to do arbitrary tagging on the entity that is being documented (class, method, ...). This allows for pre-processing of the source code with custom programs, e.g. to extract those tags and make them available to the application at runtime (see the /pages/application/demobrowser application for an example of this).

**Syntax**

> `@tag <text>`

**Parameters**

> > stub-columns  
> > 1
> >
> > widths  
> > 30 70
> >
> > -   -   text
> >     -   Arbitrary text, usually short or composed tag names

**Example**

>     @tag noPlayground
>     @tag single value binding
