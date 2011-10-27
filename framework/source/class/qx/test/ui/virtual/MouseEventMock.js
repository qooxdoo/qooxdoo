/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.MouseEventMock",
{
  extend : qx.event.type.Mouse,

  construct : function(type, config)
  {
    this.base(arguments);
    this.setType(type);
    this.__config = config;
  },

  members :
  {
    clone : function() {
      return this;
    },

    getDocumentLeft : function() {
      return this.__config.documentLeft || 0;
    },

    getDocumentTop : function() {
      return this.__config.documentTop || 0;
    }
  },

  destruct : function() {
    this.__config = null;
  }
});