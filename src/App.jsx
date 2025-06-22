import { useEffect, useState } from 'react'
import Search from './components/search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import {useDebounce} from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite';

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3NjFlMjVkYTdmNzVmNmYzNTg3NWY4YzFjNzJhY2I3OSIsIm5iZiI6MTc0NzAwNzk2OC43MDcsInN1YiI6IjY4MjEzOWUwOThjMWMxNWQ3NDZlZTFmOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.u152Li-j_LlAW78IWDh0TSgXfSm9iL1NPHAfGOY3yr4`
  }
}

const App = () => {

  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, seterrorMessage] = useState('');
  const [moviesList, setmoviesList] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [trendingMovies, settrendingMovies] = useState([]);

  useDebounce ( () => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = '') => {
    setisLoading(true);
    seterrorMessage('');

    try{
      const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
  
      if(!response.ok){
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();
      
      if(data.response === 'False'){
        seterrorMessage(data.error || 'Failed to fetch movies');
        setmoviesList([]);
        return;
      }

      setmoviesList(data.results || []);

      if (query && data.results.length > 0){
        await updateSearchCount(query, data.results[0]);
      }
      
    } catch(error){
        console.error(`Error fetching movies: ${error}`);
        seterrorMessage(`Error fetching movies. Please try again later.`)
    } finally {
      setisLoading(false);
    }
    
  }

  const loadTrendingMovies = async () => {
    try {
      const result = await getTrendingMovies();
      settrendingMovies(result);
    } catch (error){
        console.log(error);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, [])
  
  
  
  return (
    <main>
      <div className='pattern' />

      <div className='wrapper'>
        <div>
            <center>
              <img src= './logo.png' alt='Logo' />
            </center>
        </div>
        <header>
          <img src='./hero-img.png' alt='Hero Image' />
          <h1> Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle </h1> 
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>
        
        {trendingMovies.length>0 && (
          <section className='trending'>
            <h2> Top Trends</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_URL} alt={movie.title} />
                  {console.log(movie)}
                </li>
              ))}
            </ul>
          </section>
        )}
        
        <section className='all-movies'>
          <h2>All Movies</h2>
          {isLoading ? (
            < Spinner />
          ): errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ): (
            <ul>
              {moviesList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
            )
          }
        </section>

      </div>
    </main>
  )
}

export default App