framework/tool/generator.py \
--class-path framework/source/class/ --cache-directory framework/.cache/ \
--generate-compiled-script --compiled-script-file $1.js --optimize-variables \
--print-includes --use-variant qx.debug:off \
--include $2

gzip -c $1.js > $1.js.gz
