# Comments
Upload to Rackspace as web site and to Rackspace CDN
to disable CDN comment the part in gulpfile 'html'  //CDN the resources 
set //$assetPath : "/fonts/"; in main.scss

Check Speed
https://developers.google.com/speed/pagespeed/insights/
sitespeed.io -u http://www.fin-alg.com/


Hold todo: 
- Not all images are optimized, can use cheerio to query all images and get the image size
- can convert more html part to special tags 
- Remove more parts unused parts of the CSS
- Check on different browsers
- Add SVG fallback http://callmenick.com/2014/04/02/svg-fallback-with-png/

- Tool used


Code changes
Removed

    <!-- build:js scripts/vendor/modernizr.js -->
    <script src="../bower_components/modernizr/modernizr.js"></script>
    <!-- endbuild -->
    
    
    <!-- build:js scripts/vendor.js -->
    <!-- bower:js -->
    <script src="../bower_components/jquery/dist/jquery.js"></script>
    <script src="../bower_components/photoswipe/dist/photoswipe.js"></script>
    <script src="../bower_components/photoswipe/dist/photoswipe-ui-default.js"></script>
    <!-- endbower -->
    <!-- endbuild -->
    


//Replace rubySass with sass 

npm install gulp-sass --save-dev
change gulpfile.js
.pipe($.rubySass({ to
.pipe($.sass({ to


//logo svg get destroyed by min so exclude them and use image-copy to pass them, used SVG Cleaner to clean and minimze them

gzip compression
D:\js\NewPaper\node_modules\apache-server-configs\dist\.htaccess
#Muly: add per rackspace support
#--mod_gzip rule to speed up serving content
<ifModule mod_gzip.c>
mod_gzip_on Yes
mod_gzip_dechunk Yes
mod_gzip_item_include file \.(html?|txt|css|js|php|pl)$
mod_gzip_item_include handler ^cgi-script$
mod_gzip_item_include mime ^text/.*
mod_gzip_item_include mime ^application/x-javascript.*
mod_gzip_item_exclude mime ^image/.*
mod_gzip_item_exclude rspheader ^Content-Encoding:.*gzip.*
</ifModule>


<IfModule mod_deflate.c>
  <FilesMatch "\\.(js|css|html|htm|php|xml|eot|svg)$">
    SetOutputFilter DEFLATE
  </FilesMatch>
  Header append Vary User-Agent env=!dont-vary
</IfModule>


D:\js\newpaper2\node_modules\gulp-local-screenshots\index.js

line: 12
  var url = opts.protocol + '://' +  opts.host + ':' + opts.port + '/' + filename;
  
line: 68
  opts.server = options.server || false;
  
https://github.com/danielhusar/gulp-local-screenshots/issues/3  




