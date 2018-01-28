### Lint

To check your project with eslint you can use `qx eslint`.
The command has the following options: 

```
qx lint [files...]

Options:
  --fix              runs eslint with --fix
  --cache            operate only on changed files (default: `false`).
  --warnAsError, -w  handle warnings as error
  --config, -c       prints the eslint configuration
  
```

Configuration is done in the `compile.json` file, see here [here](compile-json.md).

If no special lint configuration is given in `compile.json` the configuration `qx/browser` from 
[eslint-config-qx](https://github.com/qooxdoo/eslint-config-qx/blob/master/README.md) is used.

If there do not exists `compile.json` `qx lint` tries to use `.eslintrc`. 

