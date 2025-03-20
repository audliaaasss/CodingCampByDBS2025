class NoteForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupValidation();
  }

  setupValidation() {
    const titleInput = this.shadowRoot.getElementById('title');
    const bodyInput = this.shadowRoot.getElementById('body');
    const titleError = this.shadowRoot.getElementById('title-error');
    const bodyError = this.shadowRoot.getElementById('body-error');
    
    titleInput.addEventListener('input', () => {
      if (titleInput.value.trim() === '') {
        titleError.textContent = 'Title cannot be empty';
        titleInput.classList.add('invalid');
      } else if (titleInput.value.length > 50) {
        titleError.textContent = 'Title cannot be longer than 50 characters';
        titleInput.classList.add('invalid');
      } else {
        titleError.textContent = '';
        titleInput.classList.remove('invalid');
      }
    });
    
    bodyInput.addEventListener('input', () => {
      if (bodyInput.value.trim() === '') {
        bodyError.textContent = 'Content cannot be empty';
        bodyInput.classList.add('invalid');
      } else {
        bodyError.textContent = '';
        bodyInput.classList.remove('invalid');
      }
    });
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
          padding: 16px;
        }
        
        .form-container {
          background-color: white;
          border-radius: 16px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          overflow: hidden;
        }
        
        .form-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(to right, #FF9AA2, #FFDFD3, #B5EAD7, #C7CEEA);
        }
        
        h2 {
          margin-bottom: 20px;
          color: #333;
          text-align: center;
          font-weight: bold;
          position: relative;
          display: inline-block;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          color: #555;
          font-weight: bold;
        }
        
        input, textarea {
          width: 100%;
          padding: 14px;
          border: 2px solid #E0E0E0;
          border-radius: 12px;
          font-size: 16px;
          outline: none;
          transition: all 0.3s ease;
        }
        
        input:focus, textarea:focus {
          border-color: #FF9AA2;
          box-shadow: 0 0 0 3px rgba(255, 154, 162, 0.2);
        }
        
        .invalid {
          border-color: #FF6B6B;
          background-color: #FFF0F0;
        }
        
        .error-message {
          color: #FF6B6B;
          font-size: 14px;
          margin-top: 6px;
          height: 18px;
          font-weight: 500;
        }
        
        textarea {
          min-height: 180px;
          resize: vertical;
        }
        
        button {
          display: block;
          width: 100%;
          padding: 14px;
          background-color: #B5EAD7;
          color: #444;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        button:hover {
          background-color: #9CD9BF;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        button:disabled {
          background-color: #E0E0E0;
          cursor: not-allowed;
          color: #888;
        }
        
        @media (max-width: 768px) {
          .form-container {
            padding: 20px;
          }
        }
        
        @media (max-width: 480px) {
          :host {
            padding: 10px;
          }
          
          .form-container {
            padding: 16px;
            border-radius: 12px;
          }
          
          input, textarea, button {
            padding: 12px;
          }
        }
      </style>
      
      <div class="form-container">
        <h2>Add New Note</h2>
        <form id="noteForm">
          <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" placeholder="Enter your awesome note title here..." required>
            <div id="title-error" class="error-message"></div>
          </div>
          
          <div class="form-group">
            <label for="body">Content</label>
            <textarea id="body" placeholder="Write your thoughts, ideas, and reminders here..." required></textarea>
            <div id="body-error" class="error-message"></div>
          </div>
          
          <button type="submit" id="submitButton">Add Note</button>
        </form>
      </div>
    `;

    const form = this.shadowRoot.getElementById('noteForm');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      
      const titleInput = this.shadowRoot.getElementById('title');
      const bodyInput = this.shadowRoot.getElementById('body');
      
      if (titleInput.value.trim() === '' || bodyInput.value.trim() === '') {
        return;
      }
      
      const title = titleInput.value;
      const body = bodyInput.value;
      
      this.dispatchEvent(new CustomEvent('add-note', {
        detail: { title, body },
        bubbles: true,
        composed: true
      }));
      
      titleInput.value = '';
      bodyInput.value = '';
    });
  }
}

customElements.define('note-form', NoteForm);