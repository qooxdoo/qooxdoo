Development Tools
=================

Editing or IDE support for JavaScript or qooxdoo is still quite limited. If you happen to know some practical solutions, please feel free to add them below.

Eclipse
-------

Since Eclipse 3.4 an advanced editing support for regular JavaScript is available (called [JSDT](http://wiki.eclipse.org/JSDT)). On top of this *native* JS support, the [QXDT project](http://qooxdoo.org/contrib/project/qxdt) aims to provide qooxdoo-*specific* support. This project stalled, mostly due to technical difficulties at that early time of JSDT. The extensibility of JSDT is still a very interesting concept, so if you like to review the QXDT source code and start porting it to recent versions of Eclipse, please see the [documentation](http://qooxdoo.org/contrib/project/qxdt).

Spket IDE
---------

[Spket IDE](http://spket.com) is a powerful toolkit for JavaScript development. Its editor provides features like code completion, syntax highlighting and content outline that helps developers productively create efficient code. It comes with specific [support for qooxdoo](http://www.spket.com/qooxdoo.html).

> **note**

> There is a hotfix available for people working with the qooxdoo SVN checkout instead of the qooxdoo SDK. See the [download link](http://forums.spket.com/viewtopic.php?p=1330#1330) in the Spket forum. Thanks, Eric!

Aptana IDE
----------

The [Aptana IDE](http://www.aptana.com) is a free, open-source, cross-platform, JavaScript-focused development environment for building Ajax applications. It features code assist on JavaScript, HTML, and CSS languages, FTP/SFTP support and a JavaScript debugger to troubleshoot your code. It is available for Windows, Mac OS, Linux and also as an Eclipse plugin.

There is some initial support for qooxdoo in the latest Aptana (nightly builds). The new class definition introduced in qooxdoo 0.7 is supported by an outline view that shows the typical sections like `extend`, `statics`, `members`, etc. For instance, you can easily navigate to any instance method just by selecting the corresponding entry in the outline view.

JSEclipse
---------

JSEclipse is a plugin for the Eclipse environment that helps developers code JavaScript faster and with no errors. With JSEclipse, you can complete a variety of tasks, from editing small sections of code to working with the next big AJAX library like qooxdoo ;-) or developing plug-ins for a product that embeds JavaScript snippets.

[Download and install JSEclipse](http://labs.adobe.com/technologies/jseclipse/) and improve your JavaScript coding experience with:

> -   Contextual code completion & shortcuts.
> -   Project outline and quick navigation through function declarations.
> -   Syntax highlighting.
> -   Error reporting.
> -   Customizable code templates to get you started.
> -   Support for popular JavaScript libraries (Dojo, Prototype, YUI, qooxdoo (currently for 0.5.x only)).
> -   Support for JavaDoc documentation and multi-line comments.

TextMate
--------

There is up-to-date qooxdoo support for TextMate. Please see the [blog post](http://news.qooxdoo.org/textmate-qooxdoo-bundle) and the [project info](http://qooxdoo.org/contrib/project/textmate) for this excellent qooxdoo bundle.

Emacs
-----

[js2-mode](http://code.google.com/p/js2-mode/) offers improved JavaScript support in Emacs. While it doesn't include qooxdoo-specific support, it eventually aims to be competitive with other best-of-class JavaScript editors. Also see the original [blog post](http://steve-yegge.blogspot.com/2008/03/js2-mode-new-javascript-mode-for-emacs.html).
