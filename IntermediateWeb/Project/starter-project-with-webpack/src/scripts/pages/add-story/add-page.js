import AddPresenter from './add-presenter';
import * as StoryAPI from '../../data/api';
import { generateLoaderAbsoluteTemplate } from '../../templates';
import Map from '../../utils/map';
import 'leaflet/dist/leaflet.css';

export default class AddPage {
    #presenter = null;
    #form = null;
    #map = null;
    #markerAdded = false;
    #marker = null;
    #imagePreview = null;
    #cameraStream = null;
    #videoElement = null;
    #availableCameras = [];
    #currentCameraId = null;


    async render() {
        return `
            <section class="container">
                <h1 class="section-title">Add New Story</h1>
                
                <div class="add-story-form-container">
                    <form id="add-story-form" class="add-story-form">
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea id="description" name="description" required placeholder="Share your story here..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="photo">Photo</label>
                            <div class="photo-options">
                                <input type="file" id="photo" name="photo" accept="image/*" required>
                                <button type="button" id="use-camera" class="btn">Use Camera</button>
                            </div>
                            <div id="camera-container" class="camera-container" style="display: none;">
                                <div class="camera-select-container">
                                    <label for="camera-select">Select Camera:</label>
                                    <select id="camera-select" class="camera-select">
                                        <option value="">Loading cameras...</option>
                                    </select>
                                    <button type="button" id="switch-camera" class="btn btn-small" style="display: none;">Switch Camera</button>
                                </div>
                                <video id="camera-preview" autoplay style="width: 100%;"></video>
                                <div class="camera-controls">
                                    <button type="button" id="capture-photo" class="btn">Capture</button>
                                    <button type="button" id="stop-camera" class="btn">Close Camera</button>
                                </div>
                            </div>
                            <div id="image-preview" class="image-preview"></div>
                            <canvas id="photo-canvas" style="display: none;"></canvas>
                        </div>
                        <div class="form-group form-location">
                            <label>Location (Optional)</label>
                            <div class="location-inputs">
                                <div class="location-input">
                                    <label for="latitude">Latitude</label>
                                    <input type="number" id="latitude" name="latitude" placeholder="Latitude" value="" step="any">
                                </div>
                                <div class="location-input">
                                    <label for="longitude">Longitude</label>
                                    <input type="number" id="longitude" name="longitude" placeholder="Longitude" value="" step="any">
                                </div>
                                <button type="button" id="get-current-location" class="btn">Use My Location</button>
                            </div>
                            <div id="map-container" style="height: 300px; margin-top: 15px;"></div>
                            <p id="map-instructions" style="margin-top: 5px; font-size: 0.9em;">Click on the map to set location</p>
                        </div>
                        <div class="form-actions">
                            <span id="submit-button-container">
                                <button type="submit" class="btn submit-story-button">Submit Story</button>
                            </span>
                            <a href="#/" class="btn btn-outline">Cancel</a>
                        </div>
                    </form>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.#presenter = new AddPresenter({
            view: this,
            model: StoryAPI,
        });

        this._setupForm();
        this._setupImagePreview();
        this._setupCamera();
        await this._setupMap();
    }

    async _setupMap() {
        try {
            this.#map = await Map.build('#map-container', { locate: true, zoom: 10 });

            this.#map.addMapEventListener('click', (event) => {
                const { lat, lng } = event.latlng;
                document.getElementById('latitude').value = lat;
                document.getElementById('longitude').value = lng;

                if (this.#markerAdded && this.#marker) {
                    this.#marker.setLatLng([lat, lng]);
                } else {
                    this.#marker = this.#map.addMarker([lat, lng], {}, {
                        content: 'Selected Location'
                    });
                    this.#markerAdded = true;
                }
            });

            document.getElementById('get-current-location').addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    const position = await Map.getCurrentPosition();
                    const { latitude, longitude } = position.coords;
                    
                    document.getElementById('latitude').value = latitude;
                    document.getElementById('longitude').value = longitude;
                    
                    this.#map.changeCamera([latitude, longitude], 13);

                    if (this.#markerAdded && this.#marker) {
                        this.#marker.setLatLng([latitude, longitude]);
                    } else {
                        this.#marker = this.#map.addMarker([latitude, longitude], {}, {
                            content: 'Your Location'
                        });
                        this.#markerAdded = true;
                    }
                } catch (error) {
                    console.error('Error getting current location:', error);
                    this.showErrorMessage('Unable to get your current location. Please allow location access or enter coordinates manually.');
                }
            });
        } catch (error) {
            console.error('Error setting up map:', error);
            document.getElementById('map-container').innerHTML = '<p>Unable to load map. Please try again later.</p>';
        }
    }

    async _enumarateCameras() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.error('enumerateDevices() not supported.');
            return [];
        }

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            this.#availableCameras = videoDevices;
            return videoDevices;
        } catch (error) {
            console.error('Error enumerating devices:', error);
            return [];
        }
    }

    async _populateCameraSelect() {
        const cameraSelect = document.getElementById('camera-select');
        const videoDevices = await this._enumarateCameras();
        
        cameraSelect.innerHTML = '';
        
        if (videoDevices.length === 0) {
            cameraSelect.innerHTML = '<option value="">No cameras found</option>';
            return;
        }

        videoDevices.forEach((device, index) => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${index + 1}`;
            cameraSelect.appendChild(option);
        });
        
        // Show switch camera button if more than one camera
        const switchCameraBtn = document.getElementById('switch-camera');
        if (videoDevices.length > 1) {
            switchCameraBtn.style.display = 'inline-block';
        } else {
            switchCameraBtn.style.display = 'none';
        }
    }

    async _startCamera(deviceId = null) {
        if (this.#cameraStream) {
            this._stopCameraStream();
        }

        const constraints = {
            video: deviceId ? { deviceId: { exact: deviceId } } : true
        };

        try {
            this.#cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.#videoElement.srcObject = this.#cameraStream;
            
            if (deviceId) {
                this.#currentCameraId = deviceId;
            } else if (this.#availableCameras.length > 0) {
                this.#currentCameraId = this.#availableCameras[0].deviceId;
            }
            
            // If no labels are available, request permission first
            if (this.#availableCameras.length > 0 && !this.#availableCameras[0].label) {
                await this._populateCameraSelect();
            }
            
            // Update the select to match current camera
            const cameraSelect = document.getElementById('camera-select');
            if (this.#currentCameraId && cameraSelect) {
                cameraSelect.value = this.#currentCameraId;
            }
        } catch (error) {
            console.error('Error starting camera:', error);
            this.showErrorMessage('Unable to access camera. Please ensure camera permissions are granted.');
        }
    }

    _switchToNextCamera() {
        if (this.#availableCameras.length <= 1) return;
        
        const currentIndex = this.#availableCameras.findIndex(cam => cam.deviceId === this.#currentCameraId);
        const nextIndex = (currentIndex + 1) % this.#availableCameras.length;
        const nextCameraId = this.#availableCameras[nextIndex].deviceId;
        
        const cameraSelect = document.getElementById('camera-select');
        cameraSelect.value = nextCameraId;
        
        this._startCamera(nextCameraId);
    }

    _setupCamera() {
        const useCamera = document.getElementById('use-camera');
        const cameraContainer = document.getElementById('camera-container');
        const capturePhoto = document.getElementById('capture-photo');
        const stopCamera = document.getElementById('stop-camera');
        const switchCamera = document.getElementById('switch-camera');
        const cameraSelect = document.getElementById('camera-select');
        this.#videoElement = document.getElementById('camera-preview');

        useCamera.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                // Request permissions first to get labeled devices
                await navigator.mediaDevices.getUserMedia({ video: true });
                
                // Now enumerate cameras with labels
                await this._populateCameraSelect();
                
                // Start the default camera
                await this._startCamera();
                
                cameraContainer.style.display = 'block';
                document.getElementById('photo').required = false;
            } catch (error) {
                console.error('Error accessing camera:', error);
                this.showErrorMessage('Unable to access camera. Please ensure camera permissions are granted.');
            }
        });
        
        cameraSelect.addEventListener('change', (e) => {
            const selectedDeviceId = e.target.value;
            if (selectedDeviceId) {
                this._startCamera(selectedDeviceId);
            }
        });
        
        switchCamera.addEventListener('click', () => {
            this._switchToNextCamera();
        });
        
        capturePhoto.addEventListener('click', () => {
            const canvas = document.getElementById('photo-canvas');
            const context = canvas.getContext('2d');

            canvas.width = this.#videoElement.videoWidth;
            canvas.height = this.#videoElement.videoHeight;

            context.drawImage(this.#videoElement, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                const capturedImage = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });

                const photoInput = document.getElementById('photo');

                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(capturedImage);
                photoInput.files = dataTransfer.files;

                const reader = new FileReader();
                reader.onload = (e) => {
                    this.#imagePreview.innerHTML = `
                        <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px;">
                    `;
                };
                reader.readAsDataURL(capturedImage);

                this._stopCameraStream();
                cameraContainer.style.display = 'none';
            }, 'image/jpeg', 0.95);
        });
        
        stopCamera.addEventListener('click', () => {
            this._stopCameraStream();
            cameraContainer.style.display = 'none';
            document.getElementById('photo').required = true;
        });
    }
    
    _stopCameraStream() {
        if (this.#cameraStream) {
            this.#cameraStream.getTracks().forEach(track => track.stop());
            this.#cameraStream = null;
            this.#videoElement.srcObject = null;
        }
    }

    _setupForm() {
        this.#form = document.getElementById('add-story-form');
        this.#form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const description = document.getElementById('description').value;
            const photoUrl = document.getElementById('photo').files[0];
            const latitude = document.getElementById('latitude').value || null;
            const longitude = document.getElementById('longitude').value || null;

            await this.#presenter.addNewStory({
                description,
                photo: photoUrl,
                lat: latitude,
                lon: longitude,
            });
        });
    }

    _setupImagePreview() {
        const photoInput = document.getElementById('photo');
        this.#imagePreview = document.getElementById('image-preview');

        photoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.#imagePreview.innerHtml = `
                        <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px;">
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    showLoading() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit" disabled>
                <div class="loader-button"></div> Submitting...
            </button>
        `;
    }

    hideLoading() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="btn submit-story-button" type="submit">Submit Story</button>
        `;
    }

    showSuccessMessage(message) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = message;

        document.body.appendChild(successMessage);

        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    }

    showErrorMessage(message) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = message;

        document.body.appendChild(errorMessage);

        setTimeout(() => {
            errorMessage.remove();
        }, 3000);
    }

    clearForm() {
        this._stopCameraStream();

        this.#form.reset();
        this.#imagePreview.innerHTML = '';

        if (this.#markerAdded && this.#marker) {
            this.#marker.remove();
            this.#markerAdded = false;
        }
    }

    navigateToHome() {
        window.location.hash = '/';
    }
}