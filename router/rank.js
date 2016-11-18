/**
 * Created by husu on 16/11/14.
 */

'use strict';
var router = require('express').Router();
var rankService = require('../service/rankService');
var util =  require('../util');
var _= require('lodash');


/**
 * 获得一个按点赞数排名的列表
 */
router.get('/:type',function(req,res){

    let curType = req.params.type;
    let typeValue ;
    if(curType=='thumbUp'){
        typeValue = util.COMMENTTYPE.THUMB_UP;
    }else if(curType=='comment'){
        typeValue = util.COMMENTTYPE.COMMENT;
    }else{
        return res.send({
            code:util.ERROR.PARAMETER_IS_NOT_CORRECT,
            message:'参数错误'
        })
    }

    rankService.getTopTraining(10,typeValue).then(function(list){

        var requireList =  _.map(list,o=>{
            var user  = o.get('creator');

            o= _.pick(util.avObjectToJson(o),['commentNum','content','createdAt','creator','status','imgURL','objectId','thumbUpNum','trainDate','title']);
            o.creator = {
                id:user.id,
                username:user.get('username')
            };
            return o;
        });

        let resultObj = {
            code:0,
            result:requireList
        };
        return res.send(resultObj);
    }).fail(function(e){
        return res.send({
            code: e.errorCode,
            message: e.message
        });
    });

});

module.exports = router;

