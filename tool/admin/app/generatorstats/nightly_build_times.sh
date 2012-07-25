#!/bin/bash

##
# Run from cron, run the nightly update of the build stats
##

# - Config section -------------------------------------------------------------
generatorstats=/home/qooxdoo/workspace/qooxdoo.git/tool/admin/app/generatorstats
logdir=/home/qooxdoo/workspace/githop/git.qooxdoo.generator-stats
# suck in ssh-agent stuff, for git push
. $HOME/.ssh/agent/agent.env
# - Config end -----------------------------------------------------------------

# chdir, so that relative paths (e.g. to *.rrd) are correct
cd $generatorstats

# read yesterday's log
update=`/usr/bin/python $generatorstats/nightly_build_times.py harvest`
if [ $? -eq 0 ]; then
    echo $update >> $logdir/update.log
    cd $logdir
    git commit -am"[BUG #4514] updated stats log"
    sleep 3
    git push
    cd $generatorstats
else
    echo "Error running: ", $update
fi

# Re-create graph images
/usr/bin/python $generatorstats/nightly_build_times.py graph > /dev/null
