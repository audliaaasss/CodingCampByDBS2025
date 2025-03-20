import './note-item.js';

class NoteList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._notes = [];
    this.filteredNotes = [];
    this.searchQuery = '';
    this.showArchived = false;
  }

  set notes(notes) {
    this._notes = notes;
    this.filterNotes();
  }

  set query(query) {
    this.searchQuery = query;
    this.filterNotes();
  }

  set archived(value) {
    this.showArchived = value;
    this.filterNotes();
  }

  filterNotes() {
    this.filteredNotes = this._notes.filter(note => {
      const matchesArchiveState = this.showArchived === note.archived;
      const matchesSearchQuery = this.searchQuery.length === 0 || 
        note.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        note.body.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      return matchesArchiveState && matchesSearchQuery;
    });
    
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
          padding: 16px;
          width: 100%;
        }
        
        .section-title {
          margin-bottom: 24px;
          color: #444;
          text-align: center;
          font-size: 1.8rem;
          font-weight: bold;
          position: relative;
          display: inline-block;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .section-title::before {
          content: "${this.showArchived ? '🗃️' : '📋'}";
          margin-right: 10px;
        }
        
        .empty-message {
          text-align: center;
          padding: 40px;
          color: #888;
          font-size: 1.1rem;
          background-color: white;
          border-radius: 16px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          margin: 20px auto;
          max-width: 600px;
        }
        
        .empty-message-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 16px;
          opacity: 0.7;
        }
        
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          padding: 16px 0;
        }
        
        @media (max-width: 768px) {
          .notes-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
          }
        }
        
        @media (max-width: 480px) {
          .notes-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .section-title {
            font-size: 1.5rem;
          }
        }
      </style>
      
      <h2 class="section-title">${this.showArchived ? 'Archived Notes' : 'My Notes'}</h2>
      
      ${this.filteredNotes.length === 0 
        ? `<div class="empty-message">
            <span class="empty-message-icon">${this.showArchived ? '🗃️' : '📝'}</span>
            No ${this.showArchived ? 'archived' : 'active'} notes found${this.searchQuery ? ' for your search' : ''}
            ${!this.showArchived && !this.searchQuery ? '<br>Add a new note to get started!' : ''}
          </div>` 
        : `
          <div class="notes-grid">
            ${this.filteredNotes.map(note => `
              <note-item id="${note.id}"></note-item>
            `).join('')}
          </div>
        `
      }
    `;

    this.filteredNotes.forEach(note => {
      const noteItemElement = this.shadowRoot.querySelector(`#${note.id}`);
      noteItemElement.note = note;
    });
  }
}

customElements.define('note-list', NoteList);