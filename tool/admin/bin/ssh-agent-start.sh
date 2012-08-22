#!/bin/bash
#
# most of this script from:
# http://serverfault.com/questions/92683/execute-rsync-command-over-ssh-with-an-ssh-agent-via-crontab/92689#92689
#
# (thron7, 03nov11)

AGENT="ssh-agent -s"

# make path for env file
if [ ! -d $HOME/.ssh/agent ]; then
  mkdir -p $HOME/.ssh/agent
fi

# start the agent, capture env settings into env file
pid=`ps -u$LOGNAME | grep ssh-agent | awk '{print $1}'`
if [ -z "$pid" ]; then
  $AGENT | grep -v echo > $HOME/.ssh/agent/agent.env & pid=$!
  sleep 1 # give process time
fi

# add private ssh key - this will prompt for the passphrase!
ssh-add
