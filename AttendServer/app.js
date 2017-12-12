const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const mysql = require('mysql');
const domain = require('express-domain-middleware');

const index = require('./routes/index');
const checkRegistered = require('./routes/checkRegistered');
const getStudentInfo = require('./routes/getStudentInfo');
const getClassRoom = require('./routes/getClassRoom');
const getLectureInfo = require('./routes/getLectureInfo');
const registerStudent = require('./routes/registerStudent');
const writeAttend = require('./routes/writeAttend');
const writeLeave = require('./routes/writeLeave');
const getLectureList = require('./routes/getLectureList');
const getHistoryDetail = require('./routes/getHistoryDetail');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(domain);

//ルーティングの設定 各エンドポイントに対応したルーティング先に誘導
app.use('/', index);
app.use('/checkRegistered',checkRegistered);
app.use('/getStudentInfo',getStudentInfo);
app.use('/getClassRoom',getClassRoom);
app.use('/getLectureInfo',getLectureInfo);
app.use('/registerStudent',registerStudent);
app.use('/writeAttend',writeAttend);
app.use('/writeLeave',writeLeave);
app.use('/getLectureList',getLectureList);
app.use('/getHistoryDetail',getHistoryDetail);

//HTTPS通信で使用するためのSSLキーを設定
const ssloptions = {
        key: fs.readFileSync ('./sslKey/privkey5.pem'),
        cert: fs.readFileSync('./sslKey/cert5.pem'),
        ca: [fs.readFileSync('./sslKey/chain5.pem'), fs.readFileSync('./sslKey/fullchain5.pem','utf-8')],
requestCert: true,
rejectUnauthorized: false
};


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// ポート設定
// app.set('httpsport', process.env.PORT || 45000);

// サーバ立ち上げ

app.listen(45000, ()=> {
  console.log('Attendance Server');
});
// var server = https.createServer(ssloptions,app).listen(app.get('httpsport'), function(){
//     console.log('Express HTTPS server listening on port ' + app.get('httpsport'));
// });

module.exports = app;
