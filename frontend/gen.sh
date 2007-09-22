for client in mshtml gecko; do

framework/tool/generator.py \
--class-path framework/source/class/ --cache-directory framework/.cache/ \
--generate-compiled-script --compiled-script-file $1_$client.js --optimize-variables \
--print-includes --use-variant qx.debug:off --use-variant qx.client:$client \
--use-variant qx.aspects:off --use-variant qx.deprecationWarnings:off \
--include $2 && \
gzip -c $1_$client.js > $1_$client.js.gz || exit 1

done


