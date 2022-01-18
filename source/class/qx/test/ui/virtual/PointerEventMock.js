/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.PointerEventMock", {
  extend: qx.event.type.Pointer,

  construct(type, config) {
    super();
    this.setType(type);
    this.__config = config;
  },

  members: {
    clone() {
      return this;
    },

    getDocumentLeft() {
      return this.__config.documentLeft || 0;
    },

    getDocumentTop() {
      return this.__config.documentTop || 0;
    }
  },

  destruct() {
    this.__config = null;
  }
});
