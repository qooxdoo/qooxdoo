/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Martijn Evers, The Netherlands

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martijn Evers (mever)

************************************************************************ */

/**
 * Within a transaction, property changes can be applied atomically.
 */
qx.Class.define("qx.core.Transaction", {
  extend : qx.core.Object,
  members : {

    /**
     * Sets the property value of given subject.
     *
     * Note that any exceptions caused by property constrains are caught in the commit phase
     * and returned as error object(s).
     *
     * @param subject {qx.core.Object} Object to change withing the transaction.
     * @param property {string} Name of the property to set.
     * @param value {var} Any value accepted by the property.
     */
    setPropertyValue : function(subject, property, value) {
    },

    /**
     * Commits the transaction.
     *
     * When returned array of errors is not empty the transaction is rolled back.
     *
     * @return {Error[]} Empty array on success; otherwise an array of error are returned.
     */
    commit : function() {
    },

    /**
     * Rollback the transaction.
     */
    rollback : function () {
    }
  }
});