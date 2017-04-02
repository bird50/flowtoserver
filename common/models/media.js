'use strict';

module.exports = function(Media) {
 var qt = require('quickthumb');

    Media.afterRemote('upload', function(ctx, res, next) {

        var file = res.result.files.file[0];
        var file_path = "./uploads/" + file.container + "/" + file.name;
        var file_thumb_path = "./uploads/" + file.container + "/thumb/" + file.name;
		var file_mid_path = "./uploads/" + file.container + "/mid/" + file.name;

        qt.convert({
            src: file_path,
            dst: file_thumb_path,
            width: 100
        }, function (err, path) {
           
        });
        qt.convert({
            src: file_path,
            dst: file_mid_path,
            width: 400
        }, function (err, path) {
           
        });
        
        next();
    });
};
