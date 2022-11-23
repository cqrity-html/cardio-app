"use strict";

const form = document.querySelector(".form");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputTemp = document.querySelector(".form__input--temp");
const inputClimb = document.querySelector(".form__input--climb");
const clearListButton = document.querySelector(".clear-list-button");

const date = new Date();
const currentDate = new Intl.DateTimeFormat('ru-Ru').format(date);

class Workout {
    #date = date;
    id = `${new Date().getSeconds()}${date.getMinutes()}`;

    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }
}

class Running extends Workout {
    constructor(coords, distance, duration, temp) {
        super(coords, distance, duration);
        this.temp = temp;
        this.calculatePace();
    }
    calculatePace() {
        this.pace = (this.duration / this.distance).toFixed(2);
    }
}

class Cycling extends Workout {
    constructor(coords, distance, duration, climb) {
        super(coords, distance, duration);
        this.climb = climb;
        this.calculateSpeed();
    }
    calculateSpeed() {
        this.speed = (this.distance / this.duration / 60).toFixed(2);
    }
}

class App {
    #workouts = [];
    #map;
    #mapEvent;

    constructor() {
        this._getPosition();
        this._getLocalStorageData();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleClimbField);
        clearListButton.addEventListener('click', this.reset);
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                function () {
                    alert("Невозможно определить вашу геолокацию!");
                }
            );
        }
    }

    _loadMap(position) {
        const { latitude, longitude } = position.coords;
        this.#map = L.map('map').setView([latitude, longitude], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
        this.#map.on('click', this._showForm.bind(this));
        this.#workouts.forEach(workout => {
            this._displayWorkoutOnMap(workout);
        });
    }

    _showForm(e) {
        this.#mapEvent = e;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _hideForm() {
        form.reset();
        inputClimb.closest('.form__row').classList.add('form__row--hidden');
        inputTemp.closest('.form__row').classList.remove('form__row--hidden');
        form.classList.add('hidden');
    }

    _toggleClimbField() {
        inputClimb.closest('.form__row').classList.toggle('form__row--hidden');
        inputTemp.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _closeWorkout(workout) {

    }

    _displayWorkoutOnSidebar(workout) {
        form.insertAdjacentHTML('afterend',
            `<li class="workout workout--${workout.type}" data-id="${workout.id}">
            <button class="close-workout-button"></button>
            <h2 class="workout__title">${workout.type === "running" ? "Пробежка" : "Велотренировка"} ${currentDate}</h2>
            <div class="workout__details">
            <span class="workout__icon">${workout.type === "running" ? "🏃" : "🚵‍♂️"}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">км</span>
            </div>
            <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">мин</span>
            </div>
            <div class="workout__details">
            <span class="workout__icon">📏⏱</span>
            <span class="workout__value">${workout.type === "running" ? workout.pace : workout.speed}</span>
            <span class="workout__unit">${workout.type === "running" ? 'м/мин' : 'км/ч'}</span>
            </div>
            <div class="workout__details">
            <span class="workout__icon">${workout.type === "running" ? "👟⏱" : "🏔"}</span>
            <span class="workout__value">${workout.type === "running" ? workout.temp : workout.climb}</span>
            <span class="workout__unit">${workout.type === "running" ? "шаг/мин" : "м"}</span>
            </div>
        </li>`
        );
        const workouts = document.querySelectorAll(".workout");
        workouts.forEach(workout => {
            workout.addEventListener('click', this._setMapView.bind(this))
        })
        clearListButton.disabled = false;
        document.querySelector('.close-workout-button').addEventListener('click',);
    }

    _displayWorkoutOnMap(workout) {
        const { lat, lng } = workout.coords;

        L.marker([lat, lng])
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 200,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: workout.type === 'running' ? 'running-popup' : 'cycling-popup',
                })
            )
            .setPopupContent(
                `${workout.type === 'running' ? "🏃 Пробежка" : "🚵‍♂️ Велотренировка"} ${currentDate}`
            )
            .openPopup();
    }

    _setMapView(e) {
        const currentWorkoutId = e.target.closest('.workout').dataset.id;
        const currentWorkout = this.#workouts.find(workout => workout.id === currentWorkoutId);
        const { lat, lng } = currentWorkout.coords;
        this.#map.setView([lat, lng], 13);
    }

    _addWorkoutsToLocalStorage() {
        localStorage.setItem('workout', JSON.stringify(this.#workouts));
    }

    _getLocalStorageData() {
        const data = JSON.parse(localStorage.getItem('workout'));

        if (!data) return;
        this.#workouts = data;
        this.#workouts.forEach(workout => {
            this._displayWorkoutOnSidebar(workout);
        });
    }

    _newWorkout(e) {
        e.preventDefault();
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const coords = this.#mapEvent.latlng;

        let workout;

        const areNumbers = (...numbers) => numbers.every(num => Number.isFinite(num));
        const arePositiveNumbers = (...numbers) => numbers.every(num => num > 0);

        if (type === 'running') {
            const temp = +inputTemp.value;
            if (!areNumbers(distance, duration, temp) || !arePositiveNumbers(distance, duration, temp)) {
                return alert('Введите положительное число!');
            }
            workout = new Running(coords, distance, duration, temp);
        }

        if (type === 'cycling') {
            const climb = +inputClimb.value;
            if (!areNumbers(distance, duration, climb) || !arePositiveNumbers(distance, duration)) {
                return alert('Введите положительное число!');
            }
            workout = new Cycling(coords, distance, duration, climb);
        }

        workout.type = type;
        this.#workouts.push(workout);

        this._displayWorkoutOnSidebar(workout);
        this._displayWorkoutOnMap(workout);

        this._hideForm();

        this._addWorkoutsToLocalStorage();
    }

    reset() {
        localStorage.removeItem('workout');
        location.reload();
        clearListButton.disabled = true;
    }
}

const app = new App();
