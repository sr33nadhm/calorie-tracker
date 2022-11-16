import axios from "axios";

const USER_SERVICES_URL = process.env.REACT_APP_SERVICES_URL;

export class MealService {
  headers = {};

  constructor(url_prefix = "meals") {
    this.url_prefix = url_prefix;
    this.getHeaders();
  }

  async post(url, body, queryParams = null) {
    var data = null;
    try {
      await axios
        .post(USER_SERVICES_URL + this.getUrl(url), body, this.headers)
        .then((response) => (data = response))
        .catch((error) => {
          data = `Error: ${error.message}`;
          console.error("There was an error!", error);
        });
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async patch(url, body, queryParams = null) {
    var data = null;
    try {
      await axios
        .patch(
          USER_SERVICES_URL +
            this.getUrl(url) +
            this.mapQueryParams(queryParams),
          body,
          this.headers
        )
        .then((response) => (data = response))
        .catch((error) => {
          data = `Error: ${error.message}`;
          console.error("Error while activating!", error);
        });
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async get(url, queryParams = null) {
    try {
      let response = await fetch(
        USER_SERVICES_URL + this.getUrl(url) + this.mapQueryParams(queryParams),
        {
          headers: this.headers,
        }
      );
      let jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async put(url, body, queryParams = null) {
    var data = null;
    try {
      await fetch(
        USER_SERVICES_URL + this.getUrl(url) + this.mapQueryParams(queryParams),
        {
          method: "PUT",
          headers: this.headers,
          body: JSON.stringify(body),
        }
      )
        .then((response) => (data = response))
        .catch((error) => {
          data = `Error: ${error.message}`;
          console.error("Error while activating!", error);
        });
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async delete(url, queryParams = null) {
    var data = null;
    try {
      await fetch(
        USER_SERVICES_URL + this.getUrl(url) + this.mapQueryParams(queryParams),
        {
          method: "DELETE",
          headers: this.headers,
        }
      )
        .then((response) => (data = response))
        .catch((error) => {
          data = `Error: ${error.message}`;
          console.error("Error while activating!", error);
        });
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  getUrl(url) {
    return this.url_prefix + url;
  }

  getHeaders() {
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  mapQueryParams(queryParams) {
    return queryParams
      ? Object.keys(queryParams)
          .map(function (key) {
            return key + "=" + queryParams[key];
          })
          .join("&")
      : "";
  }
}
