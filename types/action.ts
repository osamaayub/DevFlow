import { ZodSchema } from "zod"

export type ActionOptions<T>={
    params?:T,
    schema?:ZodSchema<T>,
    authorize?:boolean,


    

}