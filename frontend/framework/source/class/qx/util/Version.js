/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the qooxdoo top-level directory for details

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
   ________________________________________________________________________

   This class contains code based on the following work:

     SWFObject: Javascript Flash Player detection and embed script
     http://blog.deconcept.com/swfobject/
     Version: 1.4.4

     Copyright:
       2006 Geoff Stearns

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

       Permission is hereby granted, free of charge, to any person obtaining a
       copy of this software and associated documentation files (the "Software"),
       to deal in the Software without restriction, including without limitation
       the rights to use, copy, modify, merge, publish, distribute, sublicense,
       and/or sell copies of the Software, and to permit persons to whom the
       Software is furnished to do so, subject to the following conditions:

       The above copyright notice and this permission notice shall be included in
       all copies or substantial portions of the Software.

       THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
       IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
       FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
       AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
       LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
       FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
       DEALINGS IN THE SOFTWARE.

     Authors:
       * Geoff Stearns (geoff@deconcept.com)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

/**
 * Generic handling of version numbers based on a string representation of
 * major, minor and revision flags. A incoming version object can be compared
 * with the stored version string including checks to determine if this
 * version is smaller than or identical to the one stored.
 *
 * This class contains code based on the following work:<br/>
 *   SWFObject: Javascript Flash Player detection and embed script<br/>
 *   http://blog.deconcept.com/swfobject/<br/>
 *   Version: 1.4.4
 *
 * License:<br/>
 *   MIT: http://www.opensource.org/licenses/mit-license.php<br/>
 *   For more info, please see the corresponding source file.
 */
qx.Class.define("qx.util.Version",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param arrVersion {Array|String} array with three elements defining major,
   *   minor and revision number or an equivalent version string separated by '.'
   */
  construct : function(arrVersion)
  {
    this.base(arguments);

    if (typeof arrVersion === "string") {
      arrVersion = arrVersion.split(".");
    }

    this.__major = parseInt(arrVersion[0]) || 0;
    this.__minor = parseInt(arrVersion[1]) || 0;
    this.__rev = parseInt(arrVersion[2]) || 0;
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      DATA FIELDS
    ---------------------------------------------------------------------------
    */

    __major : 0,
    __minor : 0,
    __rev : 0,




    /*
    ---------------------------------------------------------------------------
      USER VERSION ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Comapres the Version with another version number.
     * Returns true if this version instance has a bigger version number
     *
     * @type member
     * @param fv {qx.util.Version} Version number to compare with
     * @return {Boolean} whether the version instance has a bigger version numbers.
     */
    versionIsValid : function(fv)
    {
      if (this.getMajor() < fv.getMajor()) return false;
      if (this.getMajor() > fv.getMajor()) return true;

      if (this.getMinor() < fv.getMinor()) return false;
      if (this.getMinor() > fv.getMinor()) return true;

      if (this.getRev() < fv.getRev()) return false;

      return true;
    },


    /**
     * Return major version number
     *
     * @type member
     * @return {String | Integer} major version number
     */
    getMajor : function() {
      return this.__major;
    },


    /**
     * Return minor version number
     *
     * @type member
     * @return {String | Integer} minor version number
     */
    getMinor : function() {
      return this.__minor;
    },


    /**
     * Return revision number
     *
     * @type member
     * @return {String | Integer} revision number
     */
    getRev : function() {
      return this.__rev;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__major", "__minor", "__rev");
  }
});
