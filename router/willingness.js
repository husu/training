/**
 * Created by husu on 16/9/4.
 */

'use strict';
var router = require('express').Router();
var ts = require('../service/trainingService');
var util =  require('../util');
var _= require('lodash');


/**
 * 获得一个培训意愿列表
 */
router.get('/list',function(req,res){
    var pageSize = req.query.pageSize || req.body.pageSize ||10;
    var page = req.query.page || req.body.page || 1;
    var params = {
        tags:req.params.tags,
        title:req.params.title,
        status:util.TRAININGSTATUS.WILLINGNESS
    };




    ts.list(params,page,pageSize).then(function(list){
        var wilingList =  _.map(list,o=>{
            var user  = o.get('creator');
            o= _.pick(util.avObjectToJson(o),['commentNum','content','createdAt','creator','imgURL','objectId','thumbUpNum','trainDate','title']);
            o.creator = {
                id:user.id,
                username:user.get('username')
            };
            return o;
        });

        let resultObj = {
            code:0,
            result:wilingList
        };
        return res.send(resultObj);
    }).fail(function(e){
        return res.send({
            code: e.errorCode,
            message: e.message
        });
    });

});

/**
 * 保存一个培训意愿信息
 */
router.post('/',function(req,res){
    var trainObj = req.body;

    let result ={
    };



    if(!trainObj.title){
        result.code = util.ERROR.PARAMETER_MISSING.errorCode;
        result.message = util.ERROR.PARAMETER_MISSING.message;
        result.errors = '标题不可为空';
        return res.send(result);
    }


    if(!trainObj.content){
        result.code = util.ERROR.PARAMETER_MISSING.errorCode;
        result.message = util.ERROR.PARAMETER_MISSING.message;
        result.errors = '内容不可为空';
        return res.send(result);
    }

    trainObj.status=util.TRAININGSTATUS.WILLINGNESS;


    trainObj.creator = req.currentUser;

    ts.save(trainObj).then(function(obj){
        result ={
            code:0,
            message:'保存成功',
            result:obj
        };
        return res.send(result);
    });
});




module.exports = router;