@ignore
=======

pages/development/api\_jsdoc\_ref\#ignore is a very powerful construct that probably deserves a bit elaboration on the reference information.

Variadic Arguments
------------------

Like many @-hints @ignore is capable of a variable number of arguments. So instead of writing :

    @ignore(foo)
    @ignore(bar)

you can write :

    @ignore(foo, bar)

to the same effect. (Of course you can also have two separate @ignore entries if you prefer that).

Double Relevance
----------------

More importantly, @ignore has relevance both as a compiler hint but also for the lint checker. Using @ignore means

> -   don't warn about this symbol if you cannot resolve it (for the lint checker)
> -   don't include this symbol and its dependencies in the build (whether it is known or not – for the compiler)

### Silence Lint Only

So <*@ignore>\* will affect both lint and compile jobs, which is usually what you want. You only want lint not to warn you about a symbol in your code if you know you don't need to take any action to provide it when the application is created. (Otherwise you would want to be alerted about that by lint). But that effectively means that the symbol can be left out from the build, and the compiler can safely skip it.

But if you actually have symbols in your code that are provided by another contribution or library which are not known to the *lint* job, it is not a good idea to simply add `@ignore(...<symbols>...)` in the affected classes, as then you would also skip those symbols when building the application, which might result in a broken app.

Rather, to just cover the *lint* behavior modify the configuration for the `lint` job in your *config.json* by adding the missing top-level symbols:

    "jobs" : {
      "lint" : {
        "lint-check" : {
          "allowed-globals" : [
            /* add symbols here that lint should ignore */
          ]
        }
      }
    }

Name Globbing
-------------

@ignore supports globbing in a rather strict way. Already the old \#ignore supported globs like *\#ignore(foo.\*)* to ignore entire namespaces, but also did some automatic globbing when it thought that *foo* was actually a class and not a namespace. The effect was that *\#ignore(foo)* would also ignore *foo.getBar* when this looked like an attribute reference on a class object. (As you can imagine the problem lies in the term "looked like". This decision could be safely made for known classes but not for unknown symbols. In an unknown *foo.bar*, is *bar* a nested namespace or a class attribute?!).

<*@ignore>(foo)\* will ignore *foo* and only *foo*. If you also want *foo.getBar* be ignored either list it explicitly (as in <*@ignore>(foo, foo.getBar)*) or use a wildcard (as in*@ignore(foo.\*)\*) which will ignore both.

Scoped Application
------------------

Most importantly, @ignore is *lexically scoped*. This was a major requirement, and one reason to integrate compiler hints with the JSDoc system. When people used an unknown symbol in one method, they wanted to ignore that specifically for that method and not globally for the whole file. As a consequence, using the same symbol in a sibling method you would again get an "Unknown global symbol" warning which was desired. This was not available with the old \#ignore.

So if an unknown name is found in a particular line of code, a lookup happens to the next enclosing lexical scope if this name should be ignored. If there is no such information in the enclosing JSDoc comment the search is repeated upwards, e.g. in the JSDoc preceding the class definition. If necessary this is repeated all the way up to the top-most JSDoc, which effectively takes the place of the old \#ignore hint. So the old functionality is covered by a simple replacement of the different comment blocks, but the new system also allows a much finer control.

This scoped look up is not the case for other compiler hints like e.g. @require or @use which still scope over the entire class file.
