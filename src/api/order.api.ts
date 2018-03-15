import * as mongodb from 'mongodb';
import * as express from 'express';
import * as request from 'request-promise';
import * as CryptoJS from 'crypto-js';

import * as api from '../base-api';
import { Config } from '../config';
import { Logger } from '../logger';
import { OrderModel, OrderItemModel, PaymentModel } from '../models/order.model';
import { AddressModel } from '../models/address.model';
import { ErrorModel } from '../models/error.model';
import { PaymentLogModel } from '../models/payment-log.model';

export class OrderApi {
    private orders: mongodb.Collection;
    private db: mongodb.Db;

    constructor(db: mongodb.Db, app: express.Express) {
        this.db = db;
        this.orders = db.collection('orders');

        app.get('/orders', api.authenticate, (req, res) => {
            this.getOrders(req, res);
        });

        app.get('/orders/:no', api.authenticate, (req, res) => {
            this.getOrderByNumber(req, res);
        });

        app.post('/orders', api.authenticate, (req, res) => {
            this.addOrder(req, res);
        });

        app.post('/orders/payment', (req, res) => {
            // 000 - Success when paid with cash channel
            // 001 - Pending (Waiting customer to pay)
            // 002 - Rejected (Failed payment)
            // 003 - User cancel (Failed payment)
            // 999 - Error (Failed payment)

            let bd: any = req.body;

            let paymentLog: PaymentLogModel = {
                ono: bd.order_id,
                amt: bd.amount,
                apc: bd.approval_code,
                pc: bd.payment_channel,
                ps: bd.payment_status,
                crc: bd.channel_response_code,
                crd: bd.channel_response_desc,
                mp: bd.masked_pan,
                rdt: new Date(bd.request_timestamp),
                tdt: new Date(bd.transaction_datetime)
            };
            Logger.debug(JSON.stringify(paymentLog));

            var checkHashStr = `${bd.version}${bd.request_timestamp}${bd.merchant_id}${bd.order_id}${bd.invoice_no}${bd.currency}${bd.amount}${bd.transaction_ref}${bd.approval_code}${bd.eci}${bd.transaction_datetime}${bd.payment_channel}${bd.payment_status}${bd.channel_response_code}${bd.channel_response_desc}${bd.masked_pan}${bd.stored_card_unique_id}${bd.backend_invoice}${bd.paid_channel}${bd.paid_agent}${bd.recurring_unique_id}${bd.user_defined_1}${bd.user_defined_2}${bd.user_defined_3}${bd.user_defined_4}${bd.user_defined_5}${bd.browser_info}${bd.ippPeriod}${bd.ippInterestType}${bd.ippInterestRate}${bd.ippMerchantAbsorbRate}${bd.payment_scheme}`;

            var secretKey = Config.PaymentSecretKey;
            var checkHash = CryptoJS.HmacSHA1(checkHashStr, secretKey).toString().toUpperCase();

            if (checkHash == bd.hash_value) {
                let status = bd.payment_status;
                var serialize = function (obj) {
                    var str = [], p;
                    for (p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            var k = p, v = obj[p];
                            str.push((v !== null && typeof v === "object") ?
                                serialize(v) :
                                encodeURIComponent(k) + "=" + encodeURIComponent(v));
                        }
                    }
                    return str.join("&");
                }

                let queryParams: any = {
                    status: bd.payment_status,
                    order_no: bd.order_id
                };

                if (bd.payment_status == '000') {
                    this.orders.updateOne({ ono: bd.order_id }, {
                        $set: {
                            edate: new Date(),
                            sta: {
                                paid: true,
                                plog: {
                                    mp: bd.masked_pan,
                                    tdt: new Date(bd.transaction_datetime)
                                }
                            }
                        }
                    }).then(() => {
                        res.redirect(Config.PaymentSuccessCallbackUrl + '?' + serialize(queryParams));
                    }).catch((err) => {
                        res.json(err);
                        Logger.error(JSON.stringify(err));
                    });
                }
                else {
                    res.redirect(Config.PaymentFailCallbackUrl + '?' + serialize(queryParams));
                }
            }
            else {
                res.json(new ErrorModel(
                    `Hash check = failed. Can not use this response data.`
                ));
            }
        });
    }

    getOrders(req, res) {
        this.orders.find({ oby: +req.user.id, "sta.paid": true }, { ono: 1, tqty: 1, tprice: 1, pmt: 1, sta: 1, items: 1, cdate: 1, edate: 1 })
            .sort({ _id: -1 })
            .toArray()
            .then(data => {
                res.json(data.map(o => {
                    return OrderModel.getObject(o);
                }));
            });
    }

    getOrderByNumber(req, res) {
        this.orders.find({ oby: +req.user.id, ono: req.params.no })
            .toArray()
            .then(data => {
                if (data.length > 0) {
                    res.json(OrderModel.getObject(data[0]));
                }
                else {
                    res.json(new ErrorModel(
                        `Order not found.`
                    ));
                }
            });
    }

    addOrder(req, res) {
        let now: Date = new Date();
        let bd: any = req.body;

        let payment: PaymentModel = {
            id: bd.payment.id,
            name: bd.payment.name
        };

        let addr: any = bd.delivery_address;
        let address: AddressModel = {
            id: addr.id,
            name: addr.name,
            addr: addr.address,
            pcode: addr.postcode,
            prov: addr.province,
            dist: addr.district,
            tel: addr.telephone
        };

        let items: OrderItemModel[] = [];

        for (let i of bd.items) {
            let p: any = i.item;

            items.push({
                qty: i.qty,
                item: {
                    id: p.id,
                    name: p.name,
                    price: mongodb.Decimal128.fromString(p.price.toString()),
                    pic: p.picture,
                    sid: p.shop_id
                }
            });
        }

        let data: OrderModel = {
            ono: null,
            oby: +req.user.id,
            tqty: bd.total_qty,
            tprice: bd.total_price,
            dela: address,
            pmt: payment,
            items: items,
            cdate: now
        };

        let yy = now.getFullYear().toString().slice(-2);
        let mm = ("00" + (now.getMonth() + 1)).slice(-2);
        let dd = ("00" + now.getDate()).slice(-2);
        let ref = yy + mm + dd;

        api.runningNo(this.db, 'orders_no', ref)
            .then(no => {
                data.ono = no;
                return this.orders.insertOne(data);
            })
            .then(() => {
                res.json({
                    order_no: data.ono
                });
            })
            .catch(err => {
                res.json(err);
            });
    }
}