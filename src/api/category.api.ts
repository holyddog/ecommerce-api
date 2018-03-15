import * as mongodb from 'mongodb';
import * as express from 'express';

import * as api from '../base-api';
import { Config } from '../config';
import { CategoryModel } from '../models/category.model';
import { ErrorModel } from '../models/error.model';

export class CategoryApi {
    private categories: mongodb.Collection;
    private outletItems: mongodb.Collection;
    private db: mongodb.Db;

    constructor(db: mongodb.Db, app: express.Express) {
        this.db = db;
        this.categories = db.collection('categories');

        app.get('/categories', (req, res) => {
            this.getCategories(req, res);
        });
        
        app.get('/categories/:id', (req, res) => {
            this.getCategoryById(req, res);
        });
    }

    getCategories(req, res) {
        let filter: any = {};
        this.categories.find(filter, { sc: 0 })
            .toArray()
            .then(data => {                
                res.json(data.map(o => {
                    return CategoryModel.getObject(o);
                }));
            });
    }

    getCategoryById(req, res) {
        this.categories.find({ id: req.params.id })
            .toArray()
            .then(data => {                
                if (data.length > 0) {
                    res.json(CategoryModel.getObject(data[0]));
                }
                else {
                    res.json(new ErrorModel(
                        `Category not found.`
                    ));
                }
            });
    }
}