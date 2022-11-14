/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Christian Boulanger and others

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)
     * Henner Kollmann (hkollmann)

************************************************************************ */

/*global qx qxcli*/

const process = require("process");
const path = require("path");
const fs = require("fs");

/**
 * This module exports dynamic data on the variables used by the templates.
 * It returns a map. The keys are the names of the variables that are asked
 * from the user. Each key takes a map with the following keys:
 * - description (string) : the part of the question that follows "Please enter "
 * - value (mixed|function) : If a value is set, it is assumed to be final and not asked from the user. If
 *   it is 'undefined', it is asked from the user. Can also be a function.
 * - default (mixed|function): the value's default. Can also be a function.
 * - optional (boolean) : whether the user needs to enter anything at all
 * - type (string) : the inquirer question 'type'
 * - choices (array||function): the inquirer "list" question's 'choices' data
 * - validate (function) : a function that returns true if the argument passed to the function
 *   is a valid value
 *
 * @param argv {Object} The calling command class' yargs argv object
 * @param data {Object} Additional data
 */
module.exports = function (argv, data) {
  return {
    "type": {
      "type": "list", // doesn't support validation
      "choices": qx.tool.cli.commands.Create.getSkeletonNames(),
      "description": "type of the application:",
      "value": argv.type,
      "default": "desktop"
    },
    "namespace": {
      "description": "the namespace of the application",
      "default": argv.applicationnamespace || argv.namespace
    },
    "out": {
      "description": "the output directory for the application content (use '.' if no subdirectory should be created)",
      "value": argv.out,
      "default": path.join(process.cwd(), argv.applicationnamespace || argv.namespace)
    },
    "name": {
      "description": "the name of the application",
      "optional": true,
      "value": argv.name,
      "default": argv.applicationnamespace || argv.namespace,
    },
    "summary": {
      "description": "a short summary of what the application does",
      "optional": true
    },
    "description": {
      "description": "a longer description of the features of the application",
      "optional": true
    },
    "authors": {
      "description": "the name of the authors, in the following format: full name (github-id) email-address, divided by comma",
      "optional": true
    },
    "locales": {
      "description": "the locales the application uses, as language codes (en, de, fr, etc.), divided by comma",
      "default": "en"
    },
    "homepage": {
      "description": "a webpage with more information on the application",
      "optional": true
    },
    "license": {
      "description": "the license of the application",
      "default": "MIT license"
    },
    "year": {
      "description": "the year(s) of the copyright",
      "optional": true,
      "default": (new Date).getFullYear(),
    },
    "copyright_holder": {
      "description": "the holder of the copyright for the code",
      "optional": true
    },
    "version": {
      "description": "the version of the application, in semver format",
      "default": "1.0.0"
    },
    "qooxdoo_range": {
      "description": "the semver range of qooxdoo versions that are compatible with this application",
      "default": function () {
        return "^" + data.qooxdoo_version;
      }
    },
    "theme": {
      "description": "the theme of the application",
      "default": argv.theme
    },
    "icon_theme": {
      "description": "the icon theme of the application",
      "default": argv.icontheme
    },
    "namespace_as_path": {
      "value": function () {
        return function () {
          return this.namespace.replace(/\./g, "/");
        }.bind(this);
      }
    }
  }
}
