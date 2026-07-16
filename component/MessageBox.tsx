interface Props{

message:string;

}


export default function MessageBox(
{
message

}:Props
){


if(!message)
return null;


return (

<div className="
mt-4
bg-green-100
text-green-700
p-3
rounded-xl
">

{message}

</div>

);

}