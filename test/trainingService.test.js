/**
 * Created by husu on 16/8/23.
 */
'use strict';
var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;
var ts= require('../service/trainingService');
var assert = require('assert');



const chai = require("chai");
var expect = chai.expect;
const chaiHttp = require("chai-http");

chai.use(chaiHttp);



describe.skip('测试关于培训的RESTful API',function() {
    const request = chai.request.agent('http://localhost:3261');


    it('测试RESTful API',function(done){
        let t = {title:'测试Restful API新增',
            status:1,
            content:'测试新增需求',
            trainDate:new Date(),
            tag:['test111']
        };


        request.post(`/login`).send({"username":"test","password":"123456"}).then((resUser)=> {

            //console.log(resUser.body);


            request.post(`/v1/training`).send(t).then(res=>{
                expect(res).to.have.status(200);
                expect(res.body).to.be.an("object", "返回对象");
                expect(res.body).haveOwnProperty("code");
                expect(res.body).haveOwnProperty("message");
                expect(res.body).haveOwnProperty("result");
                assert.equal(res.body.result.title,'测试Restful API新增','测试保存的title是否正确');
                return res;

            }).then(function(res0){

                return request.get(`/v1/training/list`).send({page:1,pageSize:1}).then(res=>{
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("object", "返回对象");
                    expect(res.body).haveOwnProperty("code");
                    expect(res.body).haveOwnProperty("result");
                    assert.equal(res.body.result.length,1,'测试列表查询是否正确');

                    return res0;
                })
            }).then(function(res1){
                let tid= res1.body.result.objectId;

                return request.get(`/v1/training/detail/${tid}`).send({}).then(resDetail=>{
                    expect(resDetail.body).haveOwnProperty("code");
                    expect(resDetail.body.code).to.be.equal(0,'测试是否返回查询成功的状态值');
                    console.log(resDetail.body);
                    return res1;
                }).then(res1=>{
                    let tid= res1.body.result.objectId;
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

            }).catch(e=> {
                done(e);
            });
        });


    });
});



