#!/bin/bash
# prints branch:<lastcommit>
m1=($( git branch -v |grep "^*"|cut -d" " -f2- ))
echo ${m1[0]}:${m1[1]}
