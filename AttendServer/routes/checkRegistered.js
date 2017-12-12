const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const bodyParser = require('body-parser');

const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'attend_admin',
  password : 'light12345',
  database : 'attendance_platform_db'
});

router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json());

/* GETリクエストに対する処理 */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
/*POSTリクエストに対する処理*/
router.post('/',function(req,res){
  const uuid = req.body.header.uuid;
  const os = req.body.request.os;
  const appVersion = req.body.request.appVersion;
  const buildVersion = req.body.request.buildVersion;
  let response = {};

  connection.query(`SELECT appVersion,buildVersion FROM application WHERE os = "${os}"`,function(error,result,fields){
    if (error) throw error;
    if (buildVersion != result[0].buildVersion){//アプリケーションが最新でなかった場合
      response = {
        header:{
          status:"appVersion old",
          responseCode:2
        },
        response:null
      };
      res.send(JSON.stringify(response));
    }else{//アプリケーションが最新の場合
      connection.query(`SELECT name FROM student WHERE uuid = "${uuid}"`,function(error,result,fields){
        if (error) throw error;
        if (result.length == 0){//uuidが登録されていなかった場合
          response = {
            header:{
              status:"unregistered",
              responseCode:1
            },
            response:null
          };
        }else if (result.length == 1){//uuidが登録されていた場合
          response = {
            header:{
              status:"already registered",
              responseCode:0
            },
            response:null
          };
        }else{//それ以外の場合（システム設計的にあってはいけない）
          response = {
            header:{
              status:"error",
              responseCode:3
            },
            response:null
          };
        }
        res.send(JSON.stringify(response));
      });
    }
  });
});

module.exports = router;
