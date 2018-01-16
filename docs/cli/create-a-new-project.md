### Create a new project

You can create new project skeletons by using the `qx create` command` It has the following options:
```
  --type, -t            Type of the application to create.              [string]
  --out, -o             Output directory for the application content.
  --namespace, -s       Top-level namespace.
  --name, -n            Name of application/library (defaults to namespace).
  --qxpath              Path to the folder containing the qooxdoo framework.
  --theme               The name of the theme to be used.    [default: "indigo"]
  --icontheme           The name of the icon theme to be used.
                                                             [default: "Oxygen"]
  --noninteractive, -I  Do not prompt for missing values
  --verbose, -v         Verbose logging
```

The fastest way to create a new project is to execute `qx create foo -I`. This will create a new application with the namespace "foo", using default values. However, in most cases you wamt to customize the generated application skeleton. `qx create foo` will interactively ask you all information it needs, providing default values where possible. If you are in the top-level folder of the application and want to put the application content into it without creating a subfolder (for example, in a top-level folder of a cloned empty GitHub project), use `--out=.`. 
