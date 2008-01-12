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
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(html)

************************************************************************ */

/**
 * This class is comparable to {@link qx.html.Element} but uses
 * an edit distance based algorithm to reflect children
 * modifications to the DOM.
 *
 * The fast syncronisation of {@link qx.html.Element} is built
 * upon simple index comparison and produces less overhead than
 * the edit distance logic by bringing comparable
 * results. Often the number of DOM transactions is
 * equal. Sometimes one of them uses slightly more
 * DOM transactions.
 *
 * Especially interesting is that the edit distance
 * based algorithm is sometimes not as good as the more
 * basic index based approach. The reason for this
 * is that edit distance based models are not thought
 * out for reference types. For typical moves
 * the edit distance creates two actions were normally
 * only one is needed.
 *
 * Choose one or the other depending on your induvidual needs.
 * Generally {qx.html.Element} is the better choice.
 */
qx.Class.define("qx.html.ElementDistance",
{
  extend : qx.html.Element,

  members :
  {
    /**
     * Apply the DOM structure of the given parent. Used edit distance
     * algorithm which means quadratic, more intensive computing but may
     * reduce the number of DOM transactions needed.
     *
     * @type static
     * @param obj {qx.html.Element} the element to syncronize
     * @return {void}
     */
    _syncChildren : function(obj)
    {
      if (qx.core.Variant.isSet("qx.domEditDistance", "on"))
      {
        // **********************************************************************
        //   Compute needed operations
        // **********************************************************************

        var domElement = obj._element;
        var source = domElement.childNodes;
        var target = [];
        for (var i=0, ch=obj._children, cl=ch.length; i<cl; i++)
        {
          if (ch[i]._included) {
            target.push(ch[i]._element);
          }
        }

        // Compute edit operations
        var operations = qx.util.EditDistance.getEditOperations(source, target);

        /*
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          // We need to convert the collection to an array otherwise
          // FireBug sometimes will display a live view of the DOM and not the
          // the snapshot at this moment.
          source = qx.lang.Array.fromCollection(source);

          console.log("Source: ", source.length + ": ", source);
          console.log("Target: ", target.length + ": ", target);
          console.log("Operations: ", operations);
        }
        */



        // **********************************************************************
        //   Process operations
        // **********************************************************************
        var job;
        var domOperations = 0;

        // Store offsets which are a result of element moves
        var offsets = [];

        for (var i=0, l=operations.length; i<l; i++)
        {
          job = operations[i];



          // ********************************************************************
          //   Apply offset
          // ********************************************************************
          if (offsets[job.pos] !== undefined)
          {
            job.pos -= offsets[job.pos];

            // We need to be sure that we don't get negative indexes.
            // This will otherwise break array/collection index access.
            if (job.pos < 0) {
              job.pos = 0;
            }
          }



          // ********************************************************************
          //   Process DOM
          // ********************************************************************
          if (job.operation === qx.util.EditDistance.OPERATION_DELETE)
          {
            // Ignore elements which are not placed at their original position anymore.
            if (domElement.childNodes[job.pos] === job.old)
            {
              // console.log("Remove: ", job.old);
              domElement.removeChild(job.old);
              domOperations++;
            }
          }
          else
          {
            // Operations: insert and replace
            // ******************************************************************
            //   Offset calculation
            // ******************************************************************
            // Element will be moved around in the same parent
            // We use the element on its old position and scan
            // to the begin. A counter will increment on each
            // step.
            //
            // This way we get the index of the element
            // from the beginning.
            //
            // After this we increment the offset of all affected
            // children (the following ones) until we reached the
            // current position in our operation modified. The reason
            // we stop at this point is that the following
            // childrens should already be placed correctly through
            // the operation method from the end to begin of the
            // edit distance algorithm.
            if (job.value.parentNode === domElement)
            {
              // find the position/index where the element is stored currently
              previousIndex = -1;
              iterator = job.value;

              do
              {
                previousIndex++;
                iterator = iterator.previousSibling;
              }
              while (iterator);

              // increment all affected offsets
              for (var j=previousIndex+1; j<=job.pos; j++)
              {
                if (offsets[j] === undefined) {
                  offsets[j] = 1;
                } else {
                  offsets[j]++;
                }
              }
            }



            // ******************************************************************
            //   The real DOM work
            // ******************************************************************
            if (job.operation === qx.util.EditDistance.OPERATION_REPLACE)
            {
              if (domElement.childNodes[job.pos] === job.old)
              {
                // console.log("Replace: ", job.old, " with ", job.value);
                domElement.replaceChild(job.value, job.old);
                domOperations++;
              }
              else
              {
                // console.log("Pseudo replace: ", job.old, " with ", job.value);
                job.operation = qx.util.EditDistance.OPERATION_INSERT;
              }
            }

            if (job.operation === qx.util.EditDistance.OPERATION_INSERT)
            {
              var before = domElement.childNodes[job.pos];

              if (before)
              {
                // console.log("Insert: ", job.value, " at: ", job.pos);
                domElement.insertBefore(job.value, before);
                domOperations++;
              }
              else
              {
                // console.log("Append: ", job.value);
                domElement.appendChild(job.value);
                domOperations++;
              }
            }
          }
        }

        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (this._debug) {
            console.debug("  - Modified DOM with " + domOperations + " operations (editdistance)");
          }
        }
      }
    }
  }
});
