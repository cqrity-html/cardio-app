"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputTemp = document.querySelector(".form__input--temp");
const inputClimb = document.querySelector(".form__input--climb");

const map = L.map('map');
const trainings = [];

class Training {
    constructor(date, type, duration, distance, tempo, latitude, longitude) {
        this.date = date;
        this.type = type;
        this.duration = duration;
        this.distance = distance;
        this.tempo = tempo;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    speedMpm() {
        return this.distance / 1000 / this.duration;
    }
}

const addTraining = function (date, type, duration, distance, tempo, speed) {
    containerWorkouts.insertAdjacentHTML('beforeend',
        `<li class="workout workout--running" data-id="0000000">
            <h2 class="workout__title">${type === "running" ? "Пробежка" : "Велотренировка"} ${date}</h2>
            <div class="workout__details">
            <span class="workout__icon">${type === "running" ? "🏃" : "🚵‍♂️"}</span>
            <span class="workout__value">${distance}</span>
            <span class="workout__unit">км</span>
            </div>
            <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${duration}</span>
            <span class="workout__unit">мин</span>
            </div>
            <div class="workout__details">
            <span class="workout__icon">📏⏱</span>
            <span class="workout__value">${speed}</span>
            <span class="workout__unit">м/мин</span>
            </div>
            <div class="workout__details">
            <span class="workout__icon">${type === "running" ? "👟⏱" : "🏔"}</span>
            <span class="workout__value">${tempo}</span>
            <span class="workout__unit">${type === "running" ? "шаг/мин" : "м"}</span>
            </div>
        </li>`
    );
};

function setTraining(e) {
    const { lat, lng } = e.latlng;
    form.classList.remove('hidden');
    inputDistance.focus();
    inputType.addEventListener('change', function () {
        inputClimb.closest('.form__row').classList.toggle('form__row--hidden');
        inputTemp.closest('.form__row').classList.toggle('form__row--hidden');
    });
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        form.reset();
        const type = inputType.value;
        const currentScoreField = type === 'running' ? inputTemp.value : inputClimb.value;
        trainings.push(new Training(currentDate, inputType.value, inputDuration.value, inputDistance.value, inputTemp.value, lat, lng));
        console.log(trainings);
        addTraining(currentDate, inputType.value, inputDuration.value, inputDistance.value, currentScoreField);
        // L.marker([lat, lng])
        //     .addTo(map)
        //     .bindPopup(
        //         L.popup({
        //             maxWidth: 200,
        //             minWidth: 100,
        //             autoClose: false,
        //             closeOnClick: false,
        //             className: 'running-popup',
        //         })
        //     )
        //     .setPopupContent(
        //         `${inputType.value === 'running' ? "Пробежка" : "Велотренировка"} ${currentDate}`
        //     )
        //     .openPopup();

        L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`${inputType.value === "running" ? "Пробежка" : "Велотренировка"} \n ${currentDate}`)
            .openPopup();
        form.classList.add('hidden');
    });
}

map.on('click', setTraining);

const date = new Date();
const currentDate = `${String(date.getDay()).padStart(2, '0')}/${date.getMonth()}/${date.getFullYear()}`;

navigator.geolocation.getCurrentPosition(
    function (position) {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    },
    function () {
        alert("Невозможно определить вашу геолокацию!");
    }
);
