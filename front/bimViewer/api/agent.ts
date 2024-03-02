import axios, { AxiosResponse } from "axios";

axios.defaults.baseURL = "https://localhost:7233/api/";

const responseBody = (response : AxiosResponse)=>response.data;

const request = {
    get: (url: string)=> axios.get(url).then(responseBody),
    post: (url: string, body:{})=>axios.post(url, body).then(responseBody),
    delete: (url: string)=>axios.delete(url).then(responseBody)
}

const project = {
    allProject: ()=>request.get("Model/allProjects"),
    getProject: (id: number)=>request.get(`Model/getProject/${id}`),
    addProject: (body:{})=>request.post('Model/newProject', body),
    getFileModel: (fileName: string, config?: any)=>request.get(`Model/Fragments/${fileName}`, config),
}

const agent = {
    project,
}

export default agent;