/**
 * Created by husu on 16/8/30.
 */
'use strict';
var router = require('express').Router();
var cs = require('../service/commentService');
var util =  require('../util');


/**
 * 获得一个评论，我也不知道也没有用，姑且写一写，么么哒
 */
router.get('/detail/:id',function(req,res){
    var id = req.params.id;

    var returnObj = {
        code:0
    };

    cs.get(id).then(function(comment){
        returnObj.result = comment;
        return res.send(returnObj);
    }).catch(function(e){
        returnObj.result = e.errorCode;
        returnObj.message = e.message;
        return res.send(returnObj)
    });
});

/**
 * 获得评论列表
 */
router.get('/list/:id',function(req,res){
    let id = req.params.id;
    let page = req.body.page;
    let pageSize = req.body.pageSize;
    let para = {
        trainId:id
    };
    let returnObj = {
        code:0
    };
    cs.list(para,page,pageSize).then(function(list){
        returnObj.result  = list;
        return res.send(returnObj);
    }).catch(function(e){
        returnObj.result = e.errorCode;
        returnObj.message = e.message;
        return res.send(returnObj)
    })
});

/**
 * 发表评论
 */

router.post('/:trainId',function(req,res){
    let comment = req.body;
    let result ={
        code:0
    };

    comment.trainId = req.params.trainId;
    comment.type = util.COMMENTTYPE.COMMENT;


    if(!comment.content){
        result.code = util.ERROR.PARAMETER_MISSING.errorCode;
        result.message = util.ERROR.PARAMETER_MISSING.message;
        result.errors = '评论内容不可为空';
        return res.send(result);
    }

    comment.creator = req.currentUser;


    return cs.saveComment(comment).then(function(obj){
        result.message ='保存成功';
        result.result = obj;
        return res.send(result);
    }).catch(function(e){
        result.code = e.errorCode;
        result.message = e.message;
        return res.send(result);
    });

});






module.exports = router;