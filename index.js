var map = require('map-stream');
var stylus = require('accord').load('stylus');
var rext = require('replace-ext');
var path = require('path');

module.exports = function (options) {
  var opts = options ? options : {};

  function stylusstream (file, cb) {

    if (file.isNull()) return cb(null, file); // pass along
    if (file.isStream()) return cb(new Error("gulp-stylus: Streaming not supported"));
    if (path.extname(file.path) === '.css') return cb(null, file);

    if (!opts.filename)
      opts.filename = file.path;

    // Execute stylus render and handle its errors within a domain
    var domain = require('domain').create();

    domain.on('error', function(err) {
      console.log(err.toString()); // Display caught errors safely
      cb(null);
    });
    domain.run(function() {
      stylus.render(file.contents.toString('utf8'), opts)
      .done(function(css){
        file.path = rext(file.path, '.css');
        file.contents = new Buffer(css);
        cb(null, file);
      });
    });
  }

  return map(stylusstream);
};
