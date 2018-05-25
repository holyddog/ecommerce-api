export class BankModel {
    id?: number;
    name?: string;
    logo?: string;
}

export class BankAccountModel {
    id?: number;
    name?: string;
    acc?: string;
    bank?: BankModel;

    static getObject?(data: BankAccountModel): any {
        let o: any = {};

        if (data.id != null) o.id = data.id;
        if (data.name != null) o.name = data.name;
        if (data.acc != null) o.account_no = data.acc;
        if (data.bank != null) o.bank = data.bank;
        
        return o;
    }
}