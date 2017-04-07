'use strict';
var express = require('express');
var timeout = require('connect-timeout');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var training = require('./router/training');
var AV = require('leanengine');
var util = require('./util');
// const user = require('./router/user');
const requirements = require('./router/requirements');
var fs = require('fs');

var multipart = require('connect-multiparty');


var app = global.app = express();




// 设置模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(timeout('25s'));
app.use(multipart()); // Replace for depricated connect.bodyParser()






// 加载云函数定义
require('./cloud');
// 加载云引擎中间件
app.use(AV.express());
app.use(AV.Cloud.CookieSession({secret: 'training', maxAge: 3600000 * 48, fetchUser: true}));
// 设置默认超时时间
app.all(/\/(?!login|index[.]).*html$/, function (req, res, next) {
  var url = req.originalUrl;
  // console.log(url);
  if (!req.currentUser) {
    res.redirect("/index.html");
  } else {
    next();
  }
});

app.all(/\/v1\/.*$/, function (req, res, next) {
  if (!req.currentUser) {
    return res.send({
        code:util.ERROR.LOGIN_TIMEOUT,
        message:'请先登录后再操作'
    });
  } else {
    next();
  }
});

app.use(express.static('public'));

app.use(bodyParser());
// app.use(express.bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use(cookieParser());

//app.get('/', function(req, res) {
//  res.render('index', { currentTime: new Date() });
//});

// 可以将一类的路由单独保存在一个文件中




app.use('/',require('./router/user'));
app.use('/v1/training', training);
app.use('/v1/requirements', requirements);
app.use('/v1/willingness', require('./router/willingness'));
app.use('/v1/comments', require('./router/comments'));
app.use('/v1/thumbUp', require('./router/thumbUp'));
app.use('/v1/upload',require('./router/uploadImg'));
app.use('/v1/rank',require('./router/rank'));
app.use('/v1/notification',require('./router/notification'));
app.use('/client',require('./router/mock'))





app.use(function(req,res,next){
  //var url = req.originalUrl;
  //console.log(url);
  next();
});

app.use(function(req, res, next) {
  // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器
  if (!res.headersSent) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }else{
    next();
  }
});







// error handlers
app.use(function(err, req, res, next) { // jshint ignore:line
  var statusCode = err.status || 500;
  if(statusCode === 500) {
    console.error(err.stack || err);
  }
  if(req.timedout) {
    console.error('请求超时: url=%s, timeout=%d, 请确认方法执行耗时很长，或没有正确的 response 回调。', req.originalUrl, err.timeout);
  }
  res.status(statusCode);
  // 默认不输出异常详情
  var error = {};
  if (app.get('env') === 'development') {
    // 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
    error = err;
  }
  res.render('error', {
    message: err.message,
    error: error
  });
});



module.exports = app;
