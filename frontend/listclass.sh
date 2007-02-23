find framework/source/class/qx/ application/*/source/class -name "*.js" | xargs grep "qx.Class" | cut -d":" -f1 | uniq

