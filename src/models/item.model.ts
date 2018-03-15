import * as mongodb from 'mongodb';

import { CategoryModel } from './category.model';

export class ItemModel {
    id?: number; // id
    name?: string; // name
    url?: string; // url
    price?: mongodb.Decimal128; // price
    pic?: string; // picture
    pics?: string[]; // pictures
    desc?: string // description
    qty?: number; // qty
    cats?: string[] // categories
    tags?: string[] // tags
    sid?: number; // shop_id
    cdate?: Date; // create_date
    edate?: Date; // edit_date
    inatv?: boolean; // inactive

    static getObject?(data: ItemModel): any {
        let o: any = {};

        if (data.id != null) o.id = data.id;
        if (data.name != null) o.name = data.name;
        if (data.url != null) o.url = data.url;
        if (data.price != null) o.price = parseFloat(data.price.toString());
        if (data.pic != null) o.picture = data.pic;
        if (data.pics != null) o.pictures = data.pics;
        if (data.desc != null) o.description = data.desc;
        if (data.cats != null) o.categories = data.cats;
        if (data.tags != null) o.tags = data.tags;
        if (data.qty != null) o.qty = data.qty;
        if (data.sid != null) o.shop_id = data.sid;
        if (data.cdate != null) o.create_date = data.cdate;
        if (data.edate != null) o.edit_date = data.edate;
        
        return o;
    }
}