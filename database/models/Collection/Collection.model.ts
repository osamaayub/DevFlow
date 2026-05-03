import {model,models}from "mongoose";

import { CollectionSchema, ICollection } from "./Collection.schema";

export const Collection = models?.Collection || model<ICollection>("Collection", CollectionSchema);