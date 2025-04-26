import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const queryText = queryParams.get('query') || '';
    setSearchQuery(queryText);

    if (queryText) {
      const fetchResults = async () => {
        try {
          const animeQuery = query(
            collection(db, 'anime'),
            where('title', '>=', queryText),
            where('title', '<=', queryText + '\uf8ff')
          );
          const querySnapshot = await getDocs(animeQuery);
          const fetchedResults = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setResults(fetchedResults);
        } catch (error) {
          console.error('Error fetching search results:', error);
        }
      };

      fetchResults();
    } else {
      setResults([]);
    }
  }, [location.search]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>
      {searchQuery ? (
        <p className="text-gray-400 mb-4">Showing results for: <strong>{searchQuery}</strong></p>
      ) : (
        <p className="text-gray-400 mb-4">Please enter a search query.</p>
      )}

      {results.length > 0 ? (
        <ul className="space-y-4">
          {results.map((result) => (
            <li key={result.id} className="bg-surface-light p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">{result.title}</h4>
              <p className="text-xs text-gray-400">{result.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No results found.</p>
      )}
    </div>
  );
};

export default SearchPage;