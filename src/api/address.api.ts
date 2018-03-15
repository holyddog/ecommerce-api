import * as mongodb from 'mongodb';
import * as express from 'express';

import * as api from '../base-api';
import { Config } from '../config';

import { AddressModel, ProvinceModel } from '../models/address.model';
import { ErrorModel } from '../models/error.model';

export class AddressApi {
    private addresses: mongodb.Collection;
    private provinces: mongodb.Collection;
    private districts: mongodb.Collection;
    private db: mongodb.Db;

    constructor(db: mongodb.Db, app: express.Express) {
        this.db = db;
        this.addresses = db.collection('addresses');
        this.provinces = db.collection('provinces');
        this.districts = db.collection('districts');

        app.get('/provinces', (req, res) => {
            this.getProvinces(req, res);
        });

        app.get('/districts/:province_id', (req, res) => {
            this.getDistricts(req, res);
        });

        app.get('/addresses', api.authenticate, (req, res) => {
            this.getAddresses(req, res);
        });

        app.get('/addresses/:id', api.authenticate, (req, res) => {
            this.getAddressById(req, res);
        });

        app.post('/addresses', api.authenticate, (req, res) => {
            this.addAddress(req, res);
        });

        app.put('/addresses/:id', api.authenticate, (req, res) => {
            this.editAddress(req, res);
        });

        app.delete('/addresses/:id', api.authenticate, (req, res) => {
            this.removeAddress(req, res);
        });
    }

    getDistricts(req, res) {
        this.districts.find({ provid: +req.params.province_id }, { provid: 0, _id: 0 })
            .sort({ name: 1 })
            .toArray()
            .then(data => {
                res.json(data);
            });
    }

    getProvinces(req, res) {
        this.provinces.find({}, { _id: 0 })
            .sort({ id: 1 })
            .toArray()
            .then(data => {
                res.json(data.map(o => {
                    return ProvinceModel.getObject(o);
                }));
            });
    }

    getAddressById(req, res) {
        this.addresses.find({ id: +req.params.id })
            .toArray()
            .then(data => {
                if (data.length > 0) {
                    res.json(AddressModel.getObject(data[0]));
                }
                else {
                    res.json(new ErrorModel(
                        `Address not found.`
                    ));
                }
            });
    }

    getAddresses(req, res) {
        this.addresses.find({ uid: req.user.id, inatv: { $ne: true } })
            .sort({ def: -1, id: 1 })
            .toArray()
            .then(data => {
                res.json(data.map(o => {
                    return AddressModel.getObject(o);
                }));
            });
    }

    addAddress(req, res) {
        let bd: any = req.body;
        let data: AddressModel = {
            id: null,
            addr: bd.address,
            pcode: bd.postcode,
            name: bd.name,
            prov: {
                id: bd.province.id,
                name: bd.province.name
            },
            dist: {
                id: bd.district.id,
                name: bd.district.name
            },
            def: bd.default,
            tel: bd.telephone,
            uid: +req.user.id
        };

        let promise: Promise<any> = Promise.resolve();
        if (data.def == true) {
            promise = this.addresses.updateMany({ uid: +req.user.id }, { $unset: { def: 1 } });
        }

        promise
            .then(() => {
                return api.getNextSeq(this.db, this.addresses.collectionName);
            })
            .then(id => {
                data.id = id;
                return this.addresses.insert(data);
            })
            .then(() => res.json({ success: true }))
            .catch(err => {
                res.json(err);
            });
    }

    editAddress(req, res) {
        let bd: any = req.body;
        let data: AddressModel = {
            addr: bd.address,
            pcode: bd.postcode,
            name: bd.name,
            prov: {
                id: bd.province.id,
                name: bd.province.name
            },
            dist: {
                id: bd.district.id,
                name: bd.district.name
            },
            def: bd.default,
            tel: bd.telephone
        };

        let promise: Promise<any> = Promise.resolve();
        if (data.def == true) {
            promise = this.addresses.updateMany({ uid: +req.user.id }, { $unset: { def: 1 } });
        }

        promise
            .then(() => {
                return this.addresses.update({ id: +req.params.id, uid: +req.user.id }, { $set: data });
            })
            .then(() => res.json({ success: true }))
            .catch(err => {
                res.json(err);
            });
    }

    removeAddress(req, res) {
        this.addresses.updateOne({ id: +req.params.id, uid: +req.user.id }, { $set: { inatv: true }})
            .then(() => res.json({ success: true }))
            .catch(err => {
                res.json(err);
            });
    }
}