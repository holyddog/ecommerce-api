export class CategoryModel {
    id?: number;
    name?: string;
    sc?: CategoryModel[];

    static getObject?(data: CategoryModel): any {
        let o: any = {};

        if (data.id != null) o.id = data.id;
        if (data.name != null) o.name = data.name;
        if (data.sc != null) o.sub_categories = data.sc.map(o => CategoryModel.getObject(o));
        
        return o;
    }
}