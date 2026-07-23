import React, { useState, useCallback, useMemo } from "react"



import BookList from "../../components/user/catalog/BookList";
import Navbar1 from "../../components/user/catalog/Navbar";
import { useApi } from "../../hook/useApi";
import { catalog } from "../../services/api";
import ErrorMessage from "../../components/common/ErrorMessage";



export default function Books() {
  const [filter, setFilter] = useState('AllBooks');
  const [sort, setSort] = useState('popularity');

  const fetchBooks = useCallback(() => {
    let filterParam = undefined;
    if (filter !== 'AllBooks') {
      filterParam = filter.toLowerCase();
    }
    return catalog.getBooks({ sort, filter: filterParam });
  }, [filter, sort]);

  const fetchWishlist = useCallback(() => catalog.getWishlist(), []);

  const { data, isLoading, error, refetch: refetchBooks } = useApi(fetchBooks, []);
  const { data: wishlistData, refetch: refetchWishlist } = useApi(fetchWishlist, []);

  const handleWishlistToggle = useCallback(() => {
    refetchWishlist();
    if (filter === 'Recommended') {
      refetchBooks();
    }
  }, [refetchWishlist, refetchBooks, filter]);

  if (error) return <div className="p-6"><ErrorMessage message={error} /></div>;

  const books = Array.isArray(data) ? data : data?.results || [];

  const wishlistMap = useMemo(() => {
    const map = {};
    const items = Array.isArray(wishlistData) ? wishlistData : wishlistData?.results || [];
    items.forEach(item => {
      if (item.book && item.book.id) {
        map[item.book.id] = item.id;
      }
    });
    return map;
  }, [wishlistData]);

  return (

    <div className="flex flex-col rounded-[20px] bg-[#F5F5F5]  mx-auto bg-linear-to-r from-gray-150 min-h-screen to-yellow-100">
      
      <div className="shrink-0">
        <Navbar1 filter={filter} onFilterChange={setFilter} sort={sort} onSortChange={setSort} />
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="py-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            {filter === 'Recommended' ? 'Recommendations' : 'Books'}
          </h1>
        </div>

        {isLoading ? (
          <div className="p-4 text-gray-600">Loading books...</div>
        ) : (
          <BookList books={books} wishlistMap={wishlistMap} onWishlistToggle={handleWishlistToggle} />
        )}
      </div>
      <div className="flex justify-center pb-1">
        <button className="bg-yellow-200 cursor-pointer hover:bg-yellow-400 transition   rounded-full text-sm  px-4 py-2  text-gray-700">  1-25 of 21 → </button>
      </div>

    </div>
  );
}
    
    
  

