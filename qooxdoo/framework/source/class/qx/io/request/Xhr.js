/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("qx.io.request.Xhr", 
{
  extend: qx.core.Object,

  construct: function()
  {
    this.base(arguments);
    
    this.__transport = this._createTransport();
  },

  properties:
  {
    method: {
      check : [ "GET", "POST"],
      init : "GET"
    },
    
    url: {
      check: "String"
    }
  },

  members:
  {
    __transport: null,
    
    send: function() {
      this.__transport.open(this.getMethod(), this.getUrl());
      this.__transport.send();
    },
    
    _createTransport: function() {
      return new qx.bom.request.Xhr();
    }
  }
});
