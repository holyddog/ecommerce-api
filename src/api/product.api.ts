import * as mongodb from 'mongodb';
import * as express from 'express';

import * as api from '../base-api';
import { Config } from '../config';
import { ItemModel } from '../models/item.model';
import { SliderModel } from '../models/slider.model';
import { ErrorModel } from '../models/error.model';

export class ProductApi {
    private products: mongodb.Collection;
    private sliders: mongodb.Collection;
    private categories: mongodb.Collection;
    private db: mongodb.Db;

    constructor(db: mongodb.Db, app: express.Express) {
        this.db = db;
        this.products = db.collection('items');
        this.categories = db.collection('categories');
        this.sliders = db.collection('sliders');

        app.get('/products', (req, res) => {
            this.getProducts(req, res);
        });

        app.get('/sliders', (req, res) => {
            this.getSliders(req, res);
        });

        app.get('/products/:id', (req, res) => {
            this.getProductById(req, res);
        });
    }

    getSliders(req, res) {
        this.sliders.find({})
            .toArray()
            .then(data => {
                res.json(data.map(o => {
                    return SliderModel.getObject(o);
                }));
            });
    }

    getProducts(req, res) {
        let filter: any = {};
        
        let limit: number = Math.max(0, parseInt(req.query.size) || 100);
        let start: number = Math.max(0, ((parseInt(req.query.page) || 1) - 1) * limit);
        
        if (req.query.q) {
            filter.name = { $regex: "^.*" + req.query.q + ".*$", $options: "i" };
        }
        if (req.query.cat) {
            filter.cats = req.query.cat;
        }

        let products: any[] = [];
        this.products.find(filter)
            .sort({ _id: -1 })
            .skip(start)
            .limit(limit)
            .toArray()
            .then(data => {
                products = data.map(o => {
                    return ItemModel.getObject(o);
                });
                return this.products.count(filter)
            })
            .then(count => {
                res.json({
                    total: count,
                    data: products
                });
            });
    }

    getProductById(req, res) {
        this.products.find({ id: +req.params.id })
            .toArray()
            .then(data => {
                if (data.length > 0) {
                    res.json(ItemModel.getObject(data[0]));
                }
                else {
                    res.json(new ErrorModel(
                        `Product not found.`
                    ));
                }
            });
    }
}