export class ShopModel {
    id?: number; // id
    name?: string; // name
    url?: string; // url
    desc?: string; // description
    cdate?: Date; // create_date
    edate?: Date; // edit_date

    static getObject?(data: ShopModel): any {
        let o: any = {};

        if (data.id != null) o.id = data.id;
        if (data.name != null) o.name = data.name;
        if (data.url != null) o.url = data.url;
        if (data.desc != null) o.description = data.desc;
        if (data.cdate != null) o.create_date = data.cdate;
        if (data.edate != null) o.edit_date = data.edate;
        
        return o;
    }
}