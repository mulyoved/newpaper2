var cheerio = require('cheerio');
var sizeOf = require('image-size');
var marked = require("marked");
var Remarkable = require('remarkable');
var md = new Remarkable({
  html:         true,        // Enable HTML tags in source
  xhtmlOut:     true,        // Use '/' to close single tags (<br />)
  breaks:       true,        // Convert '\n' in paragraphs into <br>
  linkify:      false,        // Autoconvert URL-like text to links

  // Enable some language-neutral replacement + quotes beautification
  typographer:  false,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
  quotes: '“”‘’',

  // Highlighter function. Should return escaped HTML,
  // or '' if the source string is not changed
  highlight: function (/*str, lang*/) { return ''; }
});
var he = require("he");


marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: false,
  tables: false,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});


module.exports = function ($) {
  //console.log('version4');

  var qs = $('q');
  if (qs.length > 0) {
    //console.log(q);
    var id = 1;
    qs.each( function(index, element) {
      var q = $(this);
      var a = q.next();
      var faq = {
        question: q.html(),
        answer: a.html()
      };

      var qContent = $(
        '<a name="faq' + +id + '"></a>'+
        '<input id="toggle'+id+'" type="radio" name="toggle"/>'+
        '<label for="toggle'+id+'">'+faq.question+'</label>');

      q.replaceWith( qContent );

      if (faq.answer) {
        var decode = he.decode(faq.answer);
        var markedText = md.render(decode);

        $c = cheerio.load(markedText);
        var imageList = $c('img');
        if (imageList.length > 0) {
          $c('img').each(function (index, element) {
            var i = $(this);

            var img = {
              src: i.attr('src'),
              width: i.attr('width'),
              height: i.attr('height')
            };


            //from
            //<img src="/images/faq/tposplitandunplit.jpg" width="480" height="352">

            //to
            //<a href="/images/marketbalance/MarketBalance1.png" data-size="1000x790" class="screenshot-gallery__img--main">
            //<img src="/images/marketbalance/thumbnails/MarketBalance1.png" alt=""  class="gallery-large-image">
            //<figure>Delta View.</figure>
            //</a>

            var dimensions = sizeOf('app' + img.src);
            //console.log(dimensions.width, dimensions.height);

            var imgContent =
              '<div class="screenshot-gallery" data-pswp-uid="1" data-author="">' +
              '<a href="' + img.src + '" data-size="'+dimensions.width+ 'x' + dimensions.height + '" class="screenshot-gallery__img--main">' +
              '<img src="' + img.src + '" alt="" width="' + img.width + '" height="' + img.height + '">' +
              '<figure>' + faq.question + '</figure>' +
              '</div>';

            i.replaceWith(imgContent);
          });
        }
        markedText = $c.html();

        var aContent = $('<section>' + markedText + '</section>');

        a.replaceWith(aContent);
        id++;
      }
    });
    //console.log(a);
  }
};
