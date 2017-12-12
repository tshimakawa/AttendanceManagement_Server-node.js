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

  connection.query(`SELECT student_id,name FROM student WHERE uuid = "${uuid}"`,function(error,result,fields){//UUIDから学生IDを取得
    if(error) {//データベース検索時にエラーが発生した場合
      throw error;
      response = {
        header:{
          status:"DB error",
          responseCode:1
        },
        response:null
      };
      res.send(JSON.stringify(response));
    }else if(result.length == 1){//UUIDから学生IDを取得できた場合
      const response = {
        header:{
          status:"success",
          responseCode:0
        },
        response:{
          studentID:result[0].student_id,
          studentName:result[0].name
        }
      };
      res.send(JSON.stringify(response));
    }else{//UUIDから学生IDを取得できなかった場合
      response = {
        header:{
          status:"cannot get studentID",
          responseCode:2
        },
        response:null
      };
      res.send(JSON.stringify(response));
    }
  });
});

module.exports = router;
