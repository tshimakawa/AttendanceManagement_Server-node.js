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
  const room = req.body.request.room;

  let response = {};

  connection.query(`SELECT student_id FROM student WHERE uuid = "${uuid}"`,function(error,result,fields){//UUIDから学籍番号を取得
    if(error) {//データベース検索でエラーが発生した場合
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
      allmodule.getLectureID.attend(room).then(
        function(lectureInfo){
          if(lectureInfo.attend == true){//講義情報を取得できた場合
            connection.query(`SELECT id FROM lecture_student WHERE lecture_id="${lectureInfo.lectureID}" AND student_id="${studentID}"`,function(error,result,fields){//学生が受講者リストに登録されているかの確認
              if (error){//データベース検索でエラーが発生した場合
                throw error;
                response = {
                  header:{
                    status:"DB error",
                    responseCode:1
                  },
                  response:null
                };
                res.send(JSON.stringify(response));
              }else if (result.length == 1){//学生が受講者リストに登録されている場合
                const date = new Date();
                const year = date.getFullYear();
                const month = date.getMonth()+1;
                const day = date.getDate();
                const hour = date.getHours();
                const minute = date.getMinutes();
                const second = date.getSeconds();

                console.log(`"${year}-${month}-${day}","${hour}:${minute}:${second}"`);
                connection.query(`INSERT INTO attendance_data(date,time,student_id,lecture_id,minor,attendance) VALUES("${year}-${month}-${day}","${hour}:${minute}:${second}","${studentID}","${lectureInfo.lectureID}",0,1)`,function(error,result,fields){//出席情報をデータベースに登録
                  if (error){//データベースへの登録時にエラーが発生した場合
                    throw error;
                    response = {
                      header:{
                        status:"DB error",
                        responseCode:1
                      },
                      response:null
                    };
                    res.send(JSON.stringify(response));
                  }else{//出席情報をデータベースに登録できた場合
                    connection.query(`SELECT DISTINCT date FROM attendance_data WHERE lecture_id="${lectureInfo.lectureID}"`,function(error,result,fields){//該当講義の講義日を全て取得
                      if (error){//データベース検索時にエラーが発生した場合
                        throw error;
                        response = {
                          header:{
                            status:"DB error",
                            responseCode:1
                          },
                          response:null
                        };
                        res.send(JSON.stringify(response));
                      }else{//該当講義の講義日を全て取得できた場合
                        const lectureDate = result.length;
                        connection.query(`SELECT DISTINCT date FROM attendance_data WHERE lecture_id="${lectureInfo.lectureID}" AND student_id="${studentID}"`,function(error,result,fields){//全講義日の中で学生が出席した講義日を取得
                          if (error){//データベース検索時にエラーが発生した場合
                            throw error;
                            response = {
                              header:{
                                status:"DB error",
                                responseCode:1
                              },
                              response:null
                            };
                            res.send(JSON.stringify(response));
                          }else{//学生が出席した講義日を取得できた場合
                            const attendDate = result.length;
                            const response = {
                              header:{
                                status:"success",
                                responseCode:0
                              },
                              response:{
                                lectureDate:lectureDate,
                                attendDate:attendDate
                              }
                            };
                            res.send(JSON.stringify(response));
                          }
                        });
                      }
                    });
                  }
                });
              }else{//学生が受講者リストに登録されていない場合
                const response = {
                  header:{
                    status:"student unregistered",
                    responseCode:6
                  },
                  response:null
                };
                res.send(JSON.stringify(response));
              }
            });
          }else{//講義情報を取得できなかった場合
            response = {
              header:{
                status:"cannot get lectureInfo",
                responseCode:5
              },
              response:null
            };
            res.send(JSON.stringify(response));
          }
        },function(error){
          console.log(error);
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
