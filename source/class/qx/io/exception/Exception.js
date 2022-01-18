/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2020 Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (cboulanger)

************************************************************************ */

/**
 * A generic class for representing exceptions that occur during io operations.
 */
qx.Class.define("qx.io.exception.Exception", {
  extend: qx.type.BaseError,

  /**
   * Constructor
   * @param message {String}
   * @param code {Number}
   * @param data {*|null}
   */
  construct(message, code, data) {
    super("", message);
    this.code = code;
    this.data = data;
    this.name = this.classname;
  }
});
