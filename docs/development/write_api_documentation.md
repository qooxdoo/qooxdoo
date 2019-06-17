Writing API Documentation
=========================

For documenting the qooxdoo API special comments in the source code (so-called "doc comments") are used. The doc comments in qooxdoo are similar to [JSDoc comments](http://code.google.com/p/jsdoc-toolkit/) or [Javadoc](http://docs.oracle.com/javase/7/docs/technotes/tools/solaris/javadoc.html) comments. To account for some qooxdoo specific needs there are certain differences to the two systems mentioned above. For a complete treatment of the syntax see the JSDoc reference \<development/api\_jsdoc\_ref\>.

An introductory example
-----------------------

Doc comments are specially formatted comment blocks enclosed by `/**` and `*/`. A typical use case is to put them in front of a method definition. You start with a general description of the method, and then add sections that start with `@` followed by a special key that describes e.g. a parameter or the return type of the method. Here is an example:

    /**
     * Shows a message to the user.
     *
     * @param text {string} the message to show.
     */
    showMessage : function(text) {
      ...
    }

The `@param` attribute entry describes the parameter `text`. Description texts may also include markup for highlighting and structure.

Here is a longer example that covers an entire class file:

    /**
     * General class description.
     */
    qx.Class.define("mypackage.MyClass",
    {
      extend : blubb.MySuperClass,

      /**
       * Constructor description.
       *
       * @param param1 {Integer} description of first parameter\
       */
      construct : function(param1) {
        ...
      }
    });

    properties :
    {
      /** Property definitions. */
      "myProperty" :
       {
          check : "Number",
          init : 0
       }
    },

    members :
    {
      /** Method description */
      myMethod : function(bla, blubb)
      {
        ...
      }
    },

    statics :
    {
      /** Static method description */
      myStaticMethod : function(bla, blubb)
      {
        ...
      },

      /** Constant description */
      MY_CONSTANT : 100
    },

The class description is taken as the first comment in the file which starts with `/**`. Therefore if you have a comment at the start of the file which has a first line of `/**********`, that will be taken as the class description, overriding any comment above the class itself. Therefore use `/* *********` or `/* ==========` etc.

Advanced Doc Comments
---------------------

Here is a more advanced example of a method documentation block that uses more `@` keys to provide structured information about the method.

    /**
    * Handles a drop.
    *
    * @param dragSource {qx.bla.DragSource} the drag source that was dropped.
    * @param targetElement {Element} the target element the drop aims to.
    * @param dropType {Integer ? null} the drop type. This is the same type
    *        as used in {@link qx.bla.DragEvent}.
    * @return {Boolean} whether the event was handled.
    * @throws {Error} if the targetElement is no child of this drop target.
    *
    * @see #getDragEvent
    * @see qx.bla.DragEvent
    */
    handleDrop : function(dragSource, targetElement, dropType) {
      ...
    }

This will render in the Apiviewer similarly to this:

![image](/apiviewer_method.png)

As mentioned above the JSDoc reference \<development/api\_jsdoc\_ref\> has the complete list of possible section keys and markup possibilities.

Package documentation
---------------------

While documenting a class files where JSDoc comments are interleaved with the class code seems straight forward, this is not so obvious if you want to provide documentation for a *package*, i.e. a collection of classes under a common namespace (like *qx.ui.core*, *qx.util*, etc.).

In order to fill this gap you can add a `__init__.js` file to the package. This file should contain only a single JSDoc comment that describes the package as a whole. These files are then scanned during a `generate.py api` run and the documentation is inserted at the package nodes, together with a list of classes of the corresponding package, in the documentation tree. See the API documentation for the [framework packages](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.fx) as examples.
