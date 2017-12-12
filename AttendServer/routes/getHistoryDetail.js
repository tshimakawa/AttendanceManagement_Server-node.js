const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const bodyParser = require('body-parser');
const allmodule = require('../public/javascripts');

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
  const lectureID = req.body.request.lecture_id;

  let lectureHistory = [];
  let response = {};

  connection.query(`SELECT student_id FROM student WHERE uuid = "${uuid}"`,function(error,result,fields){//UUIDから学生IDを取得
    if(error){//データベース検索時にエラーが発生した場合
      throw error;
      response = {
        header:{
          status:"DB error",
          responseCode:1
        },
        response:null
      };
      res.send(JSON.stringify(response));
    }
    else if(result.length == 1){//uuidから学生の学籍番号を取得できた場合
      const studentID = result[0].student_id;
      connection.query(`SELECT DISTINCT date FROM attendance_data WHERE lecture_id =${lectureID}`,function(error,result_date,fields){//該当講義の全講義日を取得
        if(error){//データベース検索時にエラーが発生した場合
          throw error;
          response = {
            header:{
              status:"DB error",
              responseCode:1
            },
            response:null
          };
          res.send(JSON.stringify(response));
        }else{//該当講義の全講義日を取得できた場合
          for(let count = 0;count < result_date.length;count++){
            result_date[count].date = formatDate(result_date[count].date, 'yyyy-MM-dd');//取得した講義日のフォーマットを変更

            let lectureDateHistory = {};
            connection.query(`SELECT time FROM attendance_data WHERE student_id="${studentID}" AND date ="${result_date[count].date}"`,function(error,result_time,fields){//全講義日のうち学生が出席した講義日と出席時間・退室時間を取得
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
              }else if(result_time.length == 0){//講義日に学生が出席していなかった場合
                lectureDateHistory ={
                  date:result_date[count].date,
                  time:[]
                };
              }else if (result_time.length == 1) {//講義日に学生が出席していた場合
                lectureDateHistory ={
                  date:result_date[count].date,
                  time:[result_time[0].time]
                };
              }else if (result_time.length == 2) {//講義日に学生が退室までしていた場合
                lectureDateHistory ={
                  date:result_date[count].date,
                  time:[result_time[0].time,result_time[1].time]
                };
              }else{//それ以外の場合（システム設計的にあってはいけない）
                throw error;
                response = {
                  header:{
                    status:"cannot get attendTime",
                    responseCode:3
                  },
                  response:null
                };
                res.send(JSON.stringify(response));
              }
              lectureHistory.push(lectureDateHistory);
              if(count == result_date.length-1){
                const response = {
                  header:{
                    status:"success",
                    responseCode:0
                  },
                  response:lectureHistory
                };
                res.send(JSON.stringify(response));
              }
            });
          }
        }
      });
    }else{//uuidから学生の学籍番号を取得できなかった場合
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

function formatDate (date, format) {
  format = format.replace(/yyyy/g, date.getFullYear());
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
  format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
  format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
  return format;
};

module.exports = router;
