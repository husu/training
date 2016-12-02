/**
 * Created by husu on 2016/12/2.
 */


'use strict';
var router = require('express').Router();
var util =  require('../util');
var _= require('lodash');


/**
 * 获得消息列表
 */
router.get('',function (req,res) {
   let user = req.currentUser;

   return res.send({
       code:0,
       message:'',
       result:[
           {
               type:1,
               from:'583525c061ff4b0061ee0d18',
               content:'谁谁谁回应了你',
               id:'2333421333'
           },
           {
               type:1,
               from:'583525c061ff4b0061ee0d18',
               content:'谁谁谁回应了你',
               id:'2333421344'
           }
       ]
   });
});
/**
 * 阅读了某个消息
 */
router.post('',function (req,res) {
   let id = req.body.id;
   if(!id){
       return res.send({
            code:util.ERROR.OBJECT_ID_IS_EMPTY,
            message:'参数错误'
       });
   }

   return res.send({
        code:0,
        message:'成功'
   });

});

/**
 * 获得消息数量
 */
router.get('/count',function (req,res) {
    return res.send({
        code:0,
        result:2
    });
});

module.exports = router;

