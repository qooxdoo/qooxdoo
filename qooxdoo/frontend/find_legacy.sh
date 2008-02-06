for js in `find framework/source/class application/*/source/class -name "*.js" | grep -v legacy`; do
  grep "qx.legacy" $js > /dev/null && echo "Class $js: Use of legacy detected!"
done
