/**
 * Created by husu on 2016/12/3.
 */
'use strict';
var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;
var assert = require('assert');

const chai = require("chai");
var expect = chai.expect;
const chaiHttp = require("chai-http");
let util = require('../util');

chai.use(chaiHttp);

describe('测试排行的接口',function(){
    let request = chai.request.agent('http://localhost:3261');
    let msgid;
    before(function(){
         return request.post(`/login`).send({"username":"test","password":"123456"}).then(()=> {
            console.log('登录成功');

        });
    });

    it('测试新增消息接口',function(done) {

        let msg = {
            userId:'583525c061ff4b0061ee0d18',
            from:'2dsfssdfsfsdf',
            content:'test test test'
        };


        request.post('/v1/notification/add').send(msg).then(res=>{
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object", "返回对象");
            expect(res.body).haveOwnProperty("code");
            expect(res.body).haveOwnProperty("result");
            expect(res.body.code).to.equal(0);
            expect(res.body.result!=undefined).to.be.ok;
            msgid = res.body.result;
            return res;
        }).then(resPre=>{
            request.get(`/v1/notification/count`).then((res)=>{
                expect(res).to.have.status(200);
                expect(res.body).to.be.an("object", "返回对象");
                expect(res.body).haveOwnProperty("code");
                expect(res.body.code).to.equal(0);
                expect(res.body.result).to.be.above(0);



                //console.log(res.body);
                done()
            }).catch(function(e){
                done(e);
            });
        }).catch(function (e) {
            done(e);
        });



    });


    /**
     * 测试按评论排行的的Restful API
     */
    // it('测试按评论排名的RESTful API',done =>{
    //     request.get(`/v1/rank/comment`).then(res=>{
    //         expect(res).to.have.status(200);
    //         expect(res.body).to.be.an("object", "返回对象");
    //         expect(res.body).haveOwnProperty("code");
    //         expect(res.body).haveOwnProperty("result");
    //         expect(res.body.code).to.equal(0);
    //         expect(res.body.result.length).to.be.above(1);
    //
    //         let obj1 = res.body.result[0];
    //         expect(obj1.status).to.equal(util.TRAININGSTATUS.TRAINING);
    //
    //         let  obj2 = res.body.result[1];
    //         expect(obj1.commentNum>obj2.commentNum).to.be.ok;
    //
    //
    //         //console.log(res.body);
    //
    //         done();
    //     }).catch(function(e){
    //         done(e);
    //     })
    //
    // });


});