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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.locale.LocalizedString",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param messageId {String} message id (may contain format strings) {@link qx.lang.String#format}
   * @param args {Object[]} array of objects, which are inserted into the format string.
   * @param locale {String} optional locale to be used for translation
   */
  construct : function(messageId, args, locale)
  {
    this.base(arguments);

    this.setId(messageId);
    this._locale = locale;

    var storedArguments = [];

    for (var i=0; i<args.length; i++)
    {
      var arg = args[i];

      if (arg instanceof qx.locale.LocalizedString)
      {
        // defer conversion to string
        storedArguments.push(arg);
      }
      else
      {
        // force conversion to string
        storedArguments.push(arg + "");
      }
    }

    this.setArgs(storedArguments);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** message id */
    id :
    {
      check : "String",
      nullable : true
    },

    /** list of arguments to be applied to the format string */
    args :
    {
      nullable : true,
      dispose : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Return translation of the string using the current locale
     *
     * @type member
     * @return {String} translation using the current locale
     */
    toString : function() {
      return qx.locale.Manager.getInstance().translate(this.getId(), this.getArgs(), this._locale);
    }
  }
});
