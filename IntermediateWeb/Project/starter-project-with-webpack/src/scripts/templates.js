import { showFormattedDate } from './utils';

export function generateLoaderTemplate() {
    return `
        <div class="loader"></div>
    `;
}

export function generateLoaderAbsoluteTemplate() {
    return `
        <div class="loader loader-absolute"></div>
    `;
}

export function generateStoriesListEmptyTemplate() {
    return `
        <div id="stories-list-empty" class="stories-list__empty">
            <h2>No Stories Available</h2>
            <p>There are currently no stories to display. Be the first to add a story!</p>
        </div>
    `;
}

export function generateStoriesListErrorTemplate(message) {
    return `
        <div id="stories-list-error" class="stories-list__error">
            <h2>Error Loading Stories</h2>
            <p>${message ? message : 'Please try using a different network or report this error.'}</p>
        </div>
    `;
}

export function generateStoryItemTemplate({
    id,
    name,
    description,
    photoUrl,
    createdAt,
}) {
    return `
        <div tabindex="0" class="story-item" data-storyid="${id}">
            <img class="story-item__image" src="${photoUrl}" alt="${description}">
            <div class="story-item__body">
                <div class="story-item__main">
                    <h2 class="story-item__author">${name}</h2>
                    <div class="story-item__more-info">
                        <div class="story-item__createdat">
                            <i class="far fa-calendar-alt"></i> ${showFormattedDate(createdAt)}
                        </div>
                    </div>
                </div>
                <div class="story-item__description">
                    ${description}
                </div>
                <a class="btn story-item__read-more" href="#/stories/${id}">
                    Read More <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `;
}

export function generateStoryDetailTemplate({
    name,
    description,
    photoUrl,
    createdAt,
}) {
    const createdAtFormatted = showFormattedDate(createdAt);

    return `
        <div class="container">
            <div class="story-detail__header">
                <h1 class="story-detail__title">Story by ${name}</h1>

                <div class="story-detail__more-info">
                    <div class="story-detail__createdat" data-value="${createdAtFormatted}">
                        <i class="far fa-calendar-alt"></i> ${createdAtFormatted}
                    </div>
                </div>
            </div>

            <div class="story-detail__image__container">
                <img class="story-detail__image" src="${photoUrl}" alt="${description}">
            </div>

            <div class="story-detail__body">
                <div class="story-detail__body__description__container">
                    <h2 class="story-detail__description__title">Story Content</h2>
                    <div class="story-detail__description__body">
                        ${description}
                    </div>
                </div>
            </div>
            
            <div class="story-detail__actions">
                <a href="#/" class="btn">Back to Stories</a>
            </div>
        </div>
    `;
}

export function generateAddStorySuccessTemplate(message) {
    return `
        <div class="add-story-success">
            <i class="fas fa-check-circle"></i>
            <p>${message || 'Story added successfully!'}</p>
        </div>
    `;
}

export function generateAddStoryFormTemplate() {
    return `
        <div class="add-story-form-container">
            <h2>Add New Story</h2>
            <form id="add-story-form" class="add-story-form">
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" required></textarea>
                </div>
                <div class="form-group">
                    <label for="photo">Photo</label>
                    <input type="file" id="photo" name="photo" accept="image/*" required>
                    <div id="image-preview" class="image-preview"></div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn submit-story-button">Submit Story</button>
                </div>
            </form>
        </div>
    `;
}

export function generateImagePreviewTemplate(imageUrl) {
    return `
        <img src="${imageUrl}" alt="Preview" class="preview-image">
    `;
}

export function generateModalTemplate(content) {
    return `
        <div class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                ${content}
            </div>
        </div>
    `;
}

export function generateAddStoryButtonTemplate() {
    return `
        <button id="add-story-button" class="btn add-story-button">
            Add New Story <i class="fas fa-plus"></i>
        </button>
    `;
}

export function generateMainNavigationListTemplate() {
    return `
        <li><a id="stories-list-button" class="stories-list-button" href="#/">Stories</a></li>
        <li><a id="about-button" class="about-button" href="#/about">About</a></li>
    `;
}

export function generateUnauthenticatedNavigationListTemplate() {
    return `
        <li><a id="login-button" href="#/login">Login</a></li>
        <li><a id="register-button" href="#/register">Register</a></li>
    `;
}

export function generateAuthenticatedNavigationListTemplate() {
    return `
        <li><a id="add-story-button" class="btn add-story-button" href="#/add">Add Story <i class="fas fa-plus"></i></a></li>
        <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
    `;
}