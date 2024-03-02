import React, { Children } from 'react'
import * as OBC from "openbim-components";
import { FragmentsGroup } from 'bim-fragment';
import * as THREE from "three";
import { PlanView } from 'openbim-components/fragments/FragmentPlans/src/types';
import { ViewerContext } from './ReactContext';
import HomePage from './HomePage';
import agent from '../../api/agent';
import { AxiosResponse } from 'axios';



export function IFCViewer() {
    
    let viewer : OBC.Components;
    const [fileBlob, setFileBlob] = React.useState<Blob | null>(null);
    const {setFragmentManager, selectedProject, setSelectedProject} = React.useContext(ViewerContext);
    const [openBimViewer, setOpenBimViewer] = React.useState<boolean>(false);
    //const frag = new OBC.FragmentManager(viewer);

    const downloadFile = async (ifcLoader : OBC.FragmentIfcLoader)=>{
        if(selectedProject && selectedProject.fileName){
            const file : AxiosResponse<Blob> = await agent.project.getFileModel(`${selectedProject.fileName}`,{responseType:'blob'});
            if(file.status==200){
                setFileBlob(file.data);
                
            }
            console.log("file", file);
            console.log(typeof(file))
            //var data = await file.arrayBuffer();
            //var buffer = new Uint8Array(data);
        }
        
    }

    const loadFileToScene = async (ifcLoader : OBC.FragmentIfcLoader, file : Blob, fileName: string)=>{
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const model = await ifcLoader.load(buffer, fileName);
        const scene = viewer.scene.get();
        scene.add(model)
    }

    React.useEffect(()=>{
        //downloadFile();
    },[])

    const createViewer = async ()=>{
    viewer = new OBC.Components();
    
    const sceneComponent = new OBC.SimpleScene(viewer); //defines where our object will live in 3D
    viewer.scene =sceneComponent;
    const scene = sceneComponent.get();
    scene.background = null;
    sceneComponent.setup();
    const viewerContainer = document.getElementById("viewer-container") as HTMLDivElement;
    console.log("viewerContainer: ", viewerContainer);
    console.log("viewer: ", viewer);
    const rendererComponent = new OBC.PostproductionRenderer(viewer, viewerContainer); //allows us to see things moving around
    viewer.renderer = rendererComponent;

    const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer); //defines where we are in 3D world
    viewer.camera = cameraComponent;
    cameraComponent.controls.setLookAt(10,10,10,0,0,0);
    const grid = new OBC.SimpleGrid(viewer);

    const raycasterComponent = new OBC.SimpleRaycaster(viewer); //this has to be added before the viewer.init() and after the render is set -rendererComponent
    viewer.raycaster = raycasterComponent;

    viewer.init();
    cameraComponent.updateAspect();
    rendererComponent.postproduction.enabled = true; //must be added after viewer.init() function 
    // scene.add(cube);
    // viewer.meshes.push(cube);

    const fragmentManager = new OBC.FragmentManager(viewer); //fragment manager must be after viewer.init() and before ifcLoader
    //setFragmentManager(fragmentManager);

        const ifcLoader = new OBC.FragmentIfcLoader(viewer); //it goes with FragmentHighlighter some internal libraries
        ifcLoader.settings.wasm = {
        path: "https://unpkg.com/web-ifc@0.0.44/",
        absolute: true
        }

    
    const highlighter = new OBC.FragmentHighlighter(viewer); //to select elements by mouse
    
    highlighter.setup();

    
    

    const culler = new OBC.ScreenCuller(viewer); //creating a procces to not display elements which are not in our camera 
    cameraComponent.controls.addEventListener("sleep",()=>{ //when camera stops ('sleep' event) we tel the cooler it needs to be updated
        culler.needsUpdate = true;
    })

    viewerContainer.addEventListener("mouseup", ()=>culler.needsUpdate = true);
    viewerContainer.addEventListener("wheel", ()=>culler.needsUpdate = true);

    async function onModelLoaded(model : FragmentsGroup){
        try{
            
            highlighter.update(); //to tel higlighter taaht new model was loaded
            highlighter.events.select.onHighlight.add((fragmentMap)=>{
                const expressId = [...Object.values(fragmentMap)[0]][0]
            })
            for(const fragment of model.items){
                culler.add(fragment.mesh);
            }
            culler.needsUpdate = true;
        }catch(e){
            
            console.warn("Error from onModelLoaded function: ",e);
            alert(e);
        }
        
    }

    function ExportModelProperties(model: FragmentsGroup, fileName:string="fragmentProperties"){
        var prop = {...model.properties};
        var json = JSON.stringify(prop,null,2);
        const blob = new Blob([json],{type:"application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }

    function ImportModelProperties(model : FragmentsGroup){
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        const reader = new FileReader();
        var projects={};
        reader.addEventListener("load",async ()=>{
            const json = reader.result as string;
            if(!json)return;
            projects = JSON.parse(json);
            console.log("projects Object: ",projects);
            model.properties = projects;
            await onModelLoaded(model);
        })
        input.addEventListener('change', () => {
            const filesList = input.files
            if (!filesList) { return }
            reader.readAsText(filesList[0])
        })
        input.click();
    }

    function exportFramgments(model : FragmentsGroup){
        
        const fragmentsBinary = fragmentManager.export(model)    
        const blob = new Blob([fragmentsBinary])
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${model.name.replace(".ifc","")}.frag`;
        a.click();
        URL.revokeObjectURL(url);
    }


    ifcLoader.onIfcLoaded.add(async (model)=>{
        console.log("model in onIFCLoaded: ",model);
        //await downloadFile(ifcLoader);
        //exportFramgments(model);
        //ExportModelProperties(model);
        //onModelLoaded(model);
    })

    fragmentManager.onFragmentsLoaded.add((model)=>{
        ImportModelProperties(model);
    })

    const importFragmentButn = new OBC.Button(viewer);
    importFragmentButn.materialIcon = "upload";
    importFragmentButn.tooltip = "Load FRAG";
    importFragmentButn.onClick.add( ()=>{
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.frag'
        const reader = new FileReader()
        reader.addEventListener("load", async () => {
          const binary = reader.result
          if (!(binary instanceof ArrayBuffer)) { return }
          const fragmentBinary = new Uint8Array(binary);
          await fragmentManager.load(fragmentBinary)
        
        })
        input.addEventListener('change', () => {
          const filesList = input.files
          if (!filesList) { return }
          reader.readAsArrayBuffer(filesList[0])
        })
        input.click()
    })


    ifcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;
    ifcLoader.settings.webIfc.OPTIMIZE_PROFILES = true;

    

    const toolbar = new OBC.Toolbar(viewer);

    toolbar.addChild(
        
    )
    viewer.ui.addToolbar(toolbar);

    
    
    }

    React.useEffect(()=>{
        
        createViewer();
        
        
        return ()=>{
            viewer.dispose();
            setSelectedProject(null);
            //setViewer(null);
        }
    },[])

  return (
    <>
        
            
                <div
                    id="viewer-container"
                    className="dashboard-card"
                    style={{ minWidth: 0, position: "relative" }}
                >
                   
                </div> 
            
                

                
        
        
    </>
    
  )
}

