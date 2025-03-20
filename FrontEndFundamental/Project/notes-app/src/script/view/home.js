import NotesData from '../data/notes.js';
import Utils from '../utils.js';
import '../components/note-form.js';

const home = () => {
  const notesData = [...NotesData.getAll()];
  let currentPage = 'home';

  // Initial render
  renderPage();

  // Event listeners
  document.addEventListener('page-change', (event) => {
    currentPage = event.detail.page;
    renderPage();
  });

  document.addEventListener('search', (event) => {
    const { query } = event.detail;
    const noteListElement = document.querySelector('note-list');
    noteListElement.query = query;
  });

  document.addEventListener('add-note', (event) => {
    const { title, body } = event.detail;
    const newNote = {
      id: `notes-${Date.now()}`,
      title,
      body,
      createdAt: new Date().toISOString(),
      archived: false,
    };
    
    notesData.unshift(newNote);
    renderNoteList();
    
    // Show notification
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = 'Note added successfully!';
    document.body.appendChild(notification);
    Utils.showElement(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        Utils.hideElement(notification);
        document.body.removeChild(notification);
      }, 500);
    }, 2000);
  });

  document.addEventListener('delete-note', (event) => {
    const { id } = event.detail;
    const index = notesData.findIndex(note => note.id === id);
    
    if (index !== -1) {
      notesData.splice(index, 1);
      renderNoteList();
    }
  });

  document.addEventListener('archive-note', (event) => {
    const { id, archived } = event.detail;
    const index = notesData.findIndex(note => note.id === id);
    
    if (index !== -1) {
      notesData[index].archived = archived;
      renderNoteList();
    }
  });

  function renderPage() {
    const mainElement = document.querySelector('main');
    mainElement.innerHTML = '';

    if (currentPage === 'home') {
      renderHomePage(mainElement);
    } else if (currentPage === 'archived') {
      renderArchivedPage(mainElement);
    }
  }

  function renderHomePage(container) {
    const formElement = document.createElement('note-form');
    container.appendChild(formElement);
    Utils.showElement(formElement);
    
    const searchElement = document.createElement('search-bar');
    container.appendChild(searchElement);
    
    const noteListElement = document.createElement('note-list');
    noteListElement.notes = notesData;
    noteListElement.archived = false;
    container.appendChild(noteListElement);
  }

  function renderArchivedPage(container) {
    const searchElement = document.createElement('search-bar');
    container.appendChild(searchElement);
    
    const noteListElement = document.createElement('note-list');
    noteListElement.notes = notesData;
    noteListElement.archived = true;
    container.appendChild(noteListElement);
  }

  function renderNoteList() {
    const noteListElement = document.querySelector('note-list');
    if (noteListElement) {
      noteListElement.notes = notesData;
    }
  }
};

export default home;