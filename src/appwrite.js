const PROJECT_ID = "6857567e000a7c90d196";
const APPWRITE_ENDPOINT = "https://nyc.cloud.appwrite.io/v1";
const DATABASE_ID = "685757f7002313760d1a";
const COLLECTION_ID = "685758b00000410211ff";

const test = import.meta.env.VITE_APPWRITE_PROJECT_ID;
console.log(test);

import {Client, Databases, ID, Query} from 'appwrite'

const client = new Client()
            .setEndpoint(APPWRITE_ENDPOINT)
            .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    //1. Use AppWrite SDK to check if doc already exist, update count
    try{
        const list = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm)
        ])
        if (list.documents.length > 0) {
            //already exist, update count with 1
            // 2. if it does, update the count
            const doc = list.documents[0];
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1
            })
        } else{
            // 3. If it doesn't, create a new doc with count as 1 
            await database.createDocument
            (
                DATABASE_ID, 
                COLLECTION_ID, 
                ID.unique(), 
                {
                    searchTerm: searchTerm,
                    count: 1,
                    movie_id: movie.id,
                    poster_URL: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                }
            )
        }
    } catch (error){
        console.log(error);    
    }

}

export const getTrendingMovies = async () => {
    try{
        const list = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count")
        ])
        return list.documents;
    } catch (error){
        console.error(error);
    }
}