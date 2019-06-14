/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Adds support for verification of infrastructure requirements to unit test
 * classes.
 */
qx.Mixin.define("qx.dev.unit.MRequirementsBasic", {


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members :
  {

    /**
     * Verifies a list of infrastructure requirements by checking for
     * corresponding "has" methods. If no such method was found,
     * {@link qx.core.Environment} will be checked for a key matching the given
     * feature name. Note that asynchronous environment checks are not supported!
     *
     * See the manual for further details:
     * <a href="http://manual.qooxdoo.org/current/pages/development/frame_apps_testrunner.html#defining-test-requirements">Defining Test Requirements</a>
     *
     * @throws {qx.dev.unit.RequirementError} if any requirement check returned
     *   <code>false</code>
     * @throws {Error} if no valid check was found for a feature.
     *
     * @param featureList {String[]} List of infrastructure requirements
     * @lint environmentNonLiteralKey(feature)
     */
    require : function(featureList) {

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertArray(featureList);
      }

      for (var i=0,l=featureList.length; i<l; i++) {
        var feature = featureList[i];
        var hasMethodName = "has" + qx.lang.String.capitalize(feature);

        if (this[hasMethodName]) {
          if (this[hasMethodName]() === true) {
            continue;
          }
          else {
            throw new qx.dev.unit.RequirementError(feature);
          }
        }

        if (qx.core.Environment.getChecks()[feature]) {
          var envValue = qx.core.Environment.get(feature);
          if (envValue === true) {
            continue;
          }
          if (envValue === false) {
            throw new qx.dev.unit.RequirementError(feature);
          }
          else {
            throw new Error("The Environment key " + feature + " cannot be used"
             + " as a Test Requirement since its value is not boolean!");
          }
        }

        if (qx.core.Environment.getAsyncChecks()[feature]) {
          throw new Error('Unable to verify requirement ' + feature + ': '
          + 'Asynchronous environment checks are not supported!');
        }

        throw new Error('Unable to verify requirement: No method "'
          + hasMethodName + '" or valid Environment key "' + feature + '" found');
      }
    }
  }

});
