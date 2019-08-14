The Focus Layer
===============

History
-------

This document is meant to talk about some internals of the focus system in qooxdoo since 1.2. This is a technology documentation targeted to interested developers. There is no need to understand these details as a user of the framework.

In previous versions of the focus handling we forced the application to our own implementation instead of working together with the browser. This was quite straightforward because the topic itself is quite complex and the differences between the browsers are huge. So just ignoring all these differences and implementing an own layer is highly attractive.

However this came with quite some costs. For example it's quite hard to catch all the edge cases when a input field loses the focus nor is it possible to recover the focus correctly when the browser does something after switching the window (send back/bring to front etc.). To listen on the browser might improve some types of out-of-sync problems in the previous versions. We caught most things correctly though, but it is quite hard to get 100% accuracy.

Focus Support
-------------

With 1.2 the focus system was reimplemented using the new low level event stack. Compared to the old focus system this basically means that the whole focus support is implemented low-level without any dependencies on the widget system. It directly uses the new event infrastructure and integrates fine with the other event handlers.

The new system tries to connect with all available native events which could help with detecting were the browser's focus is moving to. The implementation makes use of native events like `activate` or `focusin` where available. It uses a lot of browser behavior which is not explicitly documented or valid when reading the specifications, just to solve the issue of detecting where the focus currently is or is moved to.

It supports the events `focusin`, `focus`, `focusout` and `blur` on DOM nodes. It also supports `focus` and `blur` events on the `window`. There is support for `activate` and `deactivate` events on DOM nodes to track keyboard activation. It has the properties `focus` and `active` to ask for the currently focused or activated DOM node.

Activation Support
------------------

The activation, as part of the focus system, is also done by this manager. The keyboard handler for example asks the focus system which DOM element is the active one to start the bubble sequences for all keyboard events on this element. As the keyboard layer sits on top of the DOM and implements the event phases on its own there is no need to inform the browser about the active DOM node as it is simply not relevant when using this layer. It is also quite important as in every browser tested the methods to activate a DOM node (if available at all) might also influence the focus which creates some problems.

Window Focus/Blur
-----------------

The handler also manages the focus state of the top-level window. It fires the `blur` and `focus` events on the `window` object one can listen to. Natively, these events are fired all over just by tapping somewhere in the document. The issue is to detect the *real* `focus`/`blur` events. This is implemented through some type of internal state representation.

Text Selection
--------------

Focus handling in qooxdoo also solves a lot of related issues. For example the whole support for unselectable text is done with the focus handler as well. Normally all text content on a page is selectable (with some exceptions like native form buttons etc.). In a typical GUI or during drag&drop sessions it is highly needed to stop the user from being able to select any text.

The only thing needed for the focus handler here is to add an attribute `qxSelectable` with the value `off` to the node which should not be selectable. I don't know about a way which is easier to solve this need.

Behind the scenes qooxdoo dynamically applies styles like `user-select` or attributes like `unselectable`. There are a lot of bugs in the browser when keeping these attributes or styles statically applied to the nodes so they are applied as needed dynamically which works surprisingly well. In Internet Explorer the handler stops the event `selectstart` for the affected elements.

Prevent Defaults
----------------

One thing we needed especially for the widget system, which is built on top, was support for preventing a widget or in this case a DOM node from being able to get the focus. This sounds simpler at first than it is. The major issue is to also keep the focus where it is while tapping somewhere else.

This is especially interesting when working with a text selection. Unfortunately in a browser the selection could only be where the focus is. This is a major issue when trying to apply any change to the currently selected text like needed for most kinds of editors (like a rich text editor used by a mail application for example). The type of fix we apply in qooxdoo is not to allow the browser to focus a specific DOM node e.g. the "Bold" button of the text editor. This makes it easy to add listeners to the button which work with the still existing selection of the editor field. The feature could be applied easily to a DOM node like such a button just through an attribute `qxKeepFocus` with the value `on`. It affects all children of the element as well, as long as these do not define anything else.

A similar goal is to keep the activation where it is when the user taps at a specific section of the document. This is mainly used to keep the keyboard processing where it is e.g. when tapping the opened list of a `SelectBox` widget. This feature could be used for other scenarios like this as well. Like in the previous block it can be enabled simply by setting the attribute `qxKeepActive` to `on` for the relevant DOM node. Internally, to stop the activation also means to stop the focus. It was not solvable in another way because the browser otherwise sends activation events to the focused DOM node which is contra-productive in this case.

Another unwanted side effect of some browsers is the possibility to drag around specific types of content. There is some type of native drag&drop support in most of today's browsers, but this is quite useless with the current quality of implementation. Still, the major issue remains: It is possible to drag around images for example which is often not wanted in a GUI toolkit. These native *features* compromise the behavior implemented by the application developer on top of them. To stop this, qooxdoo applies styles like `user-drag` on browsers that support it, or prevents the native `draggesture` event where available.

Other then this, most of these prevention is implemented internally through a `preventDefault` call on the global `pointerdown` event when a specific target is detected. This has some side effects though. When preventing such a core event it means that most browsers also stop any type of selection happening through the pointer. This also stops them from focusing the DOM node natively. The qooxdoo code uses some explicit `focus` calls on the DOM nodes to fix this.

Please note that some settings may have side effects on other things. For example, to make a text region selectable but not activate able is not possible with the current implementation. This has not really a relevance in real-world applications, but may be still interesting to know about.

Finally
-------

Finally, the whole implementation differs nearly completely for the supported browsers. Hopefully you get an impression of the complexity of the topic.
