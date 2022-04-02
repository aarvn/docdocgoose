const request = require('supertest');
const app = require('./documents');

describe('Test Documents API', () => {

    test('POST /createDocument/JestTestDoc/nda succeeds', () => {
        return request(app)
        .post('/createDocument/JestTestDoc/nda')
        .expect(200);
    });

    test('GET / succeeds', () => {
        return request(app)
        .get("/")
        .expect(200);
    });
    
    test('GET / returns JSON as data', () => {
        return request(app)
        .get("/")
        .expect('Content-Type', /json/)
        .expect(200);
    });

    test('GET /JestTestDoc succeeds', () => {
        return request(app)
        .get("/JestTestDoc")
        .expect(200);
    });

    test('GET /JestTestDoc returns JSON', () => {
        return request(app)
        .get("/JestTestDoc")
        .expect('Content-Type', /json/)
        .expect(200);
    });

    test('GET /nonExistentDoc fails', () => {
        return request(app)
        .get("/nonExistentTemplate")
        .expect(400);
    });

    test('POST /updateDocument/JestTestDoc succeeds', () => {
        const data = {
            "name": "JestTestDoc",
            "type": "jest",
            "class": "official",
            "dateModified": "",
            "vars": {
                "effectiveDate": "changed var",
                "p1Name": "",
                "p1Address": "",
                "p2Name": "",
                "p2Address": "",
                "possessions": "",
                "issueAtHand": ""
            },
            "forms":{
                "1":["effectiveDate", "p1Name", "p1Address"],
                "2":["p2Name", "p2Address"],
                "3":["issueAtHand", "possessions"]
            },
            "template": "As of [*effectiveDate*] (the 'Effective Date'), it is declared that the following possessions [*possessions*] of [*p1Name*] (the 'Deceased') of [*p1Address*] will have their legal possession passed on to [*p2Name*] (the 'Recipient') of [*p2Address*] on the condition that [*p2Name*] resolves [*issueAtHand*]."
        }
        return request(app)
        .post('/updateDocument/JestTestDoc')
        .send(data)
        .expect(200);
    });

    test('POST /updateDocument/nonExistentDoc fails (document does not exist)', () => {
        const data = {
            "name": "JestTestDoc",
            "type": "jest",
            "class": "official",
            "dateModified": "",
            "vars": {
                "effectiveDate": "changed var",
                "p1Name": "",
                "p1Address": "",
                "p2Name": "",
                "p2Address": "",
                "possessions": "",
                "issueAtHand": ""
            },
            "forms":{
                "1":["effectiveDate", "p1Name", "p1Address"],
                "2":["p2Name", "p2Address"],
                "3":["issueAtHand", "possessions"]
            },
            "template": "As of [*effectiveDate*] (the 'Effective Date'), it is declared that the following possessions [*possessions*] of [*p1Name*] (the 'Deceased') of [*p1Address*] will have their legal possession passed on to [*p2Name*] (the 'Recipient') of [*p2Address*] on the condition that [*p2Name*] resolves [*issueAtHand*]."
        }
        return request(app)
        .post('/updateDocument/nonExistentDoc')
        .send(data)
        .expect(400);
    });

    test('POST /updateDocument/JestTestDoc fails (missing req.body.vars)', () => {
        const data = {
            "name": "JestTestDoc",
            "type": "jest",
            "class": "official",
            "dateModified": "",
            "forms":{
                "1":["effectiveDate", "p1Name", "p1Address"],
                "2":["p2Name", "p2Address"],
                "3":["issueAtHand", "possessions"]
            },
            "template": "As of [*effectiveDate*] (the 'Effective Date'), it is declared that the following possessions [*possessions*] of [*p1Name*] (the 'Deceased') of [*p1Address*] will have their legal possession passed on to [*p2Name*] (the 'Recipient') of [*p2Address*] on the condition that [*p2Name*] resolves [*issueAtHand*]."
        }
        return request(app)
        .post('/updateDocument/JestTestDoc')
        .send(data)
        .expect(400);
    });

    test('DELETE /deleteDocument/JestTestDoc succeeds', () => {
        return request(app)
        .delete('/deleteDocument/JestTestDoc')
        .expect(200);
    });

    test('DELETE /deleteDocument/nonExistentDoc fails (document does not exist)', () => {
        return request(app)
        .delete('/deleteDocument/nonExistentDoc')
        .expect(400);
    });
});
