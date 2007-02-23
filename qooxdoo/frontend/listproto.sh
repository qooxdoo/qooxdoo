find framework/source/class/qx/ application/*/source/class -name "*.js" | xargs grep "qx.Proto" | cut -d":" -f1 | uniq

