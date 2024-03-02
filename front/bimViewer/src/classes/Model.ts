import {v4 as uuidv4} from "uuid";

export type ProjectStatus = "Pending" | "Active" | "Finished";

export interface IModel{
    name: string,
    description: string,
    status: ProjectStatus,
    modelProperties: string | null,
    //file: null | File | Blob,
    //fileSrc: null | ArrayBuffer | Blob,
    fileName: string | null,
}

export class Model implements IModel{
    name: string = "";
    description: string = "";
    status: ProjectStatus = "Active";
    fileName: string | null = null;
    //fileSrc: Blob | ArrayBuffer | null = null;
    //file: null | File | Blob = null;
    modelProperties: string | null = null;
    id: string = ""

    constructor(data : IModel, id = uuidv4()){
        this.name = data.name;
        this.description = data.description;
        this.status = data.status;
        this.fileName = data.fileName;
        this.modelProperties = data.modelProperties;
        this.id = id;
    }
}