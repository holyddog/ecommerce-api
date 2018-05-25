import * as mongodb from 'mongodb';

import { ItemModel } from './item.model';
import { AddressModel } from './address.model';
import { PackageModel } from './package.model';
import { PaymentLogModel } from './payment-log.model';

export class OrderModel {
    ono?: string; // order_no
    oby?: number; // order_by

    tqty?: number; // total_qty
    tprice?: mongodb.Decimal128; // total_price
    pmt?: PaymentModel; // pmt
    sta?: OrderStatusModel; // status
    dela?: AddressModel; // delivery_address
    
    ocdate?: Date; // order_create_date
    oedate?: Date; // order_edit_date
    cdate?: Date; // create_date
    edate?: Date; // edit_date

    packs?: PackageModel[]; // packages
    items?: OrderItemModel[]; // items

    static getObject?(data: OrderModel): any {
        let o: any = {};

        if (data.ono != null) o.order_no = data.ono;

        if (data.tqty != null) o.total_qty = data.tqty;
        if (data.tprice != null) o.total_price = parseFloat(data.tprice.toString());
        if (data.pmt != null) o.payment = PaymentModel.getObject(data.pmt);
        if (data.sta != null) o.status = OrderStatusModel.getObject(data.sta);
        if (data.dela != null) o.delivery_address = AddressModel.getObject(data.dela);

        if (data.items != null) o.items = data.items.map(o => OrderItemModel.getObject(o));
        if (data.packs != null) o.packages = data.packs.map(o => PackageModel.getObject(o));

        if (data.ocdate != null) o.order_create_date = data.ocdate;
        if (data.oedate != null) o.order_edit_date = data.oedate;
        if (data.cdate != null) o.create_date = data.cdate;
        if (data.edate != null) o.edit_date = data.edate;
        
        return o;
    }
}

export class OrderStatusModel {
    atv?: boolean; // activated
    paid?: boolean; // paid
    fin?: boolean; // finished
    del?: boolean; // deleted

    plog?: PaymentLogModel; // payment_log

    static getObject?(data: OrderStatusModel): any {
        let o: any = {};

        if (data.atv != null) o.activated = data.atv;
        if (data.paid != null) o.paid = data.paid;
        if (data.fin != null) o.finished = data.fin;
        if (data.del != null) o.deleted = data.del;
        
        return o;
    }
}

export class PaymentModel {
    id?: number; // id
    name?: string; // name

    static getObject?(data: PaymentModel): any {
        let o: any = {};
        
        if (data.id != null) o.id = data.id;
        if (data.name != null) o.name = data.name;
        
        return o;
    }
}

export class OrderItemModel {
    item?: ItemModel; // item { id, name, price, pic }
    qty?: number; // qty
    trks?: string[]; // tracking

    static getObject?(data: OrderItemModel): any {
        let o: any = {};

        if (data.item != null) o.item = ItemModel.getObject(data.item);
        if (data.qty != null) o.qty = data.qty;
        if (data.trks != null) o.tracking = data.trks;
        
        return o;
    }
}