#!/bin/bash
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2009 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# NAME
#  generator_compspec.bash  -- a Bash COMPSPEC file to allow tab completion of generator targets
#
# USAGE
#  Source this file in your Bash (e.g. in .bashrc). Then, in a skeleton style app
#  type "./generate.py <TAB><TAB>" to get an overview of the available generator
#  targets, or to complete a target after a few characters.
##

shopt -s extglob

_generator_targets () {
   COMPREPLY=( $( ./generate.py x 2>/dev/null |
                  grep "^  - "|
                  grep -v "::" |
                  sed 's/^  - //'|
                  sed 's/^\([^ ][^ ]*\) .*$/\1/'|
                  grep "^${COMP_WORDS[$COMP_CWORD]}"|
                  sort
                ) )
}
complete -F _generator_targets generator.py generate.py
