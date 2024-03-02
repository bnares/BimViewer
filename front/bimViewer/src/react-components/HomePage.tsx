import React from 'react'
import { ViewerContext } from './ReactContext';
import agent from "../../api/agent"
import { Button } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ProjectCard from './ProjectCard';
import { Model } from '../classes/Model';
import NewProjectForm from './NewProjectForm';
import { IFCViewer } from './IFCViewer';
import * as OBC from "openbim-components";

export interface IBimViewer{
    openBimViewer: boolean,
    setOpenBimViewer: (value: boolean)=>void,
}

function HomePage() {
    const [openBimViewer, setOpenBimViewer] = React.useState<boolean>(false);
    const [openModal, setOpenModal]= React.useState<boolean>(false);
    const {projectList, setProjectList} = React.useContext(ViewerContext);
    const {selectedProject, setSelectedProject} = React.useContext(ViewerContext);

    //const viewer = new OBC.Components();
    
    //const fragmentManager = new OBC.FragmentManager(viewer);
    //const fragmentManager = "lol";
    React.useEffect(()=>{
        agent.project.allProject().then(resp=>setProjectList(resp)).catch((e)=>console.warn(e));
        
    },[openModal])

    //console.log("fragmentManager: ", fragmentManager);

  return (
    <div className="page" id="projects-page">
        <div>
            <Button  variant='contained' onClick={()=>setOpenModal(true)} startIcon={<FileUploadIcon />}>New Project</Button>
        </div>
        
        <div id="projects-list">
            {(projectList!=null && projectList.length > 0) ? projectList.map((item : Model)=>(<ProjectCard key={item.id}  model={{...item}} openBimViewer={openBimViewer} setOpenBimViewer={setOpenBimViewer}    />)) : (<h2>No Project To Display</h2>)}
        </div>
       {openModal ? <NewProjectForm openModal = {openModal} setOpenModal={setOpenModal}  /> : null}
       {openBimViewer && <IFCViewer />}
    </div>
  )
}

export default HomePage