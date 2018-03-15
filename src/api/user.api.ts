import * as mongodb from 'mongodb';
import * as crypto from 'crypto';
import * as request from 'request-promise';
import * as express from 'express';

import * as api from '../base-api';
import { Config } from '../config';
import { Logger } from '../logger';
import { UserModel } from '../models/user.model';
import { ErrorModel } from '../models/error.model';

import { Translation as t } from '../translate/translation';

export class UserApi {
    private users: mongodb.Collection;
    private db: mongodb.Db;

    constructor(db: mongodb.Db, app: express.Express) {
        this.db = db;
        this.users = db.collection('users');

        app.get('/me', api.authenticate, (req, res) => {
            this.me(req, res);
        });

        app.put('/me/info', api.authenticate, (req, res) => {
            this.editUser(req, res);
        });
        app.put('/me/password', api.authenticate, (req, res) => {
            this.editPassword(req, res);
        });
        
        app.post('/login', (req, res) => {
            this.logIn(req, res);
        });
        app.post('/signup', (req, res) => {
            this.signUp(req, res);
        });
    }

    private genRandomString(length: number): string {
        return crypto.randomBytes(Math.ceil(length / 2))
            .toString('hex')
            .slice(0, length);
    }

    private sha512(password: string, salt: string): any {
        var hash = crypto.createHmac('sha512', salt);
        hash.update(password);
        var value = hash.digest('hex');
        return {
            salt: salt,
            hash: value
        };
    };

    private createPassword(password: string): any {
        let salt: string = this.genRandomString(16);
        return this.sha512(password, salt);
    }

    me(req, res) {
        let fields = { id: 1, email: 1, name: 1, outlet: 1, shop: 1 };
        this.users.find({ id: req.user.id }, fields)
            .toArray()
            .then(data => {
                res.json(UserModel.getObject(data[0]))
            });
    }

    editUser(req, res) {
        let bd: any = req.body;
        this.users.updateOne({ id: +req.user.id }, { $set: { name: bd.name } })            
            .then(() => res.json({ success: true }));
    }
    
    editPassword(req, res) {
        let bd: any = req.body;

        this.users.count({ id: +req.user.id, pwd: this.sha512(bd.current_password, req.user.pwd.salt) })
            .then(count => {
                if (count > 0) {
                    return this.users.updateOne({ id: +req.user.id }, { $set: { pwd: this.createPassword(bd.new_password) } });
                }
                else {
                    throw new ErrorModel(
                        t.translate('invalid_current_password', req.query.lang)
                    );
                }
            })               
            .then(() => res.json({ success: true }))
            .catch(err => res.json(err));
    }

    logIn(req, res) {
        let bd = req.body;
        request.post({
            url: `${Config.Host}:${Config.Port}/api/oauth/token`,
            json: true,
            body: {
                "grant_type": "password",
                "username": bd.email,
                "password": bd.password,
                "client_id": req.query.client_id,
                "client_secret": req.query.client_secret
            }
        }).then((result) => {
            res.json({
                "access_token": result.access_token
            });
        }).catch((err) => {
            if (err.statusCode == 401) {
                res.json(new ErrorModel(
                    "Authentication failed."
                ));
            }
            else {
                if (err.error.error && err.error.error.code == -1) {
                    res.json(new ErrorModel(
                        t.translate('invalid_username_or_password', req.query.lang)
                    ));
                }
                else {
                    Logger.error(JSON.stringify(err));
                    res.json(new ErrorModel(
                        `(${err.statusCode}) Unknown error.`
                    ));
                }
            }
        });
    }

    signUp(req, res) {
        let bd: any = req.body;
        let data: UserModel = {
            id: null,
            pwd: this.createPassword(bd.password),
            email: bd.email,
            name: bd.name,
            cdate: new Date()
        };

        api.checkDuplicate(this.users, 'email', req.body.email)
            .then(dup => {
                if (dup) {
                    throw new ErrorModel(
                        t.translate('email_already_used', req.query.lang)
                    );
                }
                else {
                    return api.getNextSeq(this.db, this.users.collectionName);
                }
            })
            .then(id => {
                data.id = id;
                return this.users.insert(data);
            })
            .then(() => res.json({ success: true }))
            .catch(err => {
                res.json(err);
            });
    }
}