/**
 * Created by husu on 16/8/23.
 */
'use strict';
var validator = require('validator');

function util(){

}

/**
 * 从Request中复制提交的参数到一个AVObject对象中
 * @param model 一个AVObject对象
 * @param request
 */
util.copyPropertyFromRequest=function(model,request){
    let  curValue;

    for(let p in request.body){
        if(p && request.body[p]) {

            curValue=request.body[p];
            if(typeof request.body[p] == 'string' &&  validator.isDate(request.body[p])){
                curValue = new Date(request.body[p]);
            }
            model.set(p, curValue);
        }
    }
};
/**
 * 从Request中复制提交的参数到一个对象中
 * @param request
 */
util.copyProperty4Object=function(request){
    let model = {};
    for(let p in request.body){
        if(p && request.body[p]) {
            model[p] = request.body[p];
        }
    }
    return model;
};

/**
 * 从一个对象当中复制属性到AVObject对象中
 * @param avObject
 * @param object
 */
util.copyProperty=  function(avObject,object){

    let  curValue;

    for(let p in object){
        if(p && object[p]) {

            curValue = object[p];


            if( typeof object[p] == 'string' &&  validator.isDate(object[p])){
                curValue = new Date(object[p]);
            }

            avObject.set(p, curValue);

        }
    }
};

util.ERROR = {
    INTERNAL_ERROR:{
        errorCode:1,
        message:'内部错误'
    },
    AUTH_FAIL:{
        errorCode:2,
        message:'权限错误'
    },
    OBJECT_ID_IS_EMPTY:{
      errorCode:-1,
      message:'objectId为空'
    },
    IS_NOT_A_OBJECT:{
        errorCode:-2,
        message:'参数不是对象'
    },
    LIST_FIND_FAIL:{
        errorCode:-3,
        message:'列表查询错误'
    },
    PARAMETER_MISSING:{
        errorCode:-6,
        message:'参数缺失'
    },
    DATA_DUPLICATE:{
        errorCode:-4,
        message:'数据重复'
    },
    LOGIN_TIMEOUT:{
        errorCode:-5,
        message:'登录过期'
    }
};

util.TRAININGSTATUS = {
    REQUIREMENT:0,
    WILLINGNESS:1,
    TRAINING:2
};

util.COMMENTTYPE={
    COMMENT:0,
    THUMB_UP:1

};

//noinspection JSUnresolvedVariable
module.exports =  util;


