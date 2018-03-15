export class ProvinceModel {
    id?: number;
    name?: string;
    
    static getObject?(data: ProvinceModel, lang: string = 'th'): any {
        let o: any = {};

        if (data.id != null) o.id = data.id;
        if (data.name != null) o.name = data.name[lang];
        
        return o;
    }
}

export class DistrictModel {
    id?: number;
    name?: string;
    provid?: number // province_id
}

export class AddressModel {
    id?: number; // id
    name?: string; // name
    addr?: string; // address
    pcode?: string; // postcode
    prov?: ProvinceModel; // province
    dist?: DistrictModel; // district
    tel?: string; // telephone
    def?: boolean; // default
    uid?: number; // user_id
    sid?: number; // shop_id
    inatv?: boolean; // inactive

    static getObject?(data: AddressModel): any {
        let o: any = {};

        if (data.id != null) o.id = data.id;
        if (data.name != null) o.name = data.name;
        if (data.addr != null) o.address = data.addr;
        if (data.pcode != null) o.postcode = data.pcode;
        if (data.prov != null) o.province = data.prov;
        if (data.dist != null) o.district = data.dist;
        if (data.tel != null) o.telephone = data.tel;
        if (data.def != null) o.default = data.def;
        if (data.uid != null) o.user_id = data.uid;
        
        return o;
    }
}