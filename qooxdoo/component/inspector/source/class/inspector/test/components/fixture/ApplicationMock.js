/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

qx.Class.define("inspector.test.components.fixture.ApplicationMock",
{
  extend : qx.core.Object,

  members :
  {
    __excludes : null,
    
    __selected : null,

    getExcludes : function() {
      return this.__excludes;
    },

    setExcludes : function(excludes) {
      this.__excludes = excludes;
    },
    
    select : function(object) {
      this.__selected = object;
    },
    
    getSelected : function() {
      return this.__selected;
    }
  },

  destruct : function() {
    this.__excludes = this.__selected = null;
  }
});