/**
 * Created by husu on 16/11/21.
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


    it('测试修改密码',function(done) {
        let user={
            username:'test2',
            oldPwd:'123456',
            newPwd:'654321'
        };

        return request.post(`/changePwd`).send(user).then((res)=>{
            console.log(res.body);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object", "返回对象");
            expect(res.body).haveOwnProperty("code");
            expect(res.body.code).to.equal(0);
            done();
        }).catch(function(e){

            done(e);
        });
    });

    after(function(){
        let user={
            username:'test2',
            oldPwd:'654321',
            newPwd:'123456'
        };

        return request.post(`/changePwd`).send(user).then(res =>{
            console.log('测试修改密码完毕');
        });
    })


});