#!/bin/sh
#
# Updates the catalog website:
#
#  1) update the checkouts
#  2) recreate the contribindex
#  3) overwrite hostable dir with copy from the checkout
#  4) optional: if 'sync' was provided as argument also sync content
#

set -e             # fail fast
# SAME AS => set -o errexit
set -u             # no unintialized vars
# SAME AS => set -o nounset

CHECKOUT_CATALOG="contrib-catalog.git"
CHECKOUT_PLATFORM="contrib-platform.git"
PATH_INFRASTRUCTURE="catalog-webinterface/infrastructure"
PATH_WEBSITE_SRC="catalog-webinterface/website"
PATH_WEBSITE_TRG="catalog"
FILE_GENERATE_PY=${PATH_WEBSITE_TRG}/generate.py
FILE_CONFIG_JSON=${PATH_WEBSITE_TRG}/config.json
CMD_RSYNC="/usr/bin/rsync --verbose --checksum --recursive --delete --inplace --links --safe-links --exclude='.git*' "

# update clones
pushd ${CHECKOUT_CATALOG} && git pull --rebase && popd >> /dev/null
pushd ${CHECKOUT_PLATFORM} && git pull --rebase && popd >> /dev/null
echo "Done. Updated Git repos."

# recreate index
pushd ${CHECKOUT_PLATFORM}/${PATH_INFRASTRUCTURE} && ./create-contrib-index.py && popd >> /dev/null

# overwrite hostable dir with a copy from the checkout and tailor it (rm unneeded files)
cp -R ${CHECKOUT_PLATFORM}/${PATH_WEBSITE_SRC}/* ${PATH_WEBSITE_TRG}
[[ -f ${FILE_GENERATE_PY} ]] && rm ${FILE_GENERATE_PY}
[[ -f ${FILE_CONFIG_JSON} ]] && rm ${FILE_CONFIG_JSON}
echo "Done. Copied tailored hostable dir to '${PATH_WEBSITE_TRG}'."

# check if expected files exist
if [[ -s ${PATH_WEBSITE_TRG} && -s ${PATH_WEBSITE_TRG}/index.html ]] && \
   [[ -s ${PATH_WEBSITE_TRG}/css ]] && [[ ${PATH_WEBSITE_TRG}/css/main.css ]] && \
   [[ -s ${PATH_WEBSITE_TRG}/json ]] &&  [[ -s ${PATH_WEBSITE_TRG}/json/contribindex.json ]] && \
   [[ -s ${PATH_WEBSITE_TRG}/script ]] &&  [[ -s ${PATH_WEBSITE_TRG}/script/main.js ]]; then
  echo "Done. Website files look ok."

  # additionally sync the website if 'sync' as argument provided
  if [[ $# -eq 1 && $1 == "sync" ]]; then
    ${CMD_RSYNC} /var/www/qooxdoo/contrib/catalog/ qooxdoo@webtechfe01.schlund.de:/var/www/qooxdoo/contrib/catalog/
    echo "Done. Updated content on production host."
  fi
fi


