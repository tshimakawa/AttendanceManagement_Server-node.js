const mysql = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'attend_admin',
  password : 'light12345',
  database : 'attendance_platform_db'
});

exports.roomInfo = function(room){
  return new Promise(function(resolve,reject){
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth()+1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const weekday = date.getDay();
    let term = "";
    let lectureID = -1;

    if(4<=month && month<9){
      term = "Spring";
    }else{
      term = "Autumn";
    }
    connection.query(`SELECT lecture_id,start_time,end_time FROM lecture WHERE year="${year}" AND room="${room}" AND weekday="${weekday}" AND term="${term}"`,function(error,result,fields){
      if (error) {
        throw error;
        reject(error); // errがあればrejectを呼び出す
        return;
      }
      const nowTime = Date.parse(`${year}/${month}/${day} ${hour}:${minute}:${second}`);//現在時刻をミリ秒で取得
      for(let count=0;count<result.length;count++){
        const start_time = (Date.parse(`${year}/${month}/${day} ${result[count].start_time}`)) - (10*60*1000);//講義の開始時刻-10分をミリ秒で取得
        const end_time = Date.parse(`${year}/${month}/${day} ${result[count].end_time}`) - (5*60*1000);//講義の終了時刻+5分をミリ秒で取得
        if(start_time<=nowTime && nowTime<=end_time){
          lectureID = result[count].lecture_id;
        }
      }
      resolve(lectureID);
    });
  });
}

exports.attend = function(room){
  return new Promise(function(resolve,reject){
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth()+1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const weekday = date.getDay();
    let term = "";
    let lectureInfo = {};

    if(4<=month && month<9){
      term = "Spring";
    }else{
      term = "Autumn";
    }
    connection.query(`SELECT lecture_id,attend_start,attend_end,start_time,end_time FROM lecture WHERE year="${year}" AND room="${room}" AND weekday="${weekday}" AND term="${term}"`,function(error,result,fields){
      if (error) {
        throw error;
        reject(error); // errがあればrejectを呼び出す
        return;
      }


      const nowTime = Date.parse(`${year}/${month}/${day} ${hour}:${minute}:${second}`);//現在時刻をミリ秒で取得
      for(let count=0;count<result.length;count++){
        const start_time = (Date.parse(`${year}/${month}/${day} ${result[count].start_time}`)) - (10*60*1000);//講義の開始時刻-10分をミリ秒で取得
        const end_time = Date.parse(`${year}/${month}/${day} ${result[count].end_time}`) - (5*60*1000);//講義の終了時刻+5分をミリ秒で取得
        const attend_start = Date.parse(`${year}/${month}/${day} ${result[count].attend_start}`);//講義の出席開始時刻をミリ秒で取得
        const attend_end = Date.parse(`${year}/${month}/${day} ${result[count].attend_end}`);//講義の出席終了時刻をミリ秒で取得

        if(start_time<=nowTime && nowTime<=end_time){
          if(attend_start<=nowTime && nowTime<=attend_end){
            lectureInfo ={
              lectureID:result[count].lecture_id,
              attend:true
            }
          }else{
            lectureInfo ={
              lectureID:result[count].lecture_id,
              attend:false
            }
          }
        }
      }
      resolve(lectureInfo);
    });
  });
}

exports.leave = function(room){
  return new Promise(function(resolve,reject){
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth()+1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const weekday = date.getDay();
    let term = "";
    let lectureID = -1;

    if(4<=month && month<9){
      term = "Spring";
    }else{
      term = "Autumn";
    }
    connection.query(`SELECT lecture_id,attend_start,end_time FROM lecture WHERE year="${year}" AND room="${room}" AND weekday="${weekday}" AND term="${term}"`,function(error,result,fields){
      if (error) {
        throw error;
        reject(error); // errがあればrejectを呼び出す
        return;
      }

      const nowTime = Date.parse(`${year}/${month}/${day} ${hour}:${minute}:${second}`);//現在時刻をミリ秒で取得
      for(let count=0;count<result.length;count++){
        const attend_start = Date.parse(`${year}/${month}/${day} ${result[count].attend_start}`);//講義の出席開始時刻をミリ秒で取得
        const end_time = Date.parse(`${year}/${month}/${day} ${result[count].end_time}`) - (5*60*1000);//講義の終了時刻+5分をミリ秒で取得
        if(attend_start<=nowTime && nowTime<=end_time){
          lectureID = result[count].lecture_id;
        }
      }
      resolve(lectureID);
    });
  });
}
