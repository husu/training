/**
 * Created by husu on 16/9/29.
 */

'use strict';
var router = require('express').Router();
var cs = require('../service/commentService');
var util =  require('../util');


/**
 * 点赞
 */

router.post('/:trainId',function(req,res){
    let comment = req.body;
    let result ={
        code:0
    };

    comment.trainId = req.params.trainId;
    comment.type = util.COMMENTTYPE.THUMB_UP;

    cs.canThumbUp(comment.trainId,req.currentUser).then(function(thumbable){
        if(thumbable){
            comment.creator = req.currentUser;
            comment.type = util.COMMENTTYPE.THUMB_UP;
            cs.saveComment(comment).then(function(obj){
                result.message ='保存成功';
                result.result = obj;
                return res.send(result);
            }).catch(function(e){
                result.code = e.errorCode;
                result.message = e.message;
                return res.send(result);
            });
        }
    }).fail(function(e){
        result.code = e.errorCode;
        result.message = "操作失败";
        result.errors = e;
        return res.send(result);
    });
});

/**
 * 判断是否已经点过赞
 */
router.get("/:trainId",function(req,res){

    let tid =req.params.trainId;

    let result ={
        code:0
    };



    if(!tid){
        result.code = util.ERROR.PARAMETER_MISSING;
        result.message = '培训ID参数未填写';
        return res.send(result);
    }



    cs.canThumbUp(tid,req.currentUser).then(function(thumbable){
        result.result = thumbable;
        return res.send(result);
    }).catch(function(e){
        result.code = e.errorCode;
        result.message = "操作失败";
        result.errors = e;
        return res.send(result);
    });
});

module.exports = router;