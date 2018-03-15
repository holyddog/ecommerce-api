import * as mongodb from 'mongodb';

import { OrderItemModel } from './order.model';
import { ShopModel } from './shop.model';

class DeliveryStatusModel {
    code?: string; // 012
    desc?: string;

    static getObject?(data: DeliveryStatusModel): any {
        let o: any = {};

        if (data.code != null) o.code = data.code;
        if (data.desc != null) o.description = data.desc;
        
        return o;
    }
}

class DeliveryTypeModel {
    type?: number; // E = 2572, R = 2639, P = 2579
    name?: string;  // E, R, P
}

export class PackageModel {
    seq?: number; // sequence
    track?: string; // tracking_no
    weight?: mongodb.Decimal128; // weight
    tqty?: number; // total_qty
    tprice?: mongodb.Decimal128; // total_price
    items?: OrderItemModel[]; // items
    dtype?: DeliveryTypeModel; // delivery_type
    dstatus?: DeliveryStatusModel; // delivery_status

    static getObject?(data: PackageModel): any {
        let o: any = {};

        if (data.seq != null) o.sequence = data.seq;
        if (data.track != null) o.tracking_no = data.track;
        if (data.weight != null) o.weight = parseFloat(data.weight.toString());
        if (data.tprice != null) o.total_price = parseFloat(data.tprice.toString());
        if (data.tqty != null) o.total_qty = data.tqty;
        if (data.items != null) o.items = data.items.map(o => OrderItemModel.getObject(o));
        if (data.dtype != null) o.delivery_type = data.dtype;
        if (data.dstatus != null) o.delivery_status = DeliveryStatusModel.getObject(data.dstatus);
        
        return o;
    }
}