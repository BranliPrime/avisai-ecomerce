import React, { useEffect, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { IoSearch } from "react-icons/io5";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import { FaArrowLeft } from "react-icons/fa";
import useMobile from '../hooks/useMobile';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchPage, setIsSearchPage] = useState(false);
  const [isMobile] = useMobile();
  const params = new URLSearchParams(location.search);
  const searchText = params.get('q') || "";
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState(searchText);

  useEffect(() => {
    setIsSearchPage(location.pathname === "/search");
  }, [location]);

  useEffect(() => {
    if (isSearchPage) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query, isSearchPage]);

  useEffect(() => {
    if (searchText === "") {
      setQuery("");
    }
  }, [searchText]);

  const fetchSuggestions = async (searchTerm) => {
    try {
      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: { search: searchTerm || "" }
      });
      if (response.data.success) {
        setSuggestions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!isSearchPage) {
      navigate("/search");
    } else {
      fetchSuggestions(query);
    }
  };

  const inputProps = {
    placeholder: 'Buscar...',
    value: query,
    onChange: (e, { newValue }) => setQuery(newValue),
    className: 'w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 focus:ring-0',
  };

  return (
    <div className='w-full min-w-[300px] lg:min-w-[1000px] h-10 lg:h-11 rounded-full border border-gray-300 bg-white flex items-center text-neutral-500 transition focus-within:shadow-md relative'>
      <div>
        {
          (isMobile && isSearchPage) ? (
            <Link to={'/'} className='flex justify-center items-center h-full p-2 text-gray-500 hover:text-gray-700'>
              <FaArrowLeft size={18} />
            </Link>
          ) : (
            <button onClick={handleSearch} className='flex justify-center items-center h-full p-2 text-gray-500 hover:text-gray-700'>
              <IoSearch size={18} />
            </button>
          )
        }
      </div>
      <div className='w-full relative'>
        {
          !isSearchPage ? (
            <div onClick={() => navigate("/search")} className='text-sm text-gray-400 cursor-text'>
              <TypeAnimation
                sequence={[
                  'Buscar "mamparas"', 1500,
                  'Buscar "puertas"', 1500,
                  'Buscar "ventanas"', 1500,
                  'Buscar "drywall"', 1500,
                  'Buscar "barandas"', 1500,
                  'Buscar "proyectantes"', 1500,
                  'Buscar "puertas de ducha"', 1500,
                  'Buscar "sistema nova"', 1500,
                  'Buscar "muebles en melamine"', 1500
                ]}
                wrapper="span"
                speed={40}
                repeat={Infinity}
              />
            </div>
          ) : (
            <div className='w-full h-full flex items-center relative'>
              <form onSubmit={handleSearch} className="w-full flex">
                <Autosuggest
                  suggestions={suggestions.slice(0, 7)}
                  onSuggestionsFetchRequested={({ value }) => fetchSuggestions(value)}
                  onSuggestionsClearRequested={() => setSuggestions([])}
                  getSuggestionValue={(suggestion) => suggestion.name}
                  renderSuggestion={(suggestion) => (
                    <div className='p-3 cursor-pointer hover:bg-gray-100 text-gray-800 text-sm border-b border-gray-200'>
                      {suggestion.name}
                    </div>
                  )}
                  onSuggestionSelected={(event, { suggestion }) => {
                    setQuery(suggestion.name);
                    navigate(`/search?q=${suggestion.name}`);
                  }}
                  inputProps={inputProps}
                  theme={{
                    container: 'relative',
                    suggestionsContainer: 'absolute w-full bg-white shadow-md rounded-lg mt-2 z-50',
                    suggestionsList: 'list-none p-0 m-0 max-h-[200px] overflow-y-auto',
                    suggestion: 'p-3 cursor-pointer hover:bg-gray-100 text-gray-800 text-sm border-b border-gray-200'
                  }}
                />
              </form>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default Search;
