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

  const lectureList = [];
  let response = {};

  connection.query(`SELECT student_id FROM student WHERE uuid = "${uuid}"`,function(error,result,fields){//UUIDから学生IDを取得
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
    }else if(result.length == 1){//uuidから学生の学籍番号を取得できた場合
      const studentID = result[0].student_id;
      connection.query(`SELECT lecture_id FROM lecture_student WHERE student_id="${studentID}"`,function(error,result_lectureID,fields){//該当学生が受講している全講義を受講者リストから取得
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
        }else if(result_lectureID.length != 0){//学生が受講している全講義のlectureIDを取得できた場合
          for(let count=0;count<result_lectureID.length;count++){
            let lectureInfo = {};
            connection.query(`SELECT subject,prof_id FROM lecture WHERE lecture_id="${result_lectureID[count].lecture_id}"`,function(error,result_subject,fields){//取得したlectureIDから各講義の講義名，教員IDを取得
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
              }else if(result_subject.length == 1){//lectureIDから講義名，教員IDを取得できた場合
                connection.query(`SELECT name FROM prof WHERE prof_id="${result_subject[0].prof_id}"`,function(error,result_profName,fields){//取得した教員IDから教員名を取得
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
                  }else if(result_profName.length == 1){//教員IDから教員名を取得できた場合
                    lectureInfo.profName = result_profName[0].name;
                    lectureInfo.subject = result_subject[0].subject;
                    lectureInfo.lectureID = result_lectureID[count].lecture_id;
                    lectureList.push(lectureInfo);
                    if(count == result_lectureID.length-1){
                      const response = {
                        header:{
                          status:"success",
                          responseCode:0
                        },
                        response:lectureList
                      };
                      res.send(JSON.stringify(response));
                    }
                  }else{//教員IDから教員名を取得できなかった場合
                    response = {
                      header:{
                        status:"cannot get profName",
                        responseCode:3
                      },
                      response:null
                    };
                    res.send(JSON.stringify(response));
                  }
                });
              }else{
                response = {
                  header:{
                    status:"cannot get subject,profID",
                    responseCode:3
                  },
                  response:null
                };
                res.send(JSON.stringify(response));
              }
            });
          }
        }else{//学生が講義を１つも受講していなかった場合
          response = {
            header:{
              status:"registered no lecture",
              responseCode:4
            },
            response:null
          };
          res.send(JSON.stringify(response));
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

module.exports = router;
