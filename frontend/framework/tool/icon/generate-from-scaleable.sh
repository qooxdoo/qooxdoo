SIZES="16 22 24 32 48 64 72 96 128"
FORMAT=png

INPUT=themes/freedesktop/scalable
OUTPUT=themes/freedesktop/use

for THEME in `find $INPUT -maxdepth 1 -mindepth 1 -type d ! -name .svn`
do
  THEMENAME=`basename $THEME`
  echo $THEMENAME

  mkdir -p $OUTPUT

  for DIR in `find ${THEME}/scalable -maxdepth 1 -mindepth 1 -type d ! -name .svn`
  do
    CAT=`basename $DIR`
    echo ">>> ${THEMENAME}/${CAT}"

    echo "  * Creating directories..."
    for SIZE in $SIZES; do
      mkdir -p ${OUTPUT}/${THEMENAME}/${SIZE}x${SIZE}/${CAT}
    done

    echo "  * Rendering files..."
    for SVG in `find $DIR -name "*.svg"`
    do
      SVGNAME=`basename $SVG`
      RENNAME=`echo $SVGNAME | sed s:svg:$FORMAT:g`

      # echo "    - $SVGNAME -> $RENNAME"
      for SIZE in $SIZES; do
        rsvg-convert $SVG -o ${OUTPUT}/${THEMENAME}/${SIZE}x${SIZE}/${CAT}/${RENNAME} -a -w $SIZE -h $SIZE -f $FORMAT
      done
    done
  done
done
