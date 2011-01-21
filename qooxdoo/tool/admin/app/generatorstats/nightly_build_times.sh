#!/bin/bash

# Run from cron, run the nightly update of the build stats

# read yesterday's log
#update=`/usr/bin/python $generatorstats/nightly_build_times.py harvest`
update=`echo rrdtool update nightly_builds.rrd 1295470801:239:1598:214:431:434:168:121:240`
if [ $? eq 0 ]; then
    echo $update >> update.log
else
    echo "Error updating nightly_builds.rrd: ", $update
fi
