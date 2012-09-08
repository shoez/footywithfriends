

module.exports = function (app, io) {


    app.get('/sys-info/polling', function(req, res){
		res.header("Content-Type", "text/javascript");
		res.end(JSON.stringify(DEFAULT_POLLING));
    });



};




