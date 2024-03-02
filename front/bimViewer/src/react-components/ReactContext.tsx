import React from "react";
import { Model } from "../classes/Model";
import * as OBC from "openbim-components";

interface IViewerContext{
    projectList: Model[] | null,
    setProjectList: (data: Model[])=>void,
    selectedProject:Model | null,
    setSelectedProject: (data: Model | null)=>void,
    fragmentManager: OBC.FragmentManager | null,
    setFragmentManager: (value: OBC.FragmentManager)=>void,
}

export const ViewerContext = React.createContext<IViewerContext>({
    projectList: null,
    setProjectList: ()=>{},
    selectedProject: null,
    setSelectedProject: ()=>{},
    fragmentManager:null,
    setFragmentManager:(data : OBC.FragmentManager)=>{},
});

export function ViewerProvider(props:{children: React.ReactNode}){
    const [projectList, setProjectList] = React.useState<Model[] | null>(null);
    const [selectedProject, setSelectedProject] = React.useState<Model | null>(null);
    const [fragmentManager, setFragmentManager] = React.useState(null);
    return(
        <ViewerContext.Provider value = {{projectList, setProjectList, selectedProject, setSelectedProject, fragmentManager, setFragmentManager}}>
            {props.children}
        </ViewerContext.Provider>
    )
}