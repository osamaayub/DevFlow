import TagCards  from "@/components/cards/TagCards"
import LocalSearchBar from "@/components/search/LocalSearchBar"
import DataRenderer from "@/components/shared/DataRender"
import ROUTES from "@/constants/route"
import { EMPTY_TAGS } from "@/constants/states"
import {getTags} from "@/lib/actions"


const Tags = async ({searchParams}:RouteParams) => {
  const {page,pageSize,query,filter}=await searchParams;
   const {success,data,error}=await  getTags({
     page:Number(page)||1,
     pageSize:Number(pageSize)||10,
     query:query,
     filter:filter
   })
  const {tags}=data || {};
  return(
    <>
      <h1 className='h1-bold text-dark100_light900 text-3xl'>Tags</h1>
      <section className='mt-11'>
        <LocalSearchBar
          route={ROUTES.TAGS}
          imgSrc={'/icons/search.svg'}
          placeholder={'Search By Tag Name...'}
          otherClasses='flex-1'
        />
      </section>
      <DataRenderer
              success={success}
              data={tags}
              empty={EMPTY_TAGS}
              error={error}
           render={(tags) => (
        <div className='mt-10 flex w-full gap-4 flex-wrap'>
          {tags.map((tag:Tag)=>(
          <TagCards key={tag._id} {...tag} />
            ))}
        </div>
    )}


      />
  </>
  )
};

export default Tags;
