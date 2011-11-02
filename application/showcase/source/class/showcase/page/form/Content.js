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
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * @lint ignoreUndefined(qxc)
 */
qx.Class.define("showcase.page.form.Content",
{
  extend : showcase.AbstractContent,


  construct : function(page) {
    this.base(arguments, page);

    this.setView(new qxc.application.formdemo.FormItems());
  }
});