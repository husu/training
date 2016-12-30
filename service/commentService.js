/**
 * Created by husu on 16/8/28.
 */
'use strict';
var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;

var CommentObj = AV.Object.extend("Comment");
var Training = AV.Object.extend("Training");
var myUtil =  require('../util.js');

module.exports = {
    get:function(id){
        if(!id){
            return AV.Promise.error(myUtil.ERROR.OBJECT_ID_IS_EMPTY);
        }
        return AV.Object.createWithoutData('Comment',id).fetch();
    },
    delete:function(id){
        if(!id){
            return AV.Promise.error(myUtil.ERROR.OBJECT_ID_IS_EMPTY);
        }
        return AV.Object.createWithoutData('Comment',id).destroy();
    },
    list:function(params,page,pageSize){

        if(!params.trainId){
            return AV.Promise.error(myUtil.ERROR.PARAMETER_MISSING);
        }
        let training = AV.Object.createWithoutData('Training',params.trainId);
        var query =  new AV.Query("Comment");
        query.equalTo('training',training);
        query.equalTo('type',myUtil.COMMENTTYPE.COMMENT);
        query.skip((page-1)*pageSize);
        query.include("creator");
        query.limit(pageSize);
        return query.find();

    },
    //存一个回复
    saveComment:function(comObj){
        var comment = new CommentObj();

        if(comObj.id){
            comment =  AV.Object.createWithoutData('Comment',comObj.id);
        }
        myUtil.copyProperty(comment,comObj);



        if(!comObj.trainId){
            return AV.Promise.error(myUtil.ERROR.PARAMETER_MISSING);
        }

        var trainPointer =AV.Object.createWithoutData('Training',comObj.trainId);
        comment.set('training',trainPointer);
        comment.set('content',comObj.content);
        return comment.save().then(function(c){
            if(comObj.type == myUtil.COMMENTTYPE.COMMENT) {
                trainPointer.increment('commentNum', 1);
            }else if(comObj.type == myUtil.COMMENTTYPE.THUMB_UP){
                trainPointer.increment('thumbUpNum',1);
            }
            return trainPointer.save().then(function(){
                return c;
            });
        }).fail(function(e){
            let error =  myUtil.ERROR.INTERNAL_ERROR;
            error.errors = e;
            return AV.Promise.error(error);
        });

    },
    //是否可以赞，0，不可以赞，1 可以
    canThumbUp:function(trainId,user){
        return AV.Object.createWithoutData('Training',trainId).fetch().then(function (obj) {
            var query  = new AV.Query("Comment");
            query.equalTo("author",user);
            query.equalTo("type",myUtil.COMMENTTYPE.THUMB_UP);
            query.equalTo("training",obj);
            if(obj.get('status') == myUtil.TRAININGSTATUS.TRAINING){
                query.greaterThan("createdAt",obj.get('trainDate'));
            }

            return query.find().then(function(result){
                if(!result || result.length>0){
                    return 0;
                }
                return 1;

            }).fail(function(e){
                return AV.Promise.error(myUtil.ERROR.PARAMETER_MISSING);
            })
        })
    }

};

