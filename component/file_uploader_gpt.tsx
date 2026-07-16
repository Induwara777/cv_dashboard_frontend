"use client";


import {useRef} from "react";
import {FileText} from "lucide-react";


interface UploadedFile{

    id:string;
    name:string;

}



interface Props{


    resumes:UploadedFile[];

    setResumes:
    React.Dispatch<
        React.SetStateAction<UploadedFile[]>
    >;


    jobSpec:UploadedFile|null;


    setJobSpec:
    React.Dispatch<
        React.SetStateAction<UploadedFile|null>
    >;


    setMessage:
    React.Dispatch<
        React.SetStateAction<string>
    >;

}



export default function DocumentUploader(
    {
        resumes,
        setResumes,
        jobSpec,
        setJobSpec,
        setMessage

    }:Props
){


const resumeRef = useRef<HTMLInputElement>(null);

const jobRef = useRef<HTMLInputElement>(null);




function uploadCV(
    e:React.ChangeEvent<HTMLInputElement>
){


const files =
Array.from(e.target.files || []);



const newFiles = files.map(
(file)=>({

id:crypto.randomUUID(),

name:file.name

})

);



setResumes(
prev=>[
...prev,
...newFiles
]
);



setMessage(
`${files.length} CV files uploaded successfully`
);


}




function uploadJob(
e:React.ChangeEvent<HTMLInputElement>
){


const file=e.target.files?.[0];


if(file){


setJobSpec({

id:crypto.randomUUID(),

name:file.name

});


setMessage(
"Job specification uploaded successfully"
);


}


}




return (

<div className="
bg-white
rounded-3xl
p-6
shadow
">


<h2 className="font-bold mb-4">
DOCUMENTS
</h2>



<button

onClick={()=>resumeRef.current?.click()}

className="
w-full
border-2
border-dashed
rounded-xl
p-8
"

>

<FileText/>

<br/>

Upload Resumes PDF

</button>



<input

ref={resumeRef}

type="file"

multiple

accept=".pdf"

hidden

onChange={uploadCV}

/>




<button

onClick={()=>jobRef.current?.click()}

className="
mt-4
w-full
border-2
border-dashed
rounded-xl
p-8
"

>

<FileText/>

<br/>

Upload Job PDF

</button>



<input

ref={jobRef}

type="file"

accept=".pdf"

hidden

onChange={uploadJob}

/>



{

jobSpec &&

<p className="mt-3 text-sm">

Job:
{jobSpec.name}

</p>

}



{

resumes.length>0 &&

<p className="mt-3 text-sm">

{resumes.length}

CV files loaded

</p>

}



</div>

);


}