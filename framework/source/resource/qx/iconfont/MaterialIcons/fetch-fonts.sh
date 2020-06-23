#!/bin/sh
#https://fonts.gstatic.com/s/materialiconsoutlined/v18/gok-H7zzDkdnRel8-DQ6KAXJ69wP1tGnf4ZGhUcel5euIg.woff2
get () {
    curl -s -A "$1" 'https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Sharp|Material+Icons+Round|Material+Icons+Two+Tone' | perl -n -e 'if (m{url\((\S+?)(material[^/]+)/([^/]+)(/\S+?)\.(\S+?)\)}) { my $loc = $1;my $name = $2;my $v = $3;my $rest=$4; $ext = $5;system "curl $loc$name/$v/$rest.$ext > $name-$v.$ext\n"}'
}

get 'fallback'
# iphone
get 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
# edge
get 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246'
# IE10
get 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)'


 