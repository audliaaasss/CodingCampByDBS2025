class NoteItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  set note(note) {
    this._note = note;
    this.render();
  }
  
  render() {
    const createdDate = new Date(this._note.createdAt).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  
    this.shadowRoot.innerHTML = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        :host {
          display: flex;
          flex-direction:column;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
          background-color: #FCF0C3;
          transition: all 0.3s ease;
          min-height: 200px;
        }
          
        :host(:hover) {
          transform: translateY(-5px) rotate(1deg);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
        }
          
        .note-content {
          flex: 1;
          padding: 20px;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        
        .note-pin {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          font-size: 1.2rem;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
        }
          
        h3 {
          margin-top: 10px;
          margin-bottom: 12px;
          color: #333;
          font-size: 1.3rem;
          font-weight: bold;
          word-break: break-word;
        }
          
        p {
          color: #444;
          margin-bottom: 16px;
          line-height: 1.6;
          word-break: break-word;
          white-space: pre-wrap;
        }
          
        .note-date {
          font-size: 0.85rem;
          color: #666;
          text-align: right;
          font-style: italic;
          padding-top: 8px;
          border-top: 1px dashed rgba(0, 0, 0, 0.1);
          margin-top: auto;
        }
          
        .note-actions {
          display: flex;
          justify-content: flex-end;
          padding: 12px 20px;
          background-color: #E2C6DE;
        }
          
        button {
          background: none;
          border: none;
          cursor: pointer;
          margin-left: 12px;
          padding: 8px 16px;
          border-radius: 25px;
          font-weight: bold;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }
        
        button span {
          margin-right: 5px;
        }
          
        .delete-btn {
          color: #FF6B6B;
          background-color: rgba(255, 107, 107, 0.1);
        }
          
        .delete-btn:hover {
          background-color: rgba(255, 107, 107, 0.2);
          transform: translateY(-2px);
        }
          
        .archive-btn {
          color: #666;
          background-color: rgba(0, 0, 0, 0.05);
        }
          
        .archive-btn:hover {
          background-color: rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
      </style>
        
      <div class="note-content">
        <div class="note-pin">📌</div>
        <h3>${this._note.title}</h3>
        <p>${this._note.body}</p>
        <div class="note-date">${createdDate}</div>
      </div>
    
      <div class="note-actions">
        <button class="archive-btn" data-id="${this._note.id}">
          ${this._note.archived ? 'Unarchive' : 'Archive'}
        </button>
        <button class="delete-btn" data-id="${this._note.id}">
          Delete
        </button>
      </div>
    `;
  
    this.shadowRoot.querySelector('.delete-btn').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('delete-note', {
        detail: { id: this._note.id },
        bubbles: true,
        composed: true
      }));
    });
  
    this.shadowRoot.querySelector('.archive-btn').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('archive-note', {
        detail: { id: this._note.id, archived: !this._note.archived },
        bubbles: true,
        composed: true
      }));
    });
  }
}
  
customElements.define('note-item', NoteItem);