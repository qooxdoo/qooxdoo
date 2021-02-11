# Class Dependency Resolution and Modification

If the compiler instructions in [`compile.json`](compile.md) are correctly
set, the compiler normally needs no other information to analyse the class
dependency tree and include and arrange the class source code accordingly.
However, there might be cases when the automatic dependency analysis
misses dependencies, e.g. because a method is instantiating a class that
has been passed in as a formal parameter, or you are calling a method
on one class that is attached to it from another class dynamically. In
these cases, you need to inform the Compiler about these dependencies
explicitly. There are different ways to achieve that.¶

You can declare dependencies at the top of the class file using the
`@require` and `@use` compiler hints. They are embedded in specific
comments and don't interfere with normal JavaScript syntax. For example

```javascript
/**
 * @require(qx.module.Animation)
 * @use(qx.module.Cookie)
 */
```

Mind the difference between require and use. use should be preferred as
it only says that the required class has to be available "eventually"
at runtime. require imposes a stronger constraint as it demands
that the required class is loaded ahead of the current class, and
should only be used when the required class is used at load-time of
the current class (e.g. in the defer method). ¶

Both compiler hints can only specify individual and fully
qualified class names. It is not possible to use a `*` wildcard
to enforce the inclusion of more than one class. If you need this
behavior, you have to specify the dependencies in `compile.json`:

```json5
{
    "applications": [
        {
            // [...]
            "include": [ "myapp.modules.*", "myapp.MySpecialClass" ],
        }
    ],
```

Passing dependency information via configuration is also interesting when you
don't want to hard-wire this information into the class file. E.g. if you are
building variants of your application where you want to inject variant-specific
classes as dependencies, the configuration method is preferable.
