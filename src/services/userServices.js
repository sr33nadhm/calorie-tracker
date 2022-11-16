import axios from "axios";

// import { SESSION_KEY } from "common/values";

const USER_SERVICES_URL = process.env.REACT_APP_SERVICES_URL;

export class UserService {
  headers = {};

  constructor(url_prefix = "users") {
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
