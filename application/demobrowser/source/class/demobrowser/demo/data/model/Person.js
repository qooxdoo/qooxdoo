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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("demobrowser.demo.data.model.Person",
{
  extend : qx.core.Object,

  properties : {
    name : {
      check : "String",
      event : "changeName",
      nullable : true
    },

    emote : {
      check : "String",
      event : "changeEmote"
    },

    online : {
      check : "Boolean",
      event : "changeOnline",
      init : true
    }
  },


  members : {
    toString: function() {
      return this.getName() + " is " + (this.getOnline() ? "online": "offline");
    }
  }

});
