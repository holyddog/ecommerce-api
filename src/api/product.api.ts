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
            this.getProducts2(req, res);
        });

        app.get('/sliders', (req, res) => {
            this.getSliders(req, res);
        });

        app.get('/products/:id', (req, res) => {
            this.getProductById(req, res);
        });
    }

    getProducts2(req, res) {
        let count: number = 0;
        let categories: any[] = [];
        let products: ItemModel[] = [];
        this.products.find({}, {})
                .sort({ _id: -1 })
                .toArray()
                .then(data => {
                    products = data.map(o => {
                        return ItemModel.getObject(o);
                    });
                    return this.products.count({});
                })
                .then(c => {
                    count = c;
                    return this.categories.findOne({});
                })
                .then(cdata => {
                    res.json({
                        categories: cdata,
                        products: products,
                        count: count
                    });
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
        let filter: any = { inatv: { $ne: true } };
        let home: boolean = false;
        if (req.query) {
            if (req.query.category) {
                filter["cats"] = req.query.category;
            }
            else if (req.query.type == 'home') {
                home = true;
            }
        }

        if (home) {
            let result: any = {
                best: null,
                new: null
            };
            this.products.find(Object.assign({ tags: "best-seller" }, filter), { desc: 0, pics: 0 })
                .sort({ _id: -1 })
                .limit(4)
                .toArray()
                .then(data => {
                    result.best = data.map(o => {
                        return ItemModel.getObject(o);
                    });
                    return this.products.find(filter).sort({ _id: -1 }).limit(4).toArray();
                })
                .then(data => {
                    result.new = data.map(o => {
                        return ItemModel.getObject(o);
                    });
                    res.json(result);
                });
        }
        else {
            let limit: number = Math.max(0, parseInt(req.query.size) || 100);
            let start: number = Math.max(0, ((parseInt(req.query.page) || 1) - 1) * limit);

            if (req.query && req.query.q) {
                filter = Object.assign({ name: { $regex: '.*' + req.query.q + '.*', $options: 'i' } }, filter);
            }

            let products: any[] = [];
            this.products.find(filter, { desc: 0, pics: 0 })
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