"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputTemp = document.querySelector(".form__input--temp");
const inputClimb = document.querySelector(".form__input--climb");

const date = new Date();

class Workout {
    #date = date;
    #id = `${date.getSeconds()}/${date.getMinutes()}/${date.getDay()}/${date.getMonth()}`;

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
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleClimbField);
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

    _displayWorkout(workout) {
        const { lat, lng } = this.#mapEvent.latlng;
        const currentDate = `${String(date.getDate()).padStart(2, '0')}/${date.getMonth() + 1}/${date.getFullYear()}`;

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
                `${workout.type === 'running' ? "Пробежка" : "Велотренировка"} ${currentDate}`
            )
            .openPopup();

        containerWorkouts.insertAdjacentHTML('beforeend',
            `<li class="workout workout--${workout.type}" data-id="0000000">
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

        this._displayWorkout(workout);

        this._hideForm();
    }
}

const app = new App();
