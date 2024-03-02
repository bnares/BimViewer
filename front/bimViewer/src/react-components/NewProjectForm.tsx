import React from 'react'
import { ProjectStatus } from '../classes/Model';
import agent from '../../api/agent';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import { FormHelperText, Input, InputAdornment, TextField } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ImageIcon from '@mui/icons-material/Image';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';
import PercentIcon from '@mui/icons-material/Percent';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import { Note } from '@material-ui/icons';
import TitleIcon from '@mui/icons-material/Title';
import * as OBC from "openbim-components";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    height:600,
    //bgcolor: 'background.paper',
    bgcolor:'grey',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:'center',
   // overflowY:'scroll'
  };

export interface ProjectModalWindow{
    openModal: boolean,
    setOpenModal: (value: boolean)=> void;
    //fragmentManager: OBC.FragmentManager;
}

export interface ProjectFormData{
    name : string,
    description: string,
    status : ProjectStatus,
    file: string | File | Blob,
    fileSrc: string,
    modelProperties: string;
}

const initialValues : ProjectFormData= {
    file: "",
    fileSrc: "",
    status: "Active",
    description:"",
    name:"",
    modelProperties: "test",

}

function NewProjectForm(props: ProjectModalWindow) {
    const [errors, setErrors] = React.useState({
        name: false,
        description: false,
        status: false,
        modelProperties: false,
        fileSrc: false,
    })

    const [savingData, setSavingData] = React.useState<boolean>(false);
    const [values, setValues] = React.useState(initialValues);

    const handleInputChange = (e: any)=>{
        const {name, value} = e.target;
        setValues({
            ...values,
            [name] : value,
        })
    }

    const resetForm = ()=>{
        setValues(()=>initialValues);
        setErrors({ 
            name: false,
            description: false,
            status: false,
            modelProperties: false,
            fileSrc: false,
        })
    }

    const handleClose = ()=>{
        resetForm();
        props.setOpenModal(false);
        setSavingData(false);
    }

    const onChangeFileInput = (e:any)=>{
        if(e.target.files && e.target.files[0]){
            let file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (x: any)=>{
                let fileSrc = x.target.result;
                setValues({
                    ...values,
                    file: file,
                    fileSrc: fileSrc,
                })
            }
            reader.readAsDataURL(file);
        }else{
            setValues({
                ...values,
                name:'',
                fileSrc:''
            })
        }
    }

    const validateForm = ()=>{
        values.name =="" ? errors.name=true : errors.name= false;
        values.description =="" ? errors.description = true : errors.description = false;
        values.fileSrc=="" ? errors.fileSrc = true : errors.fileSrc = false;
        values.modelProperties=="" ? errors.modelProperties = true : errors.modelProperties = false;
        if(Object.values(errors).every(x=>x==false)) return true;
        return false; 
    }

    const submitForm = async (e:any)=>{
        e.preventDefault();
        setSavingData(true);
        if(validateForm() && (values.file instanceof File )){
            var data = await values.file.arrayBuffer();
            const buffer = new Uint8Array(data);
            const model = await props.fragmentManager.load(buffer);
            const blob = new Blob([buffer]);
            const fileFrag = new File([blob], values.file.name);
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("description", values.description);
            formData.append("status", values.status);
            formData.append("file", fileFrag);
            formData.append("fileSrc", values.fileSrc);
            formData.append("modelProperties", JSON.stringify(model.properties));
            
            agent.project.addProject(formData).then(()=>handleClose()).catch(e=>console.warn(e));
        }else{
            console.warn(errors);
            alert("Form not valid try again");
        }
        
    }



  return (
    <>
        <Modal
            open={props.openModal}
            onClose={()=>props.setOpenModal(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box display="flex" flexDirection="column" justifyContent="flex-start" sx={style} component="form" onSubmit={(e)=>submitForm(e)}>
                
                <FormControl>
                    
                    <TextField 
                        name='name' 
                        value={values.name} 
                        error={errors.name}
                        required
                        label="Project Name"
                        sx={{marginBottom:'10px'}}
                        onChange={handleInputChange}
                        
                    />
                    {errors.name && <FormHelperText style={{color:'red'}}>Fill in Name</FormHelperText> }
                    <TextField
                        name='description'
                        value={values.description}
                        error={errors.description}
                        required
                        label="Description"
                        sx={{marginBottom:'10px'}}
                        onChange={handleInputChange}
                        
                    />
                    {errors.description && <FormHelperText style={{color:'red'}}>Fill in Description</FormHelperText>}
                    
                    <Select
                        value={values.status}
                        name='status'
                        onChange={handleInputChange}
                        required
                        defaultValue='active'
                        error={errors.status}
                        sx={{marginBottom:'10px'}}
                        
                    >
                        <MenuItem value={"Active"}>Active</MenuItem>
                        <MenuItem value={"Pending"}>Pending</MenuItem>
                        <MenuItem value="Finished">Finished</MenuItem>
                    </Select>
                    {errors.status && <FormHelperText style={{color:'red'}}>Select Status</FormHelperText>}
                    
                    
                    <label htmlFor="ifcProjectFile" style={{color:'black'}}>Select IFC File</label>
                    <input id='ifcProjectFile' style={{marginBottom:'10px'}}  type='file' required  onChange={onChangeFileInput} name='fileSrc' accept=".ifc"/>
                    {errors.fileSrc ? <FormHelperText style={{color:'red'}}>Select File</FormHelperText> : null}
                    <Box display="flex" justifyContent="center" alignItems="center" gap="10px">
                        <Button variant='contained' color='error' startIcon={<CancelIcon />} onClick={handleClose}>Cancel</Button>
                        {/* <Button variant='contained' color='primary' startIcon={<SendIcon />} type='submit'>Submit</Button> */}
                        <LoadingButton
                            loading = {savingData}
                            loadingPosition="start"
                            startIcon={<SaveIcon />}
                            variant="contained"
                            type='submit'
                        >
                             Save
                        </LoadingButton>
                    </Box>
                    
                </FormControl>
            </Box>
            
        </Modal>
    </>
  )
}

export default NewProjectForm