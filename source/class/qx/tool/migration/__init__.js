/**
 * This namespace contains classes for the (automatic) migration of user
 * code when the qooxdoo version changes in ways that require code changes.
 *
 * For each qooxdoo version that requires a change in user code, a Class
 * is added to this namespace, the name of which is composed of a capital
 * "M" and the version number with underscores replacing the periods
 * (for example, version 6.0.0 -> `qx.tool.migration.M6_0_0`).
 *
 * The class must extend `qx.tool.migration.BaseMigration`, which contains
 * useful methods to manipulate source files, and to update runtime information
 * on migration process. It also holds a reference to the runner instance which
 * calls the individual classes and contains meta data for all migrations.
 *
 * The convention for the migration classes is that each migration step
 * should be in a separate method, the name of which should clearly express
 * what the method is doing. All migration method names must start with
 * "migrate". For each migration step, either `this.markAsApplied()`
 * or `this.markAsPending()` should be called to update the runner.
 */
