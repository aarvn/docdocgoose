const express = require('express');
const router = express();
router.use(express.json());
const encryptor = require('./encryptor');
var fs = require('fs');

// Get all documents of user
router.get('/', function (req, res) {
    fs.readdir('files/documents', (err, fileNames) => {
        if (err) {
            res.status(400).json({
                message: 'Failed get request to /documents',
                error: 'Could not get official templates'
            });
        } else {
            var ret = [];
            var k = 0;
            fileNames.forEach(function (fileName) {
                fs.readFile('files/documents/' + fileName, 'utf-8', function (err, fileData) {
                    if (err) {
                        res.status(400).json({
                            message: 'Failed get request to /documents',
                            error: 'Could not get official templates'
                        });
                    } else {
                        k += 1;
                        ret.push(encryptor.decrypt(JSON.parse(fileData)));
                        if (k === fileNames.length) {
                            // Sort alphabetically by document name
                            ret.sort(function (a, b) {
                                return compareStrings(a.name, b.name);
                            });
                            res.status(200).json({
                                message: 'Successful get request to /documents',
                                data: ret
                            });
                        }
                    }
                });
            });
        }
    });
});

function compareStrings (a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return (a < b) ? -1 : (a > b) ? 1 : 0;
}
// Get single document of user
router.get('/:documentName', function (req, res) {
    fs.readFile('files/documents/' + req.params.documentName + '.json', 'utf8', function readFileCallback (err, fileData) {
        if (err) {
            res.status(400).json({
                message: 'Failed get request to /documents/' + req.params.documentName,
                error: "document '" + req.params.documentName + "' does not exist"
            });
        } else {
            res.status(200).json({
                message: 'Successful get request to /officialTemplates/' + req.params.documentName,
                data: encryptor.decrypt(JSON.parse(fileData))
            });
        }
    });
});

// Post new document from template for a user
router.post('/createDocument/:documentName/:templateName', function (req, res) {
    fs.readFile('files/templates/' + req.params.templateName + '.json', 'utf8', function readFileCallback (err, template) {
        if (err) {
            res.status(400).json({
                message: 'Failed post request to /createDocument/' + req.params.documentName + '/' + req.params.templateName,
                error: "Official template '" + req.params.templateName + "' does not exist"
            });
        } else {
            var currentdate = new Date();
            var datetime = ('0' + currentdate.getHours()).slice(-2) + ':' +
                            ('0' + currentdate.getMinutes()).slice(-2) + ' - ' +
                            ('0' + currentdate.getDate()).slice(-2) + '/' +
                            ('0' + (currentdate.getMonth() + 1)).slice(-2) + '/' +
                            currentdate.getFullYear();

            template = JSON.parse(template);
            template.name = req.params.documentName;
            template.dateModified = 'Modified: ' + datetime.toString();

            fs.writeFile('files/documents/' + req.params.documentName + '.json', JSON.stringify(encryptor.encrypt(JSON.stringify(template))), function (err, document) {
                if (err) {
                    res.status(400).json({
                        message: 'Failed post request to /createDocument/' + req.params.documentName + '/' + req.params.templateName,
                        error: 'Failed to write document'
                    });
                } else {
                    res.status(200).json({
                        message: 'Successful post request to /createDocument/' + req.params.documentName + '/' + req.params.templateName,
                        data: document
                    });
                }
            });
        }
    });
});

// Update a document of a user
router.post('/updateDocument/:documentName', function (req, res) {
    if (req.params.documentName && req.body.vars) {
        fs.readFile('files/documents/' + req.params.documentName + '.json', function (err, document) {
            if (err) {
                res.status(400).json({
                    message: 'Failed post request to /updateDocument/' + req.params.documentName,
                    error: "Document of name '" + req.params.documentName + "' does not exist"
                });
            } else {
                var currentdate = new Date();
                var datetime = ('0' + currentdate.getHours()).slice(-2) + ':' +
                                ('0' + currentdate.getMinutes()).slice(-2) + ' - ' +
                                ('0' + currentdate.getDate()).slice(-2) + '/' +
                                ('0' + (currentdate.getMonth() + 1)).slice(-2) + '/' +
                                currentdate.getFullYear();

                req.body.dateModified = 'Modified: ' + datetime.toString();

                // temp["documents."+req.params.documentName] = encryptor.encrypt(JSON.stringify(req.body));
                fs.writeFile('files/documents/' + req.params.documentName + '.json', JSON.stringify(encryptor.encrypt(JSON.stringify(req.body))), function (err, document) {
                    if (err) {
                        res.status(400).json({
                            message: 'Failed post request to /updateDocument/' + req.params.documentName,
                            error: 'Failed to write document'
                        });
                    } else {
                        res.status(200).json({
                            message: 'Successful post request to /updateDocument/' + req.params.documentName,
                            data: document
                        });
                    }
                });
            }
        });
    } else {
        res.status(400).json({
            message: 'Failed post request to /updateDocument/' + req.params.username + '/' + req.params.documentName,
            error: 'Request body is missing'
        });
    }
});

// Delete a document
router.delete('/deleteDocument/:documentName', function (req, res) {
    fs.unlink('files/documents/' + req.params.documentName + '.json', (err) => {
        if (err) {
            res.status(400).json({
                message: 'Failed delete request to /deleteDocument/' + req.params.documentName,
                error: 'Failed to delete ' + req.params.documentName + '.json'
            });
        } else {
            res.status(200).json({
                message: 'Successful delete request to /deleteDocument/' + req.params.documentName
                // data: document
            });
        }
    });
});

module.exports = router;
