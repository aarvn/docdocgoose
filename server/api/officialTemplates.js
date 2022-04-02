const express = require('express');
const router = express();
router.use(express.json());
var fs = require('fs');

//Get all official templates
router.get('/', (req, res) => {

    fs.readdir('files/templates', (err, fileNames) => {
        if(err){
            res.status(400).json({
                message: "Failed get request to /officialTemplates",
                error: "Could not get official templates"
            });
        }
        else{
            var ret = [];
            var k = 0;
            fileNames.forEach(function(fileName){
                fs.readFile('files/templates/'+fileName, 'utf-8', function(err, fileData) {
                    if (err) {
                        res.status(400).json({
                            message: "Failed get request to /officialTemplates",
                            error: "Could not get official templates"
                        });
                    }
                    else{
                        k+=1;
                        ret.push(JSON.parse(fileData));

                        //Sort templates by template name
                        function compareStrings(a, b) {
                            a = a.toLowerCase();
                            b = b.toLowerCase();
                            return (a < b) ? -1 : (a > b) ? 1 : 0;
                        }
                        ret.sort(function(a, b) {
                            return compareStrings(a.name, b.name);
                        })

                        if(k == fileNames.length){
                            res.status(200).json({
                                message: "Successful get request to /officialTemplates/",
                                data: ret
                            })
                        }
                    }
                })
            });
        }
    });
});

//Get single official template
router.get('/:templateName', (req, res) => {
    fs.readFile('files/templates/'+req.params.templateName+'.json', 'utf8', function readFileCallback(err, template){ 
        if (err){
            res.status(400).json({
                message: "Failed get request to /officialTemplates",
                error: "Official template '" + req.params.templateName + "' does not exist"
            });
        }
        else{
            res.status(200).json({
                message: "Successful get request to /officialTemplates/"+req.params.templateName,
                data: JSON.parse(template)
            })
        } 
    });
});

//Post a new official template (admin only)
router.post('/', (req, res) => {
    if(req.body.name && req.body.type && req.body.class && req.body.vars && req.body.forms && req.body.template){
        const officialTemplate = {
            name: req.body.name,
            type: req.body.type,
            class: req.body.class,
            dateModified: "",
            vars: req.body.vars,
            forms: req.body.forms,
            template: req.body.template
        }
        fs.writeFile('files/templates/'+req.body.name+'.json', JSON.stringify(officialTemplate), function(err, result) {
            if (err){
                res.status(400).json({
                    message: "Failed post request to /officialTemplates",
                    error: "Failed write to file"
                });
            }
            else{
                res.status(200).json({
                    message: "Successful post request to /officialTemplates",
                    data: result
                });
            } 
        });
    }
    else{
        res.status(400).json({
            message: "Failed post request to /officialTemplates",
            error: "One of more of template name, class, datemodified, vars, forms, or template is missing from the request body."
        });
    };
})

//Delete an offical template
router.delete('/deleteTemplate/:templateName', function(req, res) {
    fs.unlink('files/templates/'+req.params.templateName+'.json', (err) => {
        if (err){
            res.status(400).json({
                message: "Failed delete request to /deleteTemplate/"+req.params.templateName,
                error: "Failed to delete "+req.params.templateName+".json"
            });
        }
        else{
            res.status(200).json({
                message: "Successful delete request to /deleteDocument/"+req.params.templateName,
                //data: document
            });
        } 
    });
});

module.exports = router;