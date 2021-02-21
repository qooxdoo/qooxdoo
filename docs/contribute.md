# Contribute to & Support Qooxdoo

You can help to make Qooxdoo better by [contributing code or documentation](development/contribute.md)
or by supporting the project financially:

- Donate via [Liberapay](https://liberapay.com/qooxdoo.org/donate).

## Contibuting code the Framework

See our Guide on [Coding the Framework](development/contribute.md).

## Testing

Before you submit a PR, you should check that your code passes
the lint tests by running `npm test` in the framework repo
directory; this will automatically run lint against the codebase and do compiler
and framework tests.
`npm test` will run `bootstrap-compiler` automatically.
                              
If you want to test the framework seperatly run:
```bash
cd test/framework
../../bin/source/qx test
```

For the compiler run:
```bash
cd test/cli
../../bin/source/qx test
```

Requirement for this is that `bootstrap-compiler` has run once.



                                                                                                                                          
