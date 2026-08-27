import {getTags} from "@/lib/actions"


const Tags = async () => {
   const {success,data,error}=await  getTags({
     page:1,
     pageSize:10,
     query:""
   })
  const {tags}=data || {};
  return(
    <div className='flex flex-col items-center gap-2'>
      {tags?.map((tag:Tag)=>(
        <div className='' key={tag._id}>
          <p className=''>{tag.name}</p>
          <p>{tag.questions}</p>
        </div>
      ))}
    </div>
  )
};

export default Tags;
