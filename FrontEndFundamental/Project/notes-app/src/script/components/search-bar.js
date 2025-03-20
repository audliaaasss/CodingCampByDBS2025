class SearchBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
          
        :host {
          display: block;
          width: 100%;
          margin-bottom: 24px;
        }
          
        .search-container {
          display: flex;
          max-width: 600px;
          margin: 0 auto;
          padding: 16px;
          position: relative;
        }
          
        input {
          flex: 1;
          padding: 14px 14px 14px 45px;
          border: 2px solid #E0E0E0;
          border-radius: 25px;
          font-size: 16px;
          outline: none;
          transition: all 0.3s ease;
        }
          
        input:focus {
          border-color: #C7CEEA;
          box-shadow: 0 0 0 3px rgba(199, 206, 234, 0.3);
        }
        
        .search-icon {
          position: absolute;
          left: 30px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.2rem;
          color: #888;
          pointer-events: none;
        }
          
        button {
          margin-left: 10px;
          padding: 0 20px;
          background-color: #C7CEEA;
          color: #444;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }
        
        button span {
          margin-right: 5px;
        }
          
        button:hover {
          background-color: #B5BDD4;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        button:active {
          transform: translateY(0);
        }
      </style>
        
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input type="text" id="searchInput" placeholder="Search for notes...">
        <button id="searchButton">
          Search
        </button>
      </div>
    `;
  
    const searchInput = this.shadowRoot.getElementById('searchInput');
    const searchButton = this.shadowRoot.getElementById('searchButton');
  
    const performSearch = () => {
      const query = searchInput.value.trim();
      this.dispatchEvent(new CustomEvent('search', {
        detail: { query },
        bubbles: true,
        composed: true
      }));
    };
  
    searchButton.addEventListener('click', performSearch);
      
    searchInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        performSearch();
      }
    });
  }
}
  
customElements.define('search-bar', SearchBar);