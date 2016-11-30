/**
 * Created by husu on 16/10/25.
 */

'use strict';
var router = require('express').Router();
var util =  require('../util');
var fs = require('fs');
var AV = require('leanengine');

router.post('/img',function(req,res){
        var iconFile = req.files.image;
        if(iconFile){

            let fileName = iconFile.path;

            let postfix =  fileName.substring(fileName.lastIndexOf('.')+1).toLocaleUpperCase();

            if(!postfix){
                return res.send({
                    code:-1,
                    message:'文件类型不正确'
                });
            }

            if(!(postfix=='PNG' || postfix == 'JPG' || postfix == 'JPEG' || postfix =='GIF')) {
                return res.send({
                    code:-1,
                    message:'图片只支持jpg、png和gif格式'
                });
            }

            fs.readFile(iconFile.path, function(err, data){
                if(err)
                    return res.send("读取文件失败");
                var base64Data = data.toString('base64');
                var theFile = new AV.File(iconFile.name, {base64: base64Data});
                theFile.save().then(function(theFile){
                    res.send({
                        code:1,
                        message:'上传成功',
                        result:theFile
                    });
                });
            });
        } else {
            return res.send({
                code:1,
                message:'请选择文件',

            });
        }
});

module.exports = router;