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
    var id = 2;
    qs.each( function(index, element) {
      var q = $(this);
      var a = q.next();
      var faq = {
        question: q.html(),
        answer: a.html()
      };

      var qContent = $('<input id="toggle'+id+'" type="radio" name="toggle"/>'+
      '<label for="toggle'+id+'">'+faq.question+'</label>');

      q.replaceWith( qContent );

      var decode = he.decode(faq.answer);
      var markedText = md.render(decode);
      var aContent = $('<section>'+markedText+'</section>');

      a.replaceWith( aContent );
      id++;
    });
    //console.log(a);
  }
};
