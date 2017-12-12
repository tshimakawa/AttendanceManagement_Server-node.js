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
  const major = req.body.request.major;
  let response = {};

  connection.query(`SELECT room FROM room_beacon WHERE major = "${major}"`,function(error,result,fields){
    if(error) throw error;
    if(result.length == 1){//送信されてきたmajorがデータベースに登録されていた場合
      response = {
        header:{
          status:"success",
          responseCode:0
        },
        response:{
          room:result[0].room
        }
      };
    }else if (result.length == 0) {//送信されてきたmajorがデータベースに登録されていなかった場合
      response = {
        header:{
          status:"room unregistered",
          responseCode:2
        },
        response:null
      };
    }else {////送信されてきたmajorが重複して登録されていた場合
      response = {
        header:{
          status:"System error",
          responseCode:3
        },
        response:null
      };
    }
    res.send(JSON.stringify(response));
  });
});

module.exports = router;
