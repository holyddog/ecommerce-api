import * as mongodb from 'mongodb';
import * as express from 'express';

import * as api from '../base-api';
import { Config } from '../config';
import { ItemModel } from '../models/item.model';
import { SliderModel } from '../models/slider.model';
import { ErrorModel } from '../models/error.model';
import { BankAccountModel } from '../models/bank.model';

export class PaymentApi {
    private bankAccs: mongodb.Collection;
    private db: mongodb.Db;

    constructor(db: mongodb.Db, app: express.Express) {
        this.db = db;
        this.bankAccs = db.collection('bank_accs');

        app.get('/bank-accounts', (req, res) => {
            this.getBankAccounts(req, res);
        });
    }

    getBankAccounts(req, res) {
        this.bankAccs.find({})
            .toArray()
            .then(data => {                
                res.json(data.map(o => {
                    return BankAccountModel.getObject(o);
                }));
            });
    }
}