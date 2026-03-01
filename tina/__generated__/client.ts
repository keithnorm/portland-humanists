import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '16013c281cec7b383c24a1b6810d1fad9d730185', queries,  });
export default client;
  