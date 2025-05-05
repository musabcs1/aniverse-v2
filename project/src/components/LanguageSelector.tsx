import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    flag: '🇬🇧'
  },
  {
    code: 'tr',
    name: 'Türkçe',
    flag: '🇹🇷'
  }
];

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const currentLanguageCode = i18n.language.substring(0, 2);

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center items-center bg-surface-dark px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-surface-light focus:outline-none focus:ring-2 focus:ring-primary"
          id="language-menu"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={toggleDropdown}
        >
          {languages.find(lang => lang.code === currentLanguageCode)?.flag || '🌐'}
          <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-surface-dark ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="language-menu">
            {languages.map(({ code, name, flag }) => (
              <button
                key={code}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-surface-light ${code === currentLanguageCode ? 'bg-primary/20 text-primary' : 'text-white'}`}
                onClick={() => changeLanguage(code)}
                role="menuitem"
              >
                <span className="mr-2">{flag}</span>
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 