/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Create a new instance of qx.locale.manager.LocalizedString
 *
 * @see(qx.lang.String.format)
 *
 * @param messageId (string) message id (may contain format strings)
 * @param args (object[]) array of objects, which are inserted into the format string.
 * @param locale (string) optional locale to be used for translation
 */
qx.OO.defineClass("qx.locale.manager.LocalizedString", qx.core.Object,
function(messageId, args, locale) {
  qx.core.Object.call(this);

  this.setId(messageId);
  this._locale = locale;

  var storedArguments = [];
  for (var i=0; i<args.length; args++) {
    var arg = args[i];
    if (arg instanceof qx.locale.manager.LocalizedString) {
      // defer convertion to string
      storedArguments.push(arg);
    } else {
      // force convertion to string
      storedArguments.push(arg + "");
    }
  }
  this.setArgs(storedArguments);
});


/** message id */
qx.OO.addProperty({ name: "id"});

/** list of arguments to be applied to the format string */
qx.OO.addProperty({ name: "args"});


/**
 * Return translation of the string using the current locale
 *
 * @return (string) translation using the current locale
 */
qx.Proto.toString = function () {
  return qx.locale.manager.Manager.getInstance().translate(this.getId(), this.getArgs(), this._locale);
};

