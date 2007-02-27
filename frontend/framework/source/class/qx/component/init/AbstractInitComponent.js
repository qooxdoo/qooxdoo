/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

/**
 * Abstract application initializer
 */
qx.Clazz.define("qx.component.init.AbstractInitComponent",
{
  type : "abstract",
  extend : qx.component.AbstractComponent,

  construct : function() {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Run initialisation part of component creation.
     *
     * @type member
     * @param e {Event} event object
     * @return {var} TODOC
     */
    initialize : function(e) {
      return qx.core.Init.getInstance().getApplicationInstance().initialize(e);
    },


    /**
     * Run main  part of component creation.
     *
     * @type member
     * @param e {Event} event object
     * @return {var} TODOC
     */
    main : function(e) {
      return qx.core.Init.getInstance().getApplicationInstance().main(e);
    },


    /**
     * Run finalization part of component creation.
     *
     * @type member
     * @param e {Event} event object
     * @return {var} TODOC
     */
    finalize : function(e) {
      return qx.core.Init.getInstance().getApplicationInstance().finalize(e);
    },


    /**
     * Terminate this component.
     *
     * @type member
     * @param e {Event} event object
     * @return {var} TODOC
     */
    close : function(e) {
      return qx.core.Init.getInstance().getApplicationInstance().close(e);
    },


    /**
     * Terminate this component.
     *
     * @type member
     * @param e {Event} event object
     * @return {var} TODOC
     */
    terminate : function(e) {
      return qx.core.Init.getInstance().getApplicationInstance().terminate(e);
    }
  }
});
