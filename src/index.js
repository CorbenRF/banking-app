/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// TODO:
// 1. login and password validation (password: no spaces, no less than 6 characters)
// 2. Sort account - DONE
// 3. Create account overview page
// 3.1. Send money interface + server call
// 3.2 Balance dynamic histogram
// 3.4 History of transactions
// 4. Create balance history page
// 4.1 Same dynamic as in 3.2 but over greater timespan
// 4.2 Transactions dynamic histogram
// 4.3 same history of transactions as in 3.4
// 5. Forex page with balance/real-time exchange rate/currency exchange UI --DONE
// 6. Yandex-maps ATMs locations
// 7. Validation on login and transfer money UI

import Navigo from "navigo";
import {paginationLogic} from "./modules/pagination"
import {
  exchangeBtnFunction,
  transferFunds,
  createChart,
  createRelativeChart,
  calculateBalances,
  transformSelect,
} from "./modules/events-logic";
import {
  buildHeader,
  buildLogin,
  buildError,
  clearDOM,
  populateHeader,
  buildAccountsHead,
  renderAccounts,
  clearAccounts,
  buildCurrencies,
  updateTicker,
  buildMaps,
  buildAccountBody,
  buildAccountHead,
  renderCurrenciesOwn,
  buildHistoryBody,
} from "./modules/dom";
import {
  loginServer,
  accountsServer,
  newAccountServer,
  ownCurrenciesServer,
  allCurrenciesServer,
  locationsServer,
} from "./modules/server-api";
import "./css/styles.scss";

let login = "";
let password = "";

const router = new Navigo("/");

router
  .on("/accounts", async () => {
    router.resolve();
    if (sessionStorage.getItem("token")) {
      clearDOM();
      buildHeader();
      populateHeader("Счета");
      buildAccountsHead();
      try {
        let accountsRendered = await accountsServer(
          sessionStorage.getItem("token"),
          "/accounts"
        );
        renderAccounts(accountsRendered);

        document
          .getElementById("newAccBtn")
          .addEventListener("click", async (e) => {
            e.preventDefault();
            const serverResponse = await newAccountServer(
              sessionStorage.getItem("token")
            );
            clearAccounts();
            accountsRendered = await accountsServer(
              sessionStorage.getItem("token"),
              "/accounts"
            );
            renderAccounts(accountsRendered);
            console.log(serverResponse);
            window.scrollTo(0, document.body.scrollHeight);
          });
        const selectEl = document.getElementById("select");
        selectEl.addEventListener("change", (e) => {
          // document.querySelector(".select-selected").addEventListener("change", (e) => {
          clearAccounts();
          renderAccounts(
            accountsRendered,
            document.querySelector(".select-selected").textContent
            // selectEl.options[selectEl.selectedIndex].dataset.value
          );
        });
        transformSelect();
      } catch (error) {
        console.log("error: ".error);
        router.navigate("/");
      } finally {
        document.getElementById("spinner").classList.add("hidden");
      }
    } else {
      loginLogic();
    }
  })
  .on("/", () => {

    clearDOM();
    loginLogic();
  })
  .on("/currencies", async () => {
    router.resolve();
    if (sessionStorage.getItem("token")) {
      buildHeader();
      populateHeader("Валюта");
      try {
        const serverResponseOwn = await ownCurrenciesServer(
          sessionStorage.getItem("token")
        );
        const serverResponseAll = await allCurrenciesServer(
          sessionStorage.getItem("token")
        );
        buildCurrencies(serverResponseOwn, serverResponseAll);
        exchangeBtnFunction(
          document.getElementById("exchange-btn"),
          sessionStorage.getItem("token"),
          renderCurrenciesOwn
        );
        const currencyTickerSocket = new WebSocket(
          "ws://localhost:3000/currency-feed"
        );
        const tickerDOM = document.querySelector(".currencies__tickers");
        currencyTickerSocket.addEventListener("message", (event) => {
          const message = JSON.parse(event.data);
          if (
            message.type == "EXCHANGE_RATE_CHANGE" &&
            window.location.pathname == "/currencies"
          ) {
            updateTicker(
              tickerDOM,
              message.from,
              message.to,
              message.rate,
              message.change
            );
          } else {
            currencyTickerSocket.close();
          }
        });
        transformSelect();
      } catch (error) {
        console.log("error: ".error);
        router.navigate("/");
      } finally {
        document.getElementById("spinner").classList.add("hidden");
      }
    } else {
      loginLogic();
    }
  })
  .on("/atms", async () => {
    router.resolve();
    // router.navigate("/atms");
    const script = document.createElement("script");
    script.setAttribute(
      "src",
      "https://api-maps.yandex.ru/2.1/?apikey=9a3d2bbb-8562-4d00-be2c-077fa0864fe4&lang=ru_RU"
    );
    document.head.append(script);
    if (sessionStorage.getItem("token")) {
      buildHeader();
      populateHeader("Банкоматы");
      try {
        const locations = await locationsServer(
          sessionStorage.getItem("token")
        );
        buildMaps(locations);
      } catch (error) {
        console.log("error: ".error);
        router.navigate("/");
      } finally {
        document.getElementById("spinner").classList.add("hidden");
      }
    } else {
      loginLogic();
    }
  })
  .on(`/\/account$/`, async () => {
    const token = sessionStorage.getItem("token");
    if (token) {
      buildHeader();
      populateHeader();
      try {
        let accountsRendered = await accountsServer(
          token,
          `/account/${window.location.search.substring(1)}`
        );

        buildAccountHead(accountsRendered, "Просмотр счёта");
        const promise = new Promise((resolve) => resolve(buildAccountBody(accountsRendered)))
        promise.then(paginationLogic());

        transferFunds(
          document.getElementById("transfer-form"),
          token,
          accountsRendered.payload.account,
          accountsRendered.payload.balance
        );
        const balanceData = calculateBalances(accountsRendered.payload, 6);
        createChart("container", balanceData);
        document.getElementById("back").addEventListener("click", () => {
          router.navigate("/accounts");
          console.log("going back");
        });
      } catch (error) {
        console.log("error: ", error);
        router.navigate("/");
      } finally {
        document.getElementById("spinner").classList.add("hidden");
      }
    } else {
      loginLogic();
    }
  })
  .on(`/\/account\/details$/`, async () => {
    console.log("Hello world! Its history page");
    const token = sessionStorage.getItem("token");
    if (token) {
      buildHeader();
      populateHeader();
      try {
        let accountsRendered = await accountsServer(
          token,
          `/account/${window.location.search.substring(1)}`
        );

        buildAccountHead(accountsRendered, "История баланса");

        //test
        // test can be run for visualisation - object "payload" is in jest test file
        // payload.transactions.reverse();
        // const balanceData = calculateBalances(payload, 12);
        // test over

        const balanceData = calculateBalances(accountsRendered.payload, 12);

        const promiseDet = new Promise((resolve) => resolve(buildHistoryBody(accountsRendered)))
        promiseDet.then(paginationLogic())
        .then(createChart("dynamic", balanceData))
        .then(createRelativeChart("relative", balanceData))



        document.getElementById("back").addEventListener("click", () => {
          router.navigate(`/account?${window.location.search.substring(1)}`);
          console.log("going back");
        });
      } catch (error) {
        console.log("error: ".error);
        router.navigate("/");
      } finally {
        document.getElementById("spinner").classList.add("hidden");
      }
    } else {
      loginLogic();
    }
  })
  .resolve();

function loginLogic() {
  if (!sessionStorage.getItem("token")) {
    buildHeader();
    buildLogin();
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.target[0].classList.remove("danger");
      e.target[1].classList.remove("danger");
      login = e.target[0].value;
      password = e.target[1].value;
      const validation = /^[0-9a-zA-Z]{6,}$/;
      if (!validation.test(login) || !validation.test(password)) {
        if (!validation.test(login) && !validation.test(password)) {
          buildError(
            "Некорректный ввод логина и пароля"
          );
          e.target[0].classList.add("danger");
          e.target[1].classList.add("danger");
        } else if (!validation.test(login)) {
          e.target[0].classList.add("danger");
          buildError(
            "Некорректный логин (6 или более символов и/или букв)"
          );
        } else if (!validation.test(password)) {
          buildError(
            "Некорректный пароль (6 или более символов и/или букв)"
          );
          e.target[1].classList.add("danger");
        }
        // return;
      } else
      {const serverResponse = await loginServer(login, password);
      if (serverResponse.payload) {
        sessionStorage.setItem("token", serverResponse.payload.token);
        router.navigate("/accounts");
      } else {
        if(serverResponse.error == "Invalid password") {
          buildError("Вы указали неверный пароль");
        } else if(serverResponse.error == "No such user") {
          buildError("Пользователя с указанным логином не существует");
        } else buildError(`Что то пошло не так: ${serverResponse.error}`);
      }}

    });
  } else {
    router.navigate("/accounts")
    router.resolve();
  }
}
