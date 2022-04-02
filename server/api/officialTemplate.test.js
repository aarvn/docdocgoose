const request = require('supertest');
const app = require('./officialTemplates');

describe('Test Offical Templates API', () => {

    test('GET / succeeds', () => {
        return request(app)
        .get("/")
        .expect(200);
    });
    
    test('GET / returns JSON', () => {
        return request(app)
        .get("/")
        .expect('Content-Type', /json/)
        .expect(200);
    });

    test('GET /nda suceeds', () => {
        return request(app)
        .get("/nda")
        .expect(200);
    });

    test('GET /nda returns JSON', () => {
        return request(app)
        .get("/")
        .expect('Content-Type', /json/)
        .expect(200);
    });

    test('GET /nonExistentTemplate fails', () => {
        return request(app)
        .get("/nonExistentTemplate")
        .expect(400);
    });

    test('POST / succeeds', () => {
        const data = {
            "name": "JestTestTemplate",
            "type": "jest",
            "class": "official",
            "dateModified": "",
            "vars": {
                "effectiveDate": "",
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
        .post('/')
        .send(data)
        .expect(200);
    });

    test('POST / fails (is missing the name parameter)', () => {
        const data = {
            "type": "jest",
            "class": "official",
            "dateModified": "",
            "vars": {
                "effectiveDate": "",
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
        .post('/')
        .send(data)
        .expect(400);
    });
    
    test('DELETE /deleteTemplate/JestTestTemplate succeeds', () => {
        return request(app)
        .delete('/deleteTemplate/JestTestTemplate')
        .expect(200);
    });

    test('DELETE /deleteTemplate/nonExistentTemplate fails (template does not exist)', () => {
        return request(app)
        .delete('/deleteTemplate/nonExistentTemplate')
        .expect(400);
    });
});
