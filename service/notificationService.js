/**
 * Created by husu on 2016/12/2.
 */

'use strict';
let AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;

let Notification = AV.Object.extend("notification");
let myUtil =  require('../util.js');
let _ = require('lodash');
let util =  require('util');
const events =  require('events');




function NotificationService(){
    events.EventEmitter.call(this);

}

/**
 * 获得消息列表
 * @param user
 * @returns {*}
 */
function _get(user){
    if(!user){
        return AV.Promise.error(myUtil.ERROR.PARAMETER_MISSING);
    }
    let query =new AV.Query(Notification);
    query.equalTo('targetUser',user);
    return query.first().then(obj=>{
        if(obj){
            return obj.get('message') || [];
        }
        return [];
    }).fail(e=>{
        return [];
    });
}
/**
 * 删除消息
 * @param id
 * @param user
 * @returns {*}
 */
function _delete(id,user){
    if(!user){
        return AV.Promise.error(myUtil.ERROR.PARAMETER_MISSING);
    }
    let query =new AV.Query(Notification);
    query.equalTo('targetUser',user);
    return query.first().then(obj=>{
        if(obj){
            let msgArray =  obj.get('message') || [];

            _.forEach(msgArray,function (v) {
                if(v.id==id) {
                    obj.remove('message', v);
                }
            });

            return obj.save();
        }
    }).fail(e=>{
        console.log(e);
    });
}
/**
 * @param user
 * @returns {*}
 */
function _count(user){

    if(!user){
        return AV.Promise.error(myUtil.ERROR.PARAMETER_MISSING);
    }
    let query =new AV.Query(Notification);
    query.equalTo('targetUser',user);
    return query.first().then(obj=>{
        if(obj){
            if(!obj.get('message')){
                return 0;
            }
            return obj.get('message').length;
        }
        return 0;
    }).fail(e=>{
        return 0;
    });

}
/**
 * 提交一个提醒
 * @param msgObj 一个消息
 * @param userId 接收消息的人
 * @returns {*}
 */
function _save(msgObj,userId){
    if(!userId){
        return AV.Promise.error(myUtil.ERROR.PARAMETER_MISSING);
    }

    let queryUser  = AV.Object.createWithoutData('_User',userId);
    let query =new AV.Query(Notification);
    query.equalTo('targetUser',queryUser);
    return query.first().then(obj=>{
        if(obj){
            obj.addUnique('message',msgObj);
            return obj.save();
        }else{
            let nf = new Notification();
            nf.set('targetUser',queryUser);
            nf.addUnique('message',msgObj);
            return nf.save();
        }
    }).fail(e=>{
        console.log(e);
    });
}



util.inherits(NotificationService,events.EventEmitter);

NotificationService.prototype.sendNotification =function(data,userId) {
    this.emit("notice", data,userId);
};


module.exports = NotificationService;
module.exports.get=_get;
module.exports.delete=_delete;
module.exports.save=_save;
module.exports.count=_count;


