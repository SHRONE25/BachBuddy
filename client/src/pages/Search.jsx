import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import Filter from '../components/Filter';
import PropertyCard from '../components/PropertyCard';
import { searchProperties, toggleSaveProperty, getSavedProperties } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Search = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || '';
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    type: typeParam ? [typeParam] : [],
    gender: '',
    roomType: [],
    amenities: [],
    minPrice: '',
    maxPrice: '',
  });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const params = useMemo(() => {
    const p = { page, limit: 9 };
    if (q) { p.city = q; p.keyword = q; }
    if (filters.type.length === 1) p.type = filters.type[0];
    if (filters.gender) p.gender = filters.gender;
    if (filters.amenities.length) p.amenities = filters.amenities.join(',');
    if (filters.minPrice) p.minPrice = filters.minPrice;
    if (filters.maxPrice) p.maxPrice = filters.maxPrice;
    return p;
  }, [q, filters, page]);

  useEffect(() => {
    setLoading(true);
    // If city search returns nothing, fall back to keyword-only search
    searchProperties(params)
      .then((res) => {
        if (res.data.properties.length === 0 && q && params.city) {
          const { city, ...rest } = params;
          return searchProperties(rest).then((r2) => {
            setProperties(r2.data.properties);
            setPages(r2.data.pages);
          });
        }
        setProperties(res.data.properties);
        setPages(res.data.pages);
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [params, q]);

  useEffect(() => {
    if (!user) { setSavedIds([]); return; }
    getSavedProperties().then((res) => setSavedIds(res.data.map((p) => p._id))).catch(() => {});
  }, [user]);

  const handleToggleSave = async (id) => {
    if (!user) return alert('Please log in to save properties');
    const res = await toggleSaveProperty(id);
    setSavedIds(res.data.savedProperties);
  };

  return (
    <div className="search-page">
      <div className="search-page-header">
        <h2>Search results {q && <>for "{q}"</>}</h2>
        <SearchBar initialValue={q} />
      </div>

      <div className="search-page-body">
        <Filter filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />

        <div className="search-page-results">
          {loading ? (
            <p>Loading...</p>
          ) : properties.length === 0 ? (
            <p className="empty-state">No properties matched your search. Try adjusting filters.</p>
          ) : (
            <>
              <div className="property-grid">
                {properties.map((p) => (
                  <PropertyCard
                    key={p._id}
                    property={p}
                    saved={savedIds.includes(p._id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
              {pages > 1 && (
                <div className="pagination">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      className={`btn ${n === page ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
