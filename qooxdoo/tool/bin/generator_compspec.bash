#!/bin/bash
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
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
#
# CAVEATS
#  - It's slow (mainly due to the initial generate.py invokation that parses
#    all relevant config files)
##

shopt -s extglob

# function to extract targets
_generator_targets () {

  # check for config file option
  local confOpt=
  for i in $(seq 0 $((${#COMP_WORDS[@]} - 1)))
  do
    if [ "${COMP_WORDS[$i]}" == "-c" ]
    then
      confOpt="-c ${COMP_WORDS[$(($i + 1))]}"
      break
    fi
  done

  COMPREPLY=( $( ./generate.py ${confOpt} x 2>/dev/null |  # generate raw target list
                  grep "^  - "|                            # targets start wit "  - "
                  grep -v "::" |                           # filter imported targets
                  sed 's/^  - \([^ ][^ ]*\)\b.*$/\1/'|     # strip everything but the target name
                  grep "^${COMP_WORDS[$COMP_CWORD]}"|      # match against beginning of current CWORD
                  sort
                ) )
}
complete -o bashdefault -o default -F _generator_targets generator.py generate.py gen
