import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import * as mongodb from 'mongodb';

import * as fileUpload from 'express-fileupload';

import errorHandler = require("errorhandler");
import methodOverride = require("method-override");

import { Translation as t } from './translate/translation';

var cors = require('cors');

import { Config } from './config';
import { OAuth2 } from './oauth2';
import { Logger } from './logger';

import { FileApi } from './api/file.api';
import { CategoryApi } from './api/category.api';

import { UserApi } from './api/user.api';
import { OrderApi } from './api/order.api';
import { ProductApi } from './api/product.api';
import { AddressApi } from './api/address.api';

import { ShopApi } from './api/shop.api';

export class Server {
    public app: express.Express;

    public static bootstrap(): Server {
        return new Server();
    };

    constructor() {
        this.app = express();

        this.config().then((db: mongodb.Db) => {
            new OAuth2(this.app, db);

            db.collection('users').createIndex('id', { name: 'pk', unique: true });

            db.collection('items').createIndex('id', { name: 'pk', unique: true });

            db.collection('categories').createIndex('id', { name: 'pk', unique: true });

            db.collection('shops').createIndex('id', { name: 'pk', unique: true });
            
            db.collection('orders').createIndex('ono', { name: 'index_ono', unique: true });

            db.collection('addresses').createIndex('id', { name: 'pk', unique: true });

            this.api(db);
        });
    }

    public api(db: mongodb.Db) {
        let app = this.app;
        app.disable('etag');

        new FileApi(app);
        new CategoryApi(db, app);

        new UserApi(db, app);
        new OrderApi(db, app);
        new ProductApi(db, app);
        new AddressApi(db, app);

        new ShopApi(db, app);

        app.get('/version', (req, res) => {
            let v = Config.Version;

            res.json({ version: `${v.base}.${v.major}.${v.minor}` });
        });

        let server = app.listen(Config.Port, () => {
            Logger.info(`Listening on: ${Config.Host}:${Config.Port}` + ' at ' + new Date().toString());

            let v = Config.Version;
            Logger.info(Config.AppName + ` version ${v.base}.${v.major}.${v.minor}`);
        });
    }

    public config() {
        let app = this.app;

        app.use(cookieParser('ecommerce-api'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(cors());
        app.use(fileUpload());
        app.use(Config.FilePath, express.static(Config.FileDir));

        app.use(function (req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,PATCH,DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

            next();
        });    

        let mongo = mongodb.MongoClient;
        return mongo.connect(Config.MongoUri);
    }
}