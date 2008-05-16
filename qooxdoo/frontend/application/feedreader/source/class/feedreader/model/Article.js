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
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Date data model for a feed article
 */
qx.Class.define("feedreader.model.Article",
{
  extend : qx.core.Object,



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Title of the article */
    title :
    {
      check : "String",
      event : "dataModified"
    },


    /** Author of the article */
    author  :
    {
      check : "String",
      nullable : true,
      event : "dataModified"
    },


    /** Publishing date */
    date :
    {
      check : "Date",
      event : "dataModified"
    },


    /** HTML content of the article */
    content :
    {
      check : "String",
      event : "dataModified"
    },


    /** URL to the article */
    link :
    {
      check : "String",
      event : "dataModified"
    }
  }
});