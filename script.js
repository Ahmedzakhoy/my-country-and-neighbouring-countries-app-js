"use strict";

//elements selection
const btn = document.querySelector(".btn-country");
const countriesContainer = document.querySelector(".countries");

//Global variables
let lat, lng;

///////////////////////////////////////

//render Error Function
const renderError = function (msg) {
  countriesContainer.insertAdjacentText("beforeend", msg);
  countriesContainer.style.opacity = "1";
};

//render country html Function if class assigned to neighbour will render a neighbour country
const renderCountry = function (data, className = "") {
  const html = `
    <article class="country ${className}">
          <img class="country__img" src="${data.flags.png}" />
          <div class="country__data">
          <h3 class="country__name">${data.name.common}</h3>
          <h4 class="country__region">${data.region}</h4>
          <p class="country__row"><span>👫</span>${(
            +data.population / 1000000
          ).toFixed(1)}</p>
          <p class="country__row"><span>🗣️</span>${Object.values(
            data.languages
          )}</p>
          <p class="country__row"><span>💰</span>${
            Object.values(data.currencies)[0].name
          }</p>
          </div>
      </article>
  
    `;
  countriesContainer.insertAdjacentHTML("beforeend", html);
  countriesContainer.style.opacity = "1";
};

///////////////////////////////////////

// get position from navigator.geolocation API and set lat + lng global variables and return a promise to await for
function getPosition() {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        lat = latitude;
        lng = longitude;
        resolve();
      },
      () => {
        reject("couldn't get geolocation position");
      }
    )
  );
}

///////////////////////////////////////

//getting neighbouring countries information and rendering them one by one
const renderingNeighbours = function (data) {
  //get neighbour countries
  const neighbours = data.borders;

  //if no neighbours then stop
  if (neighbours.length === 0 || !neighbours) return;

  //render all neighbours
  neighbours.forEach(async (neighbour) => {
    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/alpha/${neighbour}`
      );
      const [data] = await response.json();

      //render neighbour with the neighbour className
      renderCountry(data, "neighbour");
    } catch (err) {
      renderError(`something went wrong : ${err}`);
    }
  });
};

//getting countries information and rendering it and its neighbours
const gettingCountryInfo = async function () {
  try {
    //get position lat and lng function awaiting
    await getPosition();
    //reverse geocoding and getting country information
    const res = await fetch(
      `https://us1.locationiq.com/v1/reverse.php?key=pk.41e10957859f6d815b650f2da9bca0d6&lat=${lat}&lon=${lng}&format=json`
    );
    const country = await res.json();
    const countryCode = country.address.country_code;
    if (!countryCode) {
      throw new Error("couldn't get country code from reverse geocoding");
    }
    //getting country information from RestApi using country code from previous variable
    const response = await fetch(
      `https://restcountries.com/v3.1/alpha/${countryCode}`
    );
    if (!response.ok) {
      throw new Error(
        `country is not found ${response.status}, countries rest API Error`
      );
    }
    const [data] = await response.json();

    //render country and execute render neighbours function
    renderCountry(data);
    renderingNeighbours(data);
  } catch (err) {
    renderError(`something went wrong : ${err}`);
  }
};

///////////////////////////////////////

//event listener to click on main button
//implementing main functionality on click
btn.addEventListener("click", gettingCountryInfo, { once: true });
