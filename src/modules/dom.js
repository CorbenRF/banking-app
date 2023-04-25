import { el, setChildren, mount } from "redom";
import {} from "imask";
import {paginationLogic} from "./pagination"

export function clearDOM() {
  setChildren(document.body, "");
}

export function clearAccounts() {
  document.querySelector(".account__grid").remove();
}
export function buildHeader() {
  const header = el("header.header");
  setChildren(header, [
    el(".header__logo", {
      textContent: "Coin.",
    }),
    el(".header__tabs"),
  ]);
  const main = el("main");
  const spinner = el(".spinner#spinner", {
    innerHTML: `<?xml version="1.0" encoding="utf-8"?>
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: transparent; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
    <path d="M10 50A40 40 0 0 0 90 50A40 43.3 0 0 1 10 50" fill="#116acc" stroke="none">
      <animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 51.65;360 50 51.65"></animateTransform>
    </path>`,
  });

  setChildren(document.body, [header, spinner, main]);
}

export function populateHeader(currentTab = "") {
  for (let item of [
    ["Банкоматы", "atms"],
    ["Счета", "accounts"],
    ["Валюта", "currencies"],
    ["Выйти", ""],
  ]) {
    const tab = el("a.btn.btn__tab-clear", {
      textContent: `${item[0]}`,
      href: `/${item[1]}`,
      "data-navigo": "",
    });
    if (currentTab == item[0]) {
      tab.classList.add("tab-active");
    }
    mount(document.querySelector(".header__tabs"), tab);
    if(tab.textContent === "Выйти" ) {
      tab.addEventListener("click", (e) => {
        sessionStorage.removeItem("token");
      })
    }
  }
}

export function buildLogin() {
  const windowLogin = el(".login__wrapper");
  const loginTitle = el("h2.login__title", { textContent: "Вход в аккаунт" });
  const form = el("form#login-form");
  const loginInputLoginWrapper = el(".login__login-wrapper");
  const passwordInputLoginWrapper = el(".login__password-wrapper");

  for (let item of ["Логин", "Пароль"]) {
    let value = item == "Логин" ? "login" : "password";
    let inputType = item == "Логин" ? "text" : "password";
    const inputEl = el(`input.login__input#${value}`, {
      type: inputType,
      placeholder: "placeholder",
      name: value,
    });
    setChildren(eval(`${value}InputLoginWrapper`), [
      el("label.input__label", { textContent: item }),
      inputEl,
    ]);
  }

  setChildren(form, [
    loginInputLoginWrapper,
    passwordInputLoginWrapper,
    el("button.btn.login-btn#submit-login", {
      textContent: "Войти",
    }),
  ]);

  setChildren(windowLogin, [loginTitle, form], el(".error-message"));
  mount(document.querySelector("main"), windowLogin);
}

export function buildError(errorMessage) {
  document.querySelector(".error-message").textContent = `${errorMessage}`;
}

export function buildAccountsHead() {
  //header
  const accountsTitle = el("h2.accounts__title", { textContent: "Ваши счета" });
  const sortSelect = el(".accounts__sort");
  sortSelect.innerHTML = `
  <fieldset id="custom-select" class="custom-select">
  <select id="select">
  <option value>Сортировка</option>
  <option value="account">По номеру</option>
  <option value="balance">По балансу</option>
  <option value="response.payload.transactions[0].date">По последней транзакции</option>
  </select>
  </fieldset>
  `;

  const headerBtn = el("button.accounts__btn.btn#newAccBtn");
  const HeaderContainer = el(".accounts__header");
  headerBtn.innerHTML = `
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M7.99999 7.69167e-06L8 8.00001M8 8.00001L8.00001 16M8 8.00001L16 8.00001M8 8.00001L0 8" stroke="white" stroke-width="2"/>
  </svg>
  <span class="accounts__btn-text">Создать новый счёт</span>
  `;
  setChildren(HeaderContainer, [accountsTitle, sortSelect, headerBtn]);
  setChildren(document.querySelector("main"), HeaderContainer);
}

export function renderAccounts(response, quality = "") {
  // body

  console.log("server response to accounts: ", response);
  const grid = el(".account__grid");
  mount(document.querySelector("main"), grid);
  let tempResponse = null;
  if (quality) {
    console.log("sort quality: ", quality)
    tempResponse = response.payload.sort((a, b) => {
      if(quality == "По последней транзакции"){
      if(a.transactions[0]&& b.transactions[0]) {
        const aDate = new Date(a.transactions[0].date)
        const bDate = new Date(b.transactions[0].date)
        return aDate - bDate
      } else if(a.transactions[0]) {
        return 1;
      } else if(b.transactions[0]) {
        return -1;
      }
       else {
        return 0;
      } } else if(quality == "По номеру") return a["account"] - b["account"]
      else if(quality == "По балансу") return a["balance"] - b["balance"]

    });
  } else {
    tempResponse = response.payload;
  }

  for (let item of tempResponse) {
    let newCard = el(".account__card");
    let flexBlock = el(".account__bottom");
    let lastTransBlock = el(".account__last");
    let date = "-";
    if (item.transactions.length > 0) {
      date = new Date(item.transactions[0].date);
      date = date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    setChildren(lastTransBlock, [
      el("span.account__transaction-text", {
        textContent: "Последняя транзакция",
      }),
      el("span.account__transaction-date", {
        textContent: date,
      }),
    ]);
    setChildren(flexBlock, [
      lastTransBlock,
      el("a.account__open.btn", {
        textContent: "Открыть",
        href: `/account?${item.account}`,
        "data-navigo": "",
      }),
    ]);
    setChildren(newCard, [
      el("h3.account__number", { textContent: item.account }),
      el("span.account__balance", {
        textContent: `${new Intl.NumberFormat("ru-RU", {
          maximumFractionDigits: 2,
        }).format(item.balance)} ₽`,
      }),
      flexBlock,
    ]);
    mount(grid, newCard);
  }
}

export function buildCurrencies(ownCurrencies, allCurrencies) {
  const HeaderContainer = el(".accounts__header");
  setChildren(
    HeaderContainer,
    el("h2.accounts__title", { textContent: "Валютный обмен" })
  );
  setChildren(document.querySelector("main"), HeaderContainer);

  const currenciesBody = el(".currencies__body");

  const currenciesOwn = renderCurrenciesOwn(ownCurrencies);
  mount(currenciesBody, currenciesOwn);
  renderCurrenciesTicker(currenciesBody);
  renderCurrenciesExchange(ownCurrencies, allCurrencies, currenciesBody);

  mount(document.querySelector("main"), currenciesBody);
}

export function renderCurrenciesOwn(response) {
  const currenciesOwn = el(".currencies__card.currencies__own");

  let currenciesOwnList = el("ul.currencies__list");
  for (let [key, value] of Object.entries(response.payload)) {
    if (value.amount !== 0) {
      const currencyCode = el("span.currencies__list-code", {
        textContent: `${value.code}`,
      });
      const currencyAmount = el("span.currencies__list-amount", {
        textContent: `${value.amount.toLocaleString("ru-RU")}`,
      });
      const li = el("li.currencies__own-currency");
      setChildren(li, [currencyCode, el(".dotted-line"), currencyAmount]);
      mount(currenciesOwnList, li);
    }
  }
  setChildren(currenciesOwn, [
    el("h4.subtitle", { textContent: "Ваши валюты" }),
    currenciesOwnList,
  ]);
  return currenciesOwn;
}

function renderCurrenciesExchange(ownCurrencies, allCurrencies, body) {
  const inputSum = el("input.currencies__input#exchange-input", {
    type: "text",
    placeholder: "0",
  });

  const currenciesExchange = el(".currencies__card.currencies__exchange");
  const currenciesWrapper = el(".currencies__wrapper");
  const currenciesExchangeBody = el(".currencies__exchange-body");
  const currenciesExchangeBtn = el("button.btn.exchange-btn#exchange-btn", {
    textContent: "Обменять",
  });
  const fromToBlock = el(".currencies__fromto");
  let ownCurrenciesArray = [];
  for (let [key, value] of Object.entries(ownCurrencies.payload)) {
    if (value.amount > 0) {
      ownCurrenciesArray.push(value.code);
    }
  }
  setChildren(fromToBlock, [
    el("span.currencies__text", { textContent: "Из" }),
    createSelect(ownCurrenciesArray, "own-select"),
    el("span.currencies__text", { textContent: "в" }),
    createSelect(allCurrencies.payload, "all-select"),
  ]);
  const sumBlock = el(".currencies__sum");
  setChildren(sumBlock, [
    el("span.currencies__text", { textContent: "Сумма" }),
    inputSum,
  ]);
  setChildren(currenciesExchangeBody, [fromToBlock, sumBlock]);
  setChildren(currenciesWrapper, [
    currenciesExchangeBody,
    currenciesExchangeBtn,
  ]);
  setChildren(currenciesExchange, [
    el("h4.subtitle", { textContent: "Обмен валюты" }),
    currenciesWrapper,
    el(".currencies__error"),
  ]);
  mount(body, currenciesExchange);
}

function createSelect(list, name) {
  let wrapper = el(".custom-select")
  let select = el(`select.currencies__own-select#${name}`);
  for (let item of list) {
    mount(select, el("option", { textContent: `${item}` }));
  }
  setChildren(wrapper, select)
  return wrapper;
}

function renderCurrenciesTicker(body) {
  const currenciesForex = el(".currencies__card.currencies__forex");
  const listTickers = el("ul.currencies__tickers");

  setChildren(currenciesForex, [
    el("h4.subtitle", { textContent: "Изменение курсов в реальном времени" }),
    listTickers,
  ]);
  mount(body, currenciesForex);
}

export function updateTicker(dom, from, to, rate, change) {
  const items = document.querySelector(".currencies__tickers");
  try {
    if (items.childElementCount > 19) {
      items.lastChild.remove();
    }
    const li = el("li.currencies__ticker-item");
    const rotate = change == -1 ? "rotate" : "";
    const svg = `<svg class="${rotate}" width="20" height="10" viewBox="0 0 20 10" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 10L10 0L0 10L20 10Z" fill="${
    change == 1 ? "#76CA66" : "#FD4E5D"
  }"/>
  </svg>`;
    setChildren(li, [
      el("span.currencies__ticker-name", { textContent: `${from}/${to}` }),
      el(".dotted-line"),
      el("span.currencies__ticker-rate", {
        innerHTML: `
    ${rate.toLocaleString("ru-RU")}
    ${svg}
    `,
      }),
    ]);
    mount(dom, li, dom.firstChild);
  } catch (err) {
    console.log(err);
  }
}

export function buildMaps(locations) {
  // mount(
  //   document.head,
  //   el("script", {
  //     src: "https://api-maps.yandex.ru/2.1/?apikey=9a3d2bbb-8562-4d00-be2c-077fa0864fe4&lang=ru_RU",
  //   })
  // );
  const mapContainer = el(".map__container#map");
  setChildren(document.querySelector("main"), [
    el("h2.accounts__title.title", { textContent: "Карта банкоматов" }),
    mapContainer,
  ]);
  // console.log("locations: ", locations);
  yaMaps(locations);
}

async function yaMaps(locations) {
  let newInt = setInterval(() => {
      if (ymapsReady(locations)) {
        clearInterval(newInt);
      }

  }, 100);
}
function ymapsReady(locations) {
  // console.log("status: ", typeof ymaps.ready().Map);
  try {
    ymaps.ready(init(locations));
    return true;
  } catch (err) {
    // console.log("construct error:", err);
    return false;
  }
}


function init(locations) {
  // Создание карты.
    var myMap = new ymaps.Map("map", {
      // Координаты центра карты.
      // Порядок по умолчанию: «широта, долгота».
      // Чтобы не определять координаты центра карты вручную,
      // воспользуйтесь инструментом Определение координат.
      center: [55.76, 37.64],
      // Уровень масштабирования. Допустимые значения:
      // от 0 (весь мир) до 19.
      zoom: 11,
    });
    for (let item of locations.payload) {
      myMap.geoObjects.add(new ymaps.Placemark([item.lat, item.lon]), {}, {});
    }

}

export function buildAccountHead(response, title) {
  const head = el(".profile__head");
  const leftDiv = el(".profile__head-left");
  const rightDiv = el(".profile__head-right");
  const backBtn = el("button.profile__backbtn.btn#back", {
    innerHTML: `
<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.83 5L7.41 1.41L6 0L0 6L6 12L7.41 10.59L3.83 7L16 7V5L3.83 5Z" fill="white"/>
</svg><span class="account__backbtn-text">Вернуться назад</span>
`,
  });

  setChildren(leftDiv, [
    el("h2.profile__title", { textContent: `${title}` }),
    el("h4.profile__number", {
      textContent: `№ ${response.payload.account}`,
    }),
  ]);

  setChildren(rightDiv, [
    backBtn,
    el(".profile__balance", {
      innerHTML: `
    <span class="profile__balance-text">Баланс</span>
    <span class="profile__balance-num">${response.payload.balance.toLocaleString(
      "ru-RU"
    )} ₽</span>
    `,
    }),
  ]);

  setChildren(head, [leftDiv, rightDiv]);

  mount(document.body, head);
}

export function buildAccountBody(response) {
  const wrapper = el(".profile__content");
  setChildren(wrapper, [
    buildTransferFunds(),
    buildBalanceDynamic("Динамика баланса", "graph", "container"),
    buildTransactionsHistory(response.payload),
  ]);
  mount(document.body, wrapper);
}

function buildTransferFunds() {
  const transferWrapper = el(".transfer__wrapper");
  const subtitle = el("h4.subtitle", { textContent: "Новый перевод" });
  const transferContent = el("form.transfer__content.grid#transfer-form");
  setChildren(transferContent, [
    el("span.transfer__receiver-text", {
      textContent: "Номер счёта получателя",
    }),
    el("input.transfer__receiver-input#receiver", {
      placeholder: "placeholder",
      type: "text",
    }),
    el("span.transfer__amount-text", { textContent: "Сумма перевода" }),
    el("input.transfer__amount-input#amount", {
      placeholder: "placeholder",
      type: "text",
    }),
    el("button.transfer__submit.btn#transfer-submit", {
      innerHTML: `
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 16H2C0.89543 16 0 15.1046 0 14V1.913C0.0466084 0.842547 0.928533 -0.00101428 2 -9.95438e-07H18C19.1046 -9.95438e-07 20 0.89543 20 2V14C20 15.1046 19.1046 16 18 16ZM2 3.868V14H18V3.868L10 9.2L2 3.868ZM2.8 2L10 6.8L17.2 2H2.8Z" fill="white"/>
</svg><span class="btn-text transfer__btn-text">Отправить</span>
    `,
    }),
    el(".transfer__error#transfer-error"),
  ]);

  setChildren(transferWrapper, [subtitle, transferContent]);
  return transferWrapper;
}

function buildBalanceDynamic(title, className, id) {
  const wrapper = el(`.${className}__wrapper`);
  const container = el(`.${className}__container#${id}`);

  setChildren(wrapper, [el("h4.subtitle", { textContent: title }), container]);
  return wrapper;
}

function buildTransactionsHistory(payload) {
  const outerLinkWrapper = el(".history__globallink");

  const innerWrapper = el("a.history__wrapper", {
    href: `/account/details?${payload.account}`,
    "data-navigo": "",
  });
  const contentTable = el(".history__content");
  const table = el("table.history__table#paginated-list", {"data-current-page": "1"});
  const tableHeader = el("tr.history__table-header");
  const histroy__rows = el(".history__rows")
  setChildren(tableHeader, [
    el("th.table__header-item", { textContent: "Счёт отправителя" }),
    el("th.table__header-item", { textContent: "Счёт получателя" }),
    el("th.table__header-item", { textContent: "Сумма" }),
    el("th.table__header-item", { textContent: "Дата" }),
  ]);
  setChildren(table, tableHeader);
  if (payload.transactions.length > 0) {
    let counter = 0;
    for (let i = payload.transactions.length - 1; i >= 0; i--) {
      const newRow = el("tr.history__row");
      let dateObj = new Date(payload.transactions[i].date);
      const negativeSum =
        payload.account == payload.transactions[i].from
          ? "negative"
          : "positive";
      const outputAmount = negativeSum == "negative" ? "-" : "+";

      setChildren(newRow, [
        el("td.history__cell", {
          textContent: `${payload.transactions[i].from}`,
        }),
        el("td.history__cell", {
          textContent: `${payload.transactions[i].to}`,
        }),
        el(`td.history__cell.${negativeSum}`, {
          textContent: `${outputAmount} ${payload.transactions[
            i
          ].amount.toLocaleString("ru-RU")} ₽ `,
        }),
        el("td.history__cell", {
          textContent: `${dateObj.toLocaleDateString("ru-RU")}`,
        }),
      ]);
      mount(table, newRow);
      // mount(histroy__rows, newRow);
      if (++counter > 160) {
        // newRow.classList.add("hidden")
        break;
      }
    }
  }
  // setChildren(table, histroy__rows) ///
  const nav = el(".pagination-container", {"innerHTML": `
    <button class="pagination-button" id="prev-button" title="Previous page" aria-label="Previous page">
      &lt;
    </button>

    <div id="pagination-numbers">
    </div>

    <button class="pagination-button" id="next-button" title="Next page" aria-label="Next page">
      &gt;
    </button>
  `})
  setChildren(contentTable, table);
  setChildren(innerWrapper, contentTable);
  setChildren(outerLinkWrapper, [
    el("h4.history__title.subtitle", { textContent: "История переводов" }),
    innerWrapper, nav
  ]);
  return outerLinkWrapper;
}

export async function buildHistoryBody(response) {
  const content = el(".details__content");
  setChildren(content, [
    buildBalanceDynamic("Динамика баланса", "details", "dynamic"),
    buildBalanceDynamic(
      "Соотношение входящих исходящих транзакций",
      "details",
      "relative"
    ),
    buildTransactionsHistory(response.payload),
  ]);

  mount(document.body, content);

}
