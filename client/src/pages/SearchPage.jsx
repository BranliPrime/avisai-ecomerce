import React, { useEffect, useState } from 'react';
import CardLoading from '../components/CardLoading';
import SummaryApi from '../common/SummaryApi';
import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import CardProduct from '../components/CardProduct';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useLocation } from 'react-router-dom';
import noDataImage from '../assets/No hay contenido.webp';

const SearchPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadingArrayCard = new Array(10).fill(null);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const params = useLocation();
  const searchText = new URLSearchParams(params.search).get('q') || "";

  const fetchData = async (reset = false) => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: {
          search: searchText.trim() ? searchText : null, 
          page: reset ? 1 : page,
        }
      });

      const { data: responseData } = response;

      if (responseData.success) {
        if (reset || responseData.page === 1) {
          setData(responseData.data);
        } else {
          setData((prev) => [...prev, ...responseData.data]);
        }
        setTotalPage(responseData.totalPage);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchData(true);
  }, [searchText]);

  useEffect(() => {
    if (page > 1) fetchData();
  }, [page]);

  const handleFetchMore = () => {
    if (totalPage > page) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <section className='bg-white'>
      <div className='container mx-auto p-4'>
        <p className='font-semibold'>
          Resultados de búsqueda: {data.length}
        </p>

        <InfiniteScroll
          dataLength={data.length}
          hasMore={totalPage > page}
          next={handleFetchMore}
        >
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 py-4 gap-4'>
            {
              data.map((p, index) => (
                <CardProduct data={p} key={p?._id + "searchProduct" + index} />
              ))
            }

            {loading && (
              loadingArrayCard.map((_, index) => (
                <CardLoading key={"loadingsearchpage" + index} />
              ))
            )}
          </div>
        </InfiniteScroll>

        {!data[0] && !loading && (
          <div className='flex flex-col justify-center items-center w-full mx-auto'>
            <img
              src={noDataImage}
              className='w-full h-full max-w-xs max-h-xs block'
            />
            <p className='font-semibold my-2'>Sin datos encontrados</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchPage;
