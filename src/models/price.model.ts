import * as mongodb from 'mongodb';

export class PriceModel {
    id?: number; // id
    iid?: number; // item_id
    type?: number; // type
    price?: mongodb.Decimal128; // price
    cdate?: Date; // create_date
    edate?: Date; // edit_date
    atv?: boolean; // activated

    static getObject?(data: PriceModel): any {
        let o: any = {};

        if (data.id != null) o.id = data.id;
        if (data.iid != null) o.outlet_item_id = data.iid;
        if (data.type != null) o.type = data.type;
        if (data.price != null) o.price = parseFloat(data.price.toString());
        if (data.cdate != null) o.create_date = data.cdate;
        if (data.edate != null) o.edit_date = data.edate;
        if (data.atv != null) o.activated = data.atv;
        
        return o;
    }
}