/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

   ======================================================================

   This class contains code based on the following work:

   * script.aculo.us
       http://script.aculo.us/
       Version 1.8.1

     Copyright:
       (c) 2008 Thomas Fuchs

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Author:
       Thomas Fuchs

************************************************************************ */

/**
 * Manager for access to effect queues.
 * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
 */
qx.Class.define("qx.fx.queue.Manager",
{
  extend : qx.core.Object,
  type : "singleton",

  construct : function()
  {
    qx.log.Logger.deprecatedClassWarning(this.constructor,
      "qx.fx.* is deprecated. Please use qx.bom.element.Animation instead."
    );

    this.base(arguments);
    this.__instances = {};
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __instances : null,

    /**
     * Returns existing queue by name or creates a new queue object and returns it.
     * @param queueName {String} Name of queue.
     * @return {Class} The queue object.
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    getQueue : function(queueName)
    {
     if(typeof(this.__instances[queueName]) == "object") {
       return this.__instances[queueName];
     } else {
       return this.__instances[queueName] = new qx.fx.queue.Queue;
     }
    },

    /**
     * Returns existing default queue or creates a new queue object and returns it.
     * @return {Class} The queue object.
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    getDefaultQueue : function() {
      return this.getQueue("__default");
    }

  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeMap("__instances");
  }
});
