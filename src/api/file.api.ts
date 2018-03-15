import * as express from 'express';
import * as fileUpload from 'express-fileupload';

import * as api from '../base-api';

const fs = require('fs');

import { Config } from '../config';

import { ErrorModel } from '../models/error.model';

export class FileApi {
    constructor(app: express.Express) {

        app.post('/upload/product-picture', api.authenticate, (req, res) => {
            this.uploadProductPicture(req, res);
        });

    }

    private getFiles(files: (fileUpload.UploadedFile | fileUpload.UploadedFile[])): fileUpload.UploadedFile[] {
        let f: fileUpload.UploadedFile[] = [];
        if (files.constructor === Array) {
            f = (<fileUpload.UploadedFile[]>files);
        }
        else {
            f.push((<fileUpload.UploadedFile>files));
        }
        return f;
    }

    private upload(files: fileUpload.UploadedFile[], dir: string): Promise<any> {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        let names: string[] = [];
        return new Promise((resolve, reject) => {
            let upload = (index: number) => {
                let i: fileUpload.UploadedFile = files[index];
                if (files[index]) {
                    let fileName = api.generateFileName(i.name);
                    i.mv(dir + '/' + fileName, (err) => {
                        if (err) {
                            reject(err);
                        }
                        names.push('/' + fileName);
                        upload(index + 1);
                    });
                }
                else {
                    resolve(names);
                }
            }
            upload(0);
        });
    }

    uploadProductPicture(req, res) {
        let productDir = Config.FileDir + '/products';
        if (!fs.existsSync(productDir)) {
            fs.mkdirSync(productDir);
        }

        let dir: string = productDir + '/' + req.user._id;
        let files: fileUpload.UploadedFile[] = this.getFiles(req.files.pictures);        
        this.upload(files, dir)
            .then(data => {
                res.json(data.map(o => '/products/' + req.user._id + o));
            });
    }
}