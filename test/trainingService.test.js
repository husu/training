/**
 * Created by husu on 16/8/23.
 */
'use strict';
var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;
var assert = require('assert');
var dateformat = require('dateformat');


const chai = require("chai");
var expect = chai.expect;
const chaiHttp = require("chai-http");
let util = require('../util');

chai.use(chaiHttp);





describe('测试关于培训的RESTful API',function() {
    const request = chai.request.agent('http://localhost:3261');




    it('测试RESTful API',function(done){
        let t = {title:'测试Restful API新增',
            status:1,
            content:'测试新增需求',
            trainDate:new Date(),
            tag:['test111']
        };


        request.post(`/login`).send({"username":"test","password":"123456"}).then((resUser)=> {
             request.post(`/v1/training`).send(t).then(res=>{
                 expect(res).to.have.status(200);
                 expect(res.body).to.be.an("object", "返回对象");
                 expect(res.body).haveOwnProperty("code");
                 expect(res.body).haveOwnProperty("message");
                 expect(res.body).haveOwnProperty("result");
                 expect(res.body.result.status).to.equal(util.TRAININGSTATUS.TRAINING,'测试');
                 assert.equal(res.body.result.title,'测试Restful API新增','测试保存的title是否正确');
                 return res;

            }).then(function(res0){
                 var now = new Date();
                 let t={
                     trainDate:dateformat(now,'yyyy-mm-dd hh:MM:ss')
                 };
                 return request.get('/v1/training/trainByTime').send(t).then(res=>{
                     expect(res).to.have.status(200);
                     expect(res.body).to.be.an("object", "返回对象");
                     expect(res.body).haveOwnProperty("code");
                     expect(res.body).haveOwnProperty("message");
                     expect(res.body).haveOwnProperty("result");
                     assert.equal(res.body.result,1,'测试当天有培训');

                     return res0;
                 }).catch(e=>{
                     done(e);
                 })

             }).then(res0=>{
                 let t={
                     trainDate:'2021-03-21 08:09:09'
                 };
                 return request.get('/v1/training/trainByTime').send(t).then(res=>{
                     expect(res).to.have.status(200);
                     expect(res.body).to.be.an("object", "返回对象");
                     expect(res.body).haveOwnProperty("code");
                     expect(res.body).haveOwnProperty("message");
                     expect(res.body).haveOwnProperty("result");
                     assert.equal(res.body.result,0,'测试当天无培训');

                     return res0;
                 }).catch(e=>{
                     done(e);
                 })
             }).then(function(res0){
                 let tid= res0.body.result.objectId;

                 let t={
                     objectId:tid
                 };
                 return request.post(`/v1/training/plan`).send(t).then(res=>{
                     expect(res).to.have.status(200);
                     expect(res.body).to.be.an("object", "返回对象");
                     expect(res.body).haveOwnProperty("code");
                     expect(res.body).haveOwnProperty("message");
                     assert.equal(res.body.code,util.ERROR.PARAMETER_MISSING.errorCode,'测试没有填写培训日期时报错');
                     assert.equal(res.body.message,'培训时间不可为空','测试没有填写培训日期时报错');

                     return res0;
                 }).catch(e=>{
                     done(e);
                 })

             }).then(res0=>{
                 let tid= res0.body.result.objectId;

                 let t={
                     objectId:tid,
                     trainDate:'2011-1-1 12:00:33'
                 };
                 return request.post(`/v1/training/plan`).send(t).then(res=>{
                     expect(res).to.have.status(200);
                     expect(res.body).to.be.an("object", "返回对象");
                     expect(res.body).haveOwnProperty("code");
                     expect(res.body).haveOwnProperty("message");
                     assert.equal(res.body.code,util.ERROR.PARAMETER_IS_NOT_CORRECT.errorCode,'测试培训时间已经过去');
                     return res0;
                 }).catch(e=>{
                     done(e);
                 })
             }).then(res0=>{
                 let tid= res0.body.result.objectId;

                 let t={
                     objectId:tid,
                     trainDate:'2018-12-12 12:00:33'
                 };
                 return request.post(`/v1/training/plan`).send(t).then(res=>{
                     expect(res).to.have.status(200);
                     expect(res.body).to.be.an("object", "返回对象");
                     expect(res.body).haveOwnProperty("code");
                     expect(res.body).haveOwnProperty("message");
                     expect(res.body).haveOwnProperty("result");
                     assert.equal(res.body.code,0,'培训安排测试成功');
                     return res0;
                 }).catch(e=>{
                     done(e);
                 })
             }).then(function(res0){
                 var r = new Date().getTime();
                 return request.get(`/v1/training/list?d=${r}`).send({page:1,pageSize:4}).then(res=>{
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("object", "返回对象");
                    expect(res.body).haveOwnProperty("code");
                    expect(res.body).haveOwnProperty("result");
                    assert.equal(res.body.result.length,4,'测试列表查询是否正确');
                    assert.equal(res.body.result[0].creator.username,'test','Test creator');

                    return res0;
                })
            }).then(function(res1){
                let tid= res1.body.result.objectId;

                return request.get(`/v1/training/detail/${tid}`).send({}).then(resDetail=>{
                    expect(resDetail.body).haveOwnProperty("code");
                    expect(resDetail.body.code).to.be.equal(0,'测试是否返回查询成功的状态值');
                    assert.equal(resDetail.body.result.creator.username,'test','Test training detail creator');
                    //console.log(resDetail.body);
                    return res1;
                }).then(res1=>{
                    let tid= res1.body.result.objectId;
                    request.delete(`/v1/training/${tid}`).then(res1=>{
                        expect(res1.body).haveOwnProperty("code");
                        expect(res1.body).haveOwnProperty("message");
                        expect(res1.body.code).to.be.equal(0,'测试是否返回删除成功的状态值');
                    }).catch(e1=>{
                        done(e1);
                    });
                }).catch(e=>{
                    done(e);
                });

            }).then(res=>{
                 request.get(`/logout`).send({}).then(resDetail=>{
                     expect(resDetail.body).haveOwnProperty("code");
                     expect(resDetail.body.code).to.be.equal(0,'测试是否返回查询成功的状态值');
                     assert.equal(request.currentUser,undefined,'Test training detail creator');

                     done();
                 }).catch(e=>{
                     done(e);
                 })

             }).catch(e=> {
                done(e);
            });
        });


    });




});



