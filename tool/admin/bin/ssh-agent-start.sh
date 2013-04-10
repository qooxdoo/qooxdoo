#!/bin/bash
#
# most of this script from:
# http://serverfault.com/questions/92683/execute-rsync-command-over-ssh-with-an-ssh-agent-via-crontab/92689#92689
#
# hint: log in *without* agent forwarding
#
# (thron7, 03nov11)

AGENT="ssh-agent -s"
AGENT_ENV="$HOME/.ssh/agent/agent.env"

# make path for env file
if [ ! -d `dirname $AGENT_ENV` ]; then
  mkdir -p `dirname $AGENT_ENV`
fi

# start the agent, capture env settings into env file
pid=`ps -u$LOGNAME | grep -v ssh-agent-start | grep ssh-agent | awk '{print $1}'`
if [ -z "$pid" ]; then
  $AGENT | grep -v echo > $AGENT_ENV  & pid=$!
  echo "agent started $pid"
  sleep 1 # give process time
fi

# need agent settings for next
source $AGENT_ENV
# add private ssh key - this will prompt for the passphrase!
ssh-add
