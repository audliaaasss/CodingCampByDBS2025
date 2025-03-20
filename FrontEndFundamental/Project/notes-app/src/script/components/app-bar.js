class AppBar extends HTMLElement {
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
          background-color: #FF9AA2;
          color: white;
          padding: 16px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
          
        .app-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          min-height: 60px;
        }
          
        .app-title {
          font-size: 1.5rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          padding: 0px 15px
        }
          
        .nav-links {
          display: flex;
          gap: 16px;
        }
          
        .nav-link {
          color: white;
          text-decoration: none;
          padding: 10px 16px;
          border-radius: 25px;
          transition: all 0.3s ease;
          cursor: pointer;
          font-weight: bold;
          display: flex;
          align-items: center;
        }
          
        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
          
        .active {
          background-color: #FFDFD3;
          color: #444;
        }
          
        @media (max-width: 480px) {
          .app-bar {
            flex-direction: column;
            gap: 12px;
          }
        }
      </style>
        
      <div class="app-bar">
        <div class="app-title">
          Notes App
        </div>
        
        <div class="nav-links">
          <a class="nav-link active" id="home-link">
            Home
          </a>
          <a class="nav-link" id="archived-link">
            Archived
          </a>
        </div>
      </div>
    `;
  
    this.shadowRoot.getElementById('home-link').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('page-change', {
        detail: { page: 'home' },
        bubbles: true,
        composed: true
      }));
        
      this.shadowRoot.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });

      this.shadowRoot.getElementById('home-link').classList.add('active');
    });
  
    this.shadowRoot.getElementById('archived-link').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('page-change', {
        detail: { page: 'archived' },
        bubbles: true,
        composed: true
      }));
      
      this.shadowRoot.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });

      this.shadowRoot.getElementById('archived-link').classList.add('active');
    });
  }
}
  
customElements.define('app-bar', AppBar);