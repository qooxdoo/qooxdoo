SIZES="16 22 24 32 48 64 72 96 128"
FORMAT=png
DIR=$1
THEME=`basename $DIR`
OUTPUT=themes/freedesktop/${THEME}

mkdir -p $OUTPUT

for DIR in `find ${DIR}/scalable -maxdepth 1 -mindepth 1 -type d`
do
  CAT=`basename $DIR`
  echo ">>> ${THEME}/${CAT}"

  echo "  - Creating directories..."
  for SIZE in $SIZES
  do
    mkdir -p ${OUTPUT}/${CAT}/${SIZE}x${SIZE}
  done

  echo "  - Rendering files..."
  for SVG in `find $DIR -name "*.svg"`
  do
    SVGNAME=`basename $SVG`
    RENNAME=`echo $SVGNAME | sed s:svg:$FORMAT:g`

    echo "    - $SVGNAME -> $RENNAME"
    for SIZE in $SIZES
    do
      rsvg-convert $SVG -o ${OUTPUT}/${SIZE}x${SIZE}/${CAT}/${RENNAME} -a -w $SIZE -h $SIZE -f $FORMAT
    done
  done
done
