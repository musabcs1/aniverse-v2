import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';

const AnimeSeasonPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const episodes = Array.from({ length: 13 }, (_, i) => ({
    number: i + 1,
    thumbnail: `https://via.placeholder.com/150?text=Episode+${i + 1}`,
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
      <div className="flex flex-grow bg-[#0D0D1A] pt-20">
        {/* Episodes List */}
        <div className="w-1/4 bg-[#1A1A2E] text-white overflow-y-auto">
          <button
            className="w-full bg-red-600 py-3 text-center text-white font-bold hover:bg-red-700"
            onClick={() => navigate(-1)}
          >
            back to details
          </button>
          <h2 className="text-center text-xl font-bold py-4">All Episodes</h2>
          <ul>
            {episodes.map((episode) => (
              <li
                key={episode.number}
                className="py-2 px-4 hover:bg-red-500 cursor-pointer border-b border-gray-700"
              >
                episode {episode.number}
              </li>
            ))}
          </ul>
        </div>

        {/* Video Player and Thumbnails */}
        <div className="flex-1 p-4">
          <div className="bg-black w-full h-64 flex items-center justify-center mb-4">
            <button className="bg-green-500 text-white px-4 py-2 rounded">▶</button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {episodes.map((episode) => (
              <img
                key={episode.number}
                src={episode.thumbnail}
                alt={`Episode ${episode.number}`}
                className="w-full h-32 object-cover rounded hover:opacity-80 cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* Streaming Servers */}
        <div className="w-1/4 bg-[#1A1A2E] text-white overflow-y-auto">
          <h2 className="text-center text-xl font-bold py-4">Watching Servers </h2>
          <ul>
            {['EarnVids', 'StreamHG', 'listeamed', 'upshare', 'VK', 'luluvdo', 'ok', 'vid1sha'].map((server) => (
              <li
                key={server}
                className="py-2 px-4 hover:bg-blue-500 cursor-pointer border-b border-gray-700 flex items-center justify-between"
              >
                {server}
                <button className="bg-green-500 text-white px-2 py-1 rounded">▶</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnimeSeasonPage;