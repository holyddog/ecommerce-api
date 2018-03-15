class ButtonLinkModel {
    url?: string;
    txt?: string;

    static getObject?(data: ButtonLinkModel): any {
        let o: any = {};
        
        if (data.url != null) o.url = data.url;
        if (data.txt != null) o.text = data.txt;
        
        return o;
    }
}

export class SliderModel {
    img?: string;
    hd?: string;
    txt?: string;
    cap?: string;
    btn?: ButtonLinkModel;

    static getObject?(data: SliderModel): any {
        let o: any = {};

        if (data.img != null) o.image = data.img;
        if (data.hd != null) o.header = data.hd;
        if (data.txt != null) o.text = data.txt;
        if (data.cap != null) o.caption = data.cap;
        if (data.btn != null) o.button = ButtonLinkModel.getObject(data.btn);
        
        return o;
    }
}