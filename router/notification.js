/**
 * Created by husu on 2016/12/2.
 */


'use strict';
var router = require('express').Router();
var util =  require('../util');
var _= require('lodash');
var ns = require('../service/notificationService');


/**
 * 获得消息列表
 */
router.get('',function (req,res) {
   let user = req.currentUser;


   ns.get(user).then(function (list) {
       return res.send({
           code:0,
           message:'',
           result:list
       });
   }).catch(e=>{
       return res.send({
           code:util.ERROR.INTERNAL_ERROR,
           message:e.message,
           errors:[e]
       })
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
    let user = req.currentUser;

    ns.delete(id,user).then(function () {
        return res.send({
            code:0,
            message:'成功'
        });
    }).catch(e=>{
        return res.send({
            code:util.ERROR.INTERNAL_ERROR,
            message:e.message,
            errors:[e]
        });
    });


});

/**
 * 获得消息数量
 */
router.get('/count',function (req,res) {
    let user = req.currentUser;

    ns.count(user).then(function (num) {
        return res.send({
            code:0,
            result:num
        });
    }).catch(e=>{
        return res.send({
            code:util.ERROR.INTERNAL_ERROR,
            message:e.message
        });
    })

});

/**
 * 用于测试的接口，新增消息
 * {

            type:1,
            from:'583525c061ff4b0061ee0d18',
            content:'谁谁谁回应了你',
            id:"" + (new Date()).getTime()
        };
 *
 */
router.post('/add',function (req,res) {
    let  userid  = req.body.userId;
    let content = req.body.content;
    let from = req.body.from;


    let msg = {
            type:1,
            from:from,
            content:content,
            id:"" + (new Date()).getTime()
    };
    ns.save(msg,userid).then(obj=>{
        return res.send({
            code:0,
            message:'ok',
            result:msg.id
        });
    }).catch(e=>{
        return res.send({
            code:-1,
            message:'fail',
            errors:[e]
        });
    })
});

module.exports = router;

