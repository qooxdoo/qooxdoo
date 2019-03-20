About
=====

This manual is a technical manual for %{qooxdoo} core developers. Its scope is how certain things within the project - both code and procedures - are implemented, so that another (or a new) core developer can get informed about these things easily, when code and comments are not enough. So the information herein is valuable, but doesn't suit the normal user manual, as it concerns things the normal user of qooxdoo doesn't have to deal with.

Ins
---

Things to consider for this manual include (but are not limited to):

-   Commiters guide
-   Coding style
-   Contribution workflow (Github, "how to pull-request", cf. [[1]](http://ipython.org/ipython-doc/rel-0.12/development/gitwash/development_workflow.html))
-   Implementation/design documents for framework features
-   Implementation/design documents for the tool chain / generator features

Outs
----

Things **not** to place here:

-   Every information a user might need for working with %{qooxdoo}; this has to be in the user manual.
-   Team internals (team organisation, meetings, ...).

If you add new pages to this manual, try to remain close to the logical structure of the user manual, e.g. put information that belongs to the *qx.Server* component in a "qx.Server" chapter on the index page.

If you find that some information should be in this manual, open a bug for creating it.

The manual is revision-controlled so changes to the information herein over time reflect the changes in the project, but earlier states can be inspected or recovered if necessary.
