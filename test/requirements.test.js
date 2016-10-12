/**
 * Created by husu on 16/10/12.
 */
'use strict';
var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;
var assert = require('assert');


var  util = require('../util');
const chai = require("chai");
var expect = chai.expect;
const chaiHttp = require("chai-http");

chai.use(chaiHttp);


describe('测试培训需求的 RESTful API',function() {
    const request = chai.request.agent('http://localhost:3261');
    before(function(){
        return request.post(`/login`).send({"username":"test","password":"123456"}).then(()=> {
            console.log('登录成功');
        });
    });

    it('测试新增培训需求',done=>{
        let user =   request.currentUser;
        let t = {
            title: '测试Restful API新增11111',
            status: util.TRAININGSTATUS.REQUIREMENT,
            content: '测试新增需求',
            trainDate: new Date(),
            tag: ['test111'],
            author:user
        };
        request.post(`/v1/requirements`).send(t).then(res=>{
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object", "返回对象");
            expect(res.body).haveOwnProperty("code");
            expect(res.body).haveOwnProperty("message");
            expect(res.body).haveOwnProperty("result");
            expect(res.body.result.type).to.equal(util.COMMENTTYPE.REQUIREMENT);

            assert.ok(res.body.result.objectId,"测试新增后是否有ObjectId");
            return res;
        }).then(function(res){
            let tid= res.body.result.objectId;
            request.delete(`/v1/training/${tid}`).then(res1=>{
                expect(res1.body).haveOwnProperty("code");
                expect(res1.body).haveOwnProperty("message");
                expect(res1.body.code).to.be.equal(0,'测试是否返回删除成功的状态值');
                done();
            }).catch(e1=>{
                done(e1);
            });

        }).catch(e=>{
            done(e);
        });
    });
});