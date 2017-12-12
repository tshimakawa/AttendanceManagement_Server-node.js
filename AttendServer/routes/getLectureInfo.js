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
    if(error){//UUIDから学籍番号を取得するときにデータベース検索でエラーが発生した場合
      throw error;
      response = {
        header:{
          status:"DB error",
          responseCode:7
        },
        response:null
      };
      res.send(JSON.stringify(response));
    }
    else if(result.length == 1){//uuidから学生の学籍番号を取得できた場合
      const studentID = result[0].student_id;

      allmodule.getLectureID.roomInfo(room).then(//送信されてきた教室名からlectureIDを取得
        function(lectureID){
          if(lectureID != -1){//lectureIDを取得できた場合（ビーコンを受信した教室で講義が行われている場合）
            connection.query(`SELECT subject,prof_id,time_id FROM lecture WHERE lecture_id="${lectureID}"`,function(error,result,fields){//取得したlectureIDから講義名，教授ID，時限数を取得
              if(error){//取得したlectureIDから講義名，教授ID，時限数を取得するときにデータベース検索でエラーが発生した場合
                throw error;
                response = {
                  header:{
                    status:"DB error",
                    responseCode:7
                  },
                  response:null
                };
                res.send(JSON.stringify(response));
              }else if(result.length == 1){//講義名，教授名，時限数を取得できた場合
                const subject = result[0].subject;
                const profID = result[0].prof_id;
                const timeID = result[0].time_id;

                connection.query(`SELECT name FROM prof WHERE prof_id="${profID}"`,function(error,result,fields){//取得した教授IDから教授名を取得
                  if(error) throw error;
                  if(result.length == 1){//教授名を取得できた場合
                    const profName = result[0].name;
                    const date = new Date();
                    const year = date.getFullYear();
                    const month = date.getMonth()+1;
                    const day = date.getDate();
                    let attendMode = -1;//出席状態をフラグとして保存する変数 0:未出席 1:出席済み 2:退室済み
                    connection.query(`SELECT attendance FROM attendance_data WHERE lecture_id="${lectureID}" AND date="${year}-${month}-${day}" AND student_id="${studentID}"`,function(error,result,fields){//その日にすでに該当講義に出席しているかを確認
                      if(error) {//データベース検索でエラーが発生した場合
                        throw error;
                        response = {
                          header:{
                            status:"DB error",
                            responseCode:7
                          },
                          response:null
                        };
                        res.send(JSON.stringify(response));
                      }else if(result.length == 0){//まだ講義に出席していなかった場合
                        attendMode = 0;
                      }else if (result.length == 1) {//すでに出席情報が登録されていた場合
                        attendMode = 1;
                      }else if (result.length == 2) {//すでに退室情報まで登録されていた場合
                        attendMode =2;
                      }else{//それ以外の場合（システム設計的にあってはいけない）
                        attendMode = 0;
                      }
                      response = {
                        header:{
                          status:"success",
                          responseCode:attendMode
                        },
                        response:{
                          subject:subject,
                          profName:profName,
                          timeID:timeID
                        }
                      };
                      res.send(JSON.stringify(response));
                    });
                  }else{//教授名を取得できなかった場合
                    response = {
                      header:{
                        status:"cannot get profName",
                        responseCode:6
                      },
                      response:null
                    };
                    res.send(JSON.stringify(response));
                  }
                });
              }else{//講義名，教授ID，時限数を取得できなかった場合
                response = {
                  header:{
                    status:"cannot get subject,profID,timeID",
                    responseCode:5
                  },
                  response:null
                };
                res.send(JSON.stringify(response));
              }
            });
          }else{//lectureIDを取得できなかった場合（ビーコンを受信した教室で講義が行われていなかった場合）
            response = {
              header:{
                status:"cannot get lectureID",
                responseCode:4
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
          responseCode:3
        },
        response:null
      };
      res.send(JSON.stringify(response));
    }
  });
});

module.exports = router;
