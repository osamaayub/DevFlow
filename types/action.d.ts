import { ZodSchema } from "zod"

export type ActionOptions<T>={
    params?:T,
    schema?:ZodSchema<T>,
    authorize?:boolean,


    

}
export  interface AuthCredentials{
 name:string,
 username:string,
 email:string,
 password:string
}