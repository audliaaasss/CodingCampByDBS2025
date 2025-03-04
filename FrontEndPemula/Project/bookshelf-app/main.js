const STORAGE_KEY = 'BOOKSHELF_APPS';
const RENDER_EVENT = 'render-bookshelf';

let books = [];
let searchResults = [];
let isSearching = false;
let editingBook = null;

function generateId() {
    return +new Date();
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        books = data;
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function createBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    };
}

function findBook(bookId) {
    for (const book of books) {
        if (book.id === bookId) {
            return book;
        }
    }
  
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
  
    return -1;
}

function addBook() {
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = parseInt(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    const id = editingBook ? editingBook.id : generateId();
    const bookObject = createBookObject(id, title, author, year, isComplete);

    if (editingBook) {
        const index = findBookIndex(id);
        if (index !== -1) {
            books[index] = bookObject;
        }
        
        editingBook = null;

        const submitButton = document.getElementById('bookFormSubmit');
        submitButton.innerHTML = 'Masukkan Buku ke rak <span>Belum selesai dibaca</span>';
    } else {
        books.push(bookObject);
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    document.getElementById('bookForm').reset();
    updateSubmitButtonText();
}

function removeBook(bookId) {
    const bookIndex = findBookIndex(bookId);

    if (bookIndex === -1) return;

    const bookTitle = books[bookIndex].title;
    const confirmDelete = confirm(`Apakah anda yakin ingin menghapus buku "${bookTitle}"?`);
  
    if (confirmDelete) {
        books.splice(bookIndex, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}

function toggleBookStatus(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = !bookTarget.isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function editBook(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    document.getElementById('bookFormTitle').value = bookTarget.title;
    document.getElementById('bookFormAuthor').value = bookTarget.author;
    document.getElementById('bookFormYear').value = bookTarget.year;
    document.getElementById('bookFormIsComplete').checked = bookTarget.isComplete;

    editingBook = bookTarget;

    const submitButton = document.getElementById('bookFormSubmit');
    submitButton.innerHTML = 'Edit Buku';

    document.getElementById('bookForm').scrollIntoView({behavior: 'smooth'});
  
    updateSubmitButtonText();
}

function createBookElement(bookObject) {
    const bookItem = document.createElement('div');
    bookItem.classList.add('book-item');
    bookItem.setAttribute('data-bookid', bookObject.id);
    bookItem.setAttribute('data-testid', 'bookItem');

    const bookTitle = document.createElement('h3');
    bookTitle.setAttribute('data-testid', 'bookItemTitle');
    bookTitle.innerText = bookObject.title;

    const bookAuthor = document.createElement('p');
    bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
    bookAuthor.innerText = `Penulis: ${bookObject.author}`;

    const bookYear = document.createElement('p');
    bookYear.setAttribute('data-testid', 'bookItemYear');
    bookYear.innerText = `Tahun: ${bookObject.year}`;

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-group');

    const toggleButton = document.createElement('button');
    toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');

    toggleButton.innerText = bookObject.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
    toggleButton.addEventListener('click', function() {
        toggleBookStatus(bookObject.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.innerText = 'Hapus Buku';
    deleteButton.addEventListener('click', function() {
        removeBook(bookObject.id);
    });

    const editButton = document.createElement('button');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.innerText = 'Edit Buku';
    editButton.addEventListener('click', function() {
        editBook(bookObject.id);
    });

    buttonContainer.append(toggleButton, deleteButton, editButton);
    bookItem.append(bookTitle, bookAuthor, bookYear, buttonContainer);

    return bookItem;
}

function updateSubmitButtonText() {
    const isComplete = document.getElementById('bookFormIsComplete').checked;
    const submitButton = document.getElementById('bookFormSubmit');
  
    if (editingBook) {
        submitButton.textContent = 'Edit Buku';
    } else {
        submitButton.innerHTML = `Masukkan Buku ke rak <span>${isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca'}</span>`;
    }
}

function searchBooks() {
    const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();
  
    if (searchTitle === '') {
        isSearching = false;
    } else {
        isSearching = true;
        searchResults = books.filter(book => 
            book.title.toLowerCase().includes(searchTitle)
        );
    }
  
    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', function() {
    const bookForm = document.getElementById('bookForm');
    bookForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addBook();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        searchBooks();
    });

    const searchInput = document.getElementById('searchBookTitle');
    searchInput.addEventListener('input', function() {
        if (this.value === '') {
            isSearching = false;
            document.dispatchEvent(new Event(RENDER_EVENT));
        }
    });

    document.getElementById('bookFormIsComplete').addEventListener('change', updateSubmitButtonText);

    updateSubmitButtonText();
  
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function() {
    const incompleteBookshelfList = document.getElementById('incompleteBookList');
    const completeBookshelfList = document.getElementById('completeBookList');

    incompleteBookshelfList.innerHTML = '';
    completeBookshelfList.innerHTML = '';

    const booksToRender = isSearching ? searchResults : books;

    for (const bookItem of booksToRender) {
        const bookElement = createBookElement(bookItem);

        if (bookItem.isComplete) {
            completeBookshelfList.append(bookElement);
        } else {
            incompleteBookshelfList.append(bookElement);
        }
    }

    if (incompleteBookshelfList.innerHTML === '') {
        incompleteBookshelfList.innerHTML = '<p class="empty-message">Tidak ada buku dalam rak ini</p>';
    }
  
    if (completeBookshelfList.innerHTML === '') {
        completeBookshelfList.innerHTML = '<p class="empty-message">Tidak ada buku dalam rak ini</p>';
    }
});