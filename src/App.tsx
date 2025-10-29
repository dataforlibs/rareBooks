// src/App.tsx
import React from 'react';
import CatalogItemForm from './catalog/components/CatalogItemForm';
import CreatorAuthorityForm from './catalog/components/CreatorAuthorityForm';

function App() {
  const [currentView, setCurrentView] = React.useState('catalog');

  return (
    <div className="App">
      <nav className="p-4 bg-amber-900 text-white">
        <button onClick={() => setCurrentView('catalog')}>Catalog Items</button>
        <button onClick={() => setCurrentView('creators')}>Creators</button>
      </nav>
      
      {currentView === 'catalog' && <CatalogItemForm />}
      {currentView === 'creators' && <CreatorAuthorityForm />}
    </div>
  );
}

export default App;