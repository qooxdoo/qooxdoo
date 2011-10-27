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
 * Objects, which are used as delegates for a data binding store may
 * implement any of the methods described in this interface. The delegate does
 * not need implement all of the methods of this interface. If a method is not
 * implemented the store provides a default implementation.
 *
 * Note: This interface is meant to document the delegate but should not be
 * listed in the <code>implement</code> key of a class unless all methods are
 * really implemented.
 */
qx.Interface.define("qx.data.store.IStoreDelegate",
{
  extend : qx.data.marshal.IMarshalerDelegate,

  members :
  {
    /**
     * This method manipulates the data from the request and returns the
     * manipulated data.
     *
     * @param data {Object} The data received by the request.
     * @return {Object} The manipulated data.
     */
    manipulateData : function(data) {},


    /**
     * This method can change the settings on the used request by the store.
     *
     * @param request {var} The created request, depending on the implementation
     *   of the data store.
     */
    configureRequest : function(request) {}
  }
});