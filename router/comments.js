/**
 * Created by husu on 16/8/30.
 */
'use strict';
var router = require('express').Router();
var cs = require('../service/commentService');
var myUtil =  require('../util');
var _= require('lodash');
let ns = require('../service/notificationService');
let myNs = new ns();


// let ns = new NotificationService();

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
    let page = req.query.page;
    let pageSize = req.query.pageSize;
    let para = {
        trainId:id
    };
    let returnObj = {
        code:0
    };
    cs.list(para,page,pageSize).then(function(list){
        var commentList = _.map(list,o=>{
            var curObj= myUtil.avObjectToJson(o);
            var user = o.get('creator');
            curObj.creator = {
                objectId:user.id,
                username:user.get('username'),
                nickName:user.get('nickName'),
                icon:user.get('icon')

            };
            return curObj;
        });

        returnObj.result  = commentList;
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

    // comment.recipient = '583525c061ff4b0061ee0d18';

    if(!comment.recipient){
        result.code = myUtil.ERROR.PARAMETER_MISSING.errorCode;
        result.message = '未填写回复对象的用户ID';
        result.errors = ['未填写回复对象的用户ID'];
        return res.send(result);
    }

    let recipient = comment.recipient;


    _.map(recipient,rpt=>{
       if(rpt==req.currentUser.id){
            return '00000';
       }else{
           return rpt;
       }
    });


    _.union(recipient); //去重

    comment.trainId = req.params.trainId;
    comment.type = myUtil.COMMENTTYPE.COMMENT;


    if(!comment.content){
        result.code = myUtil.ERROR.PARAMETER_MISSING.errorCode;
        result.message = myUtil.ERROR.PARAMETER_MISSING.message;
        result.errors = '评论内容不可为空';
        return res.send(result);
    }

    comment.creator = req.currentUser;
    comment.recipient = undefined;

    let msgObj = {
        type:1,
        content:'您收到了一个回复',
        from:comment.trainId,
        id:"" + (new Date()).getTime()
    };





    return cs.saveComment(comment).then(function(obj){

        if(!(recipient instanceof Array)){
            recipient =[recipient];
        }

        myNs.sendNotification(msgObj,recipient);
        result.message ='保存成功';
        result.result = obj;
        return res.send(result);
    }).catch(function(e){
        result.code = e.errorCode;
        result.message = e.message;
        return res.send(result);
    });

});

myNs.on('notice',function (data,userId) {
    userId.forEach(id=>{
        if(id!='00000') {
            ns.save(data, id).catch(e => {
                console.log(e);
            });
        }
    });
});

myNs.on('error',function (err) {
    console.log(err);
});



module.exports = router;