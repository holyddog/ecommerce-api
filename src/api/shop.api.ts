import * as mongodb from 'mongodb';
import * as express from 'express';

import * as api from '../base-api';
import { Logger } from '../logger';

import { ShopModel } from '../models/shop.model';
import { CategoryModel } from '../models/category.model';
import { ErrorModel } from '../models/error.model';

export class ShopApi {
    private shops: mongodb.Collection;
    private users: mongodb.Collection;
    private categories: mongodb.Collection;
    private db: mongodb.Db;

    constructor(db: mongodb.Db, app: express.Express) {
        this.db = db;
        this.shops = db.collection('shops');
        this.users = db.collection('users');
        this.categories = db.collection('categories');

        app.post('/shop/create', api.authenticate, (req, res) => {
            this.create(req, res);
        });
        
        app.get('/shop/categories', api.authenticate, (req, res) => {
            this.getCategories(req, res);
        });
    }

    create(req, res) {
        let bd: any = req.body;
        let data: ShopModel = {
            id: null,
            name: bd.name,
            url: bd.url,
            desc: bd.description,
            cdate: new Date()
        };

        return api.getNextSeq(this.db, this.shops.collectionName)
            .then(id => {
                data.id = id;
                return this.shops.insert(data);
            })
            .then(() => {
                let shop: ShopModel = {
                    id: data.id,
                    name: data.name
                };
                return this.users.update({ id: +req.user.id }, { $set: { shop: shop } });
            })
            .then(() => res.json({ shop_id: data.id }))
            .catch(err => {
                res.json(err);
            });
    }

    getCategories(req, res) {
        let filter: any = {};
        this.categories.find(filter)
            .toArray()
            .then(data => {                
                res.json(data.map(o => {
                    return CategoryModel.getObject(o);
                }));
            });
    }
}