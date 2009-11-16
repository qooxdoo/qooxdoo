/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("demobrowser.demo.data.filter.SearchAsYouTypeFilter",
{
  extend : qx.core.Object,


  construct : function(controller)
  {
    this.base(arguments);
    // store the controller
    this.__controller = controller;

    // apply the filter funtion on creation time because the 'this' context
    // needs to be bound to the function
    this.filter = qx.lang.Function.bind(function(data) {
      return data.search(this.getSearchString()) != -1;
    }, this);

    // storage for the timer id
    this.__timerId = null;
  },


  properties : {

    searchString : {
      check : "String",
      apply: "_applySearchString",
      init: ""
    }
  },


  members :
  {
    __timerId: null,
    __controller: null,

    _applySearchString : function(value, old) {
      // get the timer instance
      var timer = qx.util.TimerManager.getInstance();
      // check for the old listener
      if (this.__timerId != null) {
        // stop the old one
        timer.stop(this.__timerId);
        this.__timerId = null;
      }
      // start a new listener to update the controller
      this.__timerId = timer.start(function() {
        this.__controller.update();
        this.__timerId = null;
      }, 0, this, null, 200);
    },

    filter: null
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function() {
    this.__controller = null;
  }
});