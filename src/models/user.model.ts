import * as mongodb from 'mongodb';

import { ShopModel } from './shop.model';

class Password {
    salt: string;
    hash: string;
}

export class UserModel {
    id?: number; // id
    name?: string; // name
    pwd?: Password; // password
    email?: string; // email
    cdate?: Date; // create_date
    edate?: Date; // edit_date
    atv?: boolean; // activated
    shop?: ShopModel; // shop

    static getObject?(data: UserModel): any {
        let o: any = {};

        if (data.id != null) o.id = data.id;
        if (data.email != null) o.email = data.email;
        if (data.name != null) o.name = data.name;
        if (data.cdate != null) o.create_date = data.cdate;
        if (data.edate != null) o.edit_date = data.edate;
        if (data.atv != null) o.activated = data.atv;
        if (data.shop != null) o.shop = ShopModel.getObject(data.shop);
        
        return o;
    }
}