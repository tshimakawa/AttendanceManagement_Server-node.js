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
  const studentID = req.body.request.studentID;
  const name = req.body.request.name;
  let response = {};//リクエストに対するレスポンスを格納する連想配列 これをレスポンスのbodyとして返す
  connection.query(`SELECT name FROM student WHERE student_id = "${studentID}"`,function(error,result,fields){
    if (error) throw error;
    if (result.length == 0){//入力された学籍番号が登録されていない
      connection.query(`INSERT INTO student(student_id,name,uuid) VALUES("${studentID}","${name}","${uuid}")`,function(error,result,fields){
        if (error) throw error;
        response = {
          header:{
            status:"resistration success",
            responseCode:0
          },
          response:null
        };
        res.send(JSON.stringify(response));
      });
    }else if (result.length == 1){//入力された学籍番号がすでに登録されている
      response = {
        header:{
          status:"unregistered",
          responseCode:2
        },
        response:{
          studentName:result[0].name
        }
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
});

module.exports = router;
