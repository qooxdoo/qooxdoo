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

qx.Class.define("qx.event.type.Rest",
{
  extend: qx.event.type.Data,

  properties:
  {
    request: {
      check: "qx.io.request.AbstractRequest"
    },
    action: {
      check: "String"
    },
    phase: {
      check: "String"
    }
  },

  members:
  {
    init: function(data, old, cancelable, request, action, phase) {
      this.base(arguments, data, old, cancelable);

      this.setRequest(request);
      this.setAction(action);
      this.setPhase(phase);
    },

    // overridden
    clone: function(embryo) {
      var clone = this.base(arguments, embryo);
      clone.setAction(this.getAction());
      clone.setPhase(this.getPhase());
      clone.setRequest(this.getRequest());
      return clone;
    }
  }
});
