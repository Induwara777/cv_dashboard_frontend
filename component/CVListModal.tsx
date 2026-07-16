"use client";


interface File{

id:string;

name:string;

}



interface Props{

files:File[];

setFiles:
React.Dispatch<
React.SetStateAction<File[]>
>;

close:()=>void;

}



export default function CVListModal(
{
files,
setFiles,
close

}:Props
){



function removeFile(id:string){


setFiles(

prev=>

prev.filter(
file=>file.id!==id
)

);


}




return (

<div className="
fixed
inset-0
bg-black/40
flex
items-center
justify-center
">


<div className="
bg-white
rounded-2xl
w-96
p-6
">


<h2 className="
font-bold
text-lg
">

Uploaded CVs ({files.length})

</h2>



<div className="
mt-4
max-h-96
overflow-y-auto
">


{

files.map(file=>(


<div

key={file.id}

className="
flex
justify-between
bg-slate-100
p-3
rounded-lg
mb-2
"

>


<span className="
truncate
">

{file.name}

</span>


<button

onClick={()=>
removeFile(file.id)
}

className="
text-red-500
"

>

Delete

</button>


</div>


))

}



</div>



<button

onClick={close}

className="
mt-4
w-full
bg-slate-800
text-white
rounded-full
py-2
"

>

Close

</button>


</div>


</div>

);


}