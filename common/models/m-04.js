'use strict';

module.exports = function(M04) {
    M04.remoteMethod(
    'test', 
    {
    	accepts: {arg: 'id', type: 'number', required: true},
        http: {path: '/:id/gotest', verb: 'get'},
        returns: {arg: 'test2', type: 'string'}
    });
    
    M04.test=function(id,cb){
        cb(null,id+" asdf");
    };
	
    M04.remoteMethod(
    'hellome', 
    {
    	accepts: {arg: 'id', type: 'number', required:false},
        http: {path: '/hello', verb: 'get'},
        returns: {arg: 'say', type: 'object'}
    });
    
    M04.hellome=function(id,cb){
	    var ds = M04.dataSource;
	          var sql = "SELECT * FROM m04 WHERE id=?";
			  var params=[id];
	          ds.connector.query(sql, params, function (err, theresult) {

	              if (err) console.error(err);

	              cb(err, theresult);

	          });
		
       // cb(null,"hello world");
    };

};

 
