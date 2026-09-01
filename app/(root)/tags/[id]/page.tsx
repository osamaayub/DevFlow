import QuestionCard from "@/components/cards/QuestionCard"
import LocalSearchBar from "@/components/search/LocalSearchBar"
import DataRenderer from "@/components/shared/DataRender"
import ROUTES from "@/constants/route"
import { EMPTY_QUESTION } from "@/constants/states"
import {getTagQuestions} from "@/lib/actions"

async function TagDetails({params,searchParams}: RouteParams){
    const {id} = await params
    const {page,pageSize,query}=await searchParams;
    const {success,data,error}=await getTagQuestions({tagId:id,page:Number(page)||1,pageSize:Number(pageSize)||10,query:query})
    const {tag,questions}=data || {};
  return (
    <>
        <h1 className="h1-bold text-dark100_light900">{tag?.name}</h1>
        <p className="mt-3 text-base text-dark200_light800">{tag?.questions} Questions</p>
        
        <div className="mt-11">
            <LocalSearchBar
                route={ROUTES.TAG(id)}
                imgSrc={'/icons/search.svg'}
                placeholder={'Search questions in this tag...'}
                otherClasses='flex-1'
                iconPosition='left'
            />
        </div>

        <DataRenderer
            success={success}
            data={questions}
            empty={EMPTY_QUESTION}
            error={error}
            render={(questionsData) => (
                <div className='mt-10 flex w-full flex-col gap-6'>
                    {Array.isArray(questionsData) && questionsData.map((question: Question) => (
                        <QuestionCard key={question._id} question={question} />
                    ))}
                </div>
            )}
        />
    </>
  )
}

export default TagDetails