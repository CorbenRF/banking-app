import { exchangeCurrenciesServer, transferFundsServer } from "./server-api";
var Highcharts = require("highcharts");
// Load module after Highcharts is loaded
require("highcharts/modules/exporting")(Highcharts);

export function exchangeBtnFunction(domBtn, token, fn) {
  const errorField = document.querySelector(".currencies__error")
  let inputCur = document.getElementById("exchange-input");
  inputCur.addEventListener("input", () => {
    errorField.classList.remove('danger')
    errorField.classList.remove('success')
    errorField.textContent = "";
    inputCur.classList.remove('danger')})
  var numberMask = IMask(inputCur, {
    mask: Number, // enable number mask
    scale: 10, // digits after point, 0 for integers
    signed: false, // disallow negative
    thousandsSeparator: " ", // any single char
    padFractionalZeros: false, // if true, then pads zeros at end to the length of scale
    normalizeZeros: true, // appends or removes zeros at ends
    radix: ".", // fractional delimiter
    mapToRadix: [","], // symbols to process as radix
  });
  domBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const fromSelected = document.getElementById("own-select");
    const toSelected = document.getElementById("all-select");

    const fromValue = fromSelected.options[fromSelected.selectedIndex].value;
    const toValue = toSelected.options[toSelected.selectedIndex].value;
    let exchangeSum = numberMask.unmaskedValue;
    if(exchangeSum) {
      const balanceList = await exchangeCurrenciesServer(
        fromValue,
        toValue,
        exchangeSum,
        token
      );
      if(balanceList.payload) {
        console.log("balance list: ", balanceList);
        document
          .querySelector(".currencies__body")
          .replaceChild(
            fn(balanceList),
            document.querySelector(".currencies__own")
          );
          numberMask.unmaskedValue = "";
          errorField.textContent = `Успешно переведено ${fromValue} ${exchangeSum} в валюту ${toValue}`
          errorField.classList.add('success')
      } else {
        if(balanceList.error === "Not enough currency") {
          inputCur.classList.add('danger')
          errorField.textContent = "Введите корректную сумму"
          errorField.classList.add('danger')
        } else if(balanceList.error === "Overdraft prevented") {
          inputCur.classList.add('danger')
          errorField.classList.add('danger')
          errorField.textContent = "Overdraft не доступен"
        }
      }
    } else {
      inputCur.classList.add('danger')
      errorField.textContent = "Введите корректную сумму"
      errorField.classList.add('danger')
    }


  });
}

export function transferFunds(domBtn, token, accountFrom, balance) {
  const inputs = domBtn.querySelectorAll("input");
  var receiverMask = IMask(inputs[0], {
    mask: Number, // enable number mask
    scale: 0, // digits after point, 0 for integers
    signed: false, // disallow negative
  });
  var sumMask = IMask(inputs[1], {
    mask: Number, // enable number mask
    scale: 6, // digits after point, 0 for integers
    signed: false, // disallow negative
    thousandsSeparator: " ", // any single char
    padFractionalZeros: false, // if true, then pads zeros at end to the length of scale
    normalizeZeros: true, // appends or removes zeros at ends
    radix: ",", // fractional delimiter
    mapToRadix: ["."], // symbols to process as radix
  });
  domBtn.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBlock = document.getElementById("transfer-error");
    const receiverAccNumber = receiverMask.unmaskedValue;
    console.log("recepient account: ", receiverAccNumber);
    const sumToTransfer = sumMask.unmaskedValue;
    if (sumToTransfer == 0 || sumToTransfer == "") {
      errorBlock.textContent = "Введите корректную сумму";
      errorBlock.classList.add("danger");
    } else {
      const serverMessage = await transferFundsServer(
        token,
        accountFrom,
        receiverAccNumber,
        sumToTransfer
      );
      if (serverMessage.payload) {
        errorBlock.textContent = `Переведено успешно: ${sumToTransfer.toLocaleString(
          "ru-RU"
        )} ₽ со счета ${accountFrom} на счет ${serverMessage.payload.transactions[(serverMessage.payload.transactions.length - 1)].to}`;
        errorBlock.classList.remove("danger");
        errorBlock.classList.add("success");
        document.querySelector(
          ".profile__balance-num"
        ).textContent = `${serverMessage.payload.balance.toLocaleString(
          "ru-RU"
        )} ₽`;
        [inputs[0], inputs[1]].forEach((item) => (item.value = ""));
      } else {
        errorBlock.textContent = serverMessage.error;
        errorBlock.classList.add("danger");
      }
    }
    receiverMask.value = "";
    sumMask.value = "";
  });

}

export function createChart(container, balanceData) {
  // Create the chart
  console.log("dynamic balance data: ", balanceData);
  Highcharts.chart(container, {
    title: false,
    chart: {
      plotBorderWidth: 1,
      plotBorderColor: "#000",
      height: "30%",
    },
    exporting: { buttons: { contextButton: { enabled: false } } },
    colors: ["#116ACC"],
    legend: {
      enabled: false,
    },
    xAxis: {
      categories: balanceData.monthsData,
      labels: {
        style: {
          fontSize: 20,
        },
      },
    },
    yAxis: {
      min: 0,
      max: balanceData.maxBalance,
      title: false,
      gridLineWidth: 0,
      tickInterval: 0,
      opposite: true,
      labels: {
        style: {
          fontSize: 20,
        },
      },
    },
    series: [
      {
        type: "column",
        data: balanceData.balancesData,
        dataLabels: {
          align: "right",
        },
      },
    ],
  });
}

export function createRelativeChart(container, balanceData) {
  const highestSum = balanceData.positiveTransBalances.map(function (num, idx) {
    return num + balanceData.negativeTransBalances[idx];
  });
  const highestPoint = Math.max.apply(Math, highestSum);
  const secondHighest = Math.max.apply(Math, balanceData.negativeTransBalances);
  console.log("highestPoint: ", highestSum);
  console.log("positive balances: ", balanceData.positiveTransBalances);
  console.log("negative balances: ", balanceData.negativeTransBalances);

  Highcharts.chart(container, {
    title: false,
    chart: {
      type: "column",
      plotBorderWidth: 1,
      plotBorderColor: "#000",
      height: "30%",
    },
    exporting: { buttons: { contextButton: { enabled: false } } },
    colors: ["#76CA66", "#FD4E5D"],
    legend: {
      enabled: false,
    },
    xAxis: {
      categories: balanceData.monthsData,
      labels: {
        style: {
          fontSize: 20,
        },
      },
    },
    yAxis: {
      min: 0,
      max: highestPoint,
      title: false,
      gridLineWidth: 0,
      tickPositions: [0, secondHighest, highestPoint],
      opposite: true,
      labels: {
        style: {
          fontSize: 20,
        },
      },
      reversedStacks: true,
    },
    plotOptions: {
      series: {
        stacking: "normal",
      },
    },
    series: [
      {
        name: "Доходы",
        data: balanceData.positiveTransBalances,
      },
      {
        name: "Расходы",
        data: balanceData.negativeTransBalances,
      },
    ],
  });
}

function createDate(days, months, years) {
  var date = new Date();
  date.setDate(date.getDate() + days);
  date.setMonth(date.getMonth() + months);
  date.setFullYear(date.getFullYear() + years);
  return date;
}

export function calculateBalances(payload, scale) {
  console.log(payload);
  let balance = payload.balance;
  let dataPoints = [];
  let positiveTransBalances = [];
  let negativeTransBalances = [];
  if (payload.transactions.length > 0) {
    let positiveBalance = 0;
    let negativeBalance = 0;
    let monthScale = createDate(0, scale * -1, 0); // how far back we want to go, ex. 6 or 12 months
    let currentMonth = "";
    let currentYear = "";
    for (let i = payload.transactions.length - 1; i >= 0; i--) {
      let dateObj = new Date(payload.transactions[i].date);
      if (dateObj > monthScale) {
        if (!currentMonth && !currentYear) {
          // first transaction always goes here
          // first iteration is unique
          currentMonth = dateObj.getMonth();
          currentYear = dateObj.getFullYear();
          dataPoints.unshift({
            date: dateObj
              .toLocaleDateString("ru-RU", {
                month: "long",
              })
              .substring(0, 3),
            balance: balance,
          });
          //edge case for one transaction only and first iteration for everything else
          if (payload.transactions[i].from == payload.account) {
            // if we were the payer then add to balance to go back in time
            balance += payload.transactions[i].amount;
            negativeBalance += payload.transactions[i].amount;
          } else {
            // else subtract whatever was paid to us to go back in time
            balance -= payload.transactions[i].amount;
            positiveBalance += payload.transactions[i].amount;
          }
          console.log(`balance for month ${currentMonth} is ${balance}`);
        } else if (
          currentMonth !== dateObj.getMonth() ||
          currentYear !== dateObj.getFullYear()
        ) {
          // consequent iterations on edge of months
          // triggers when we go to the next month in the past to rewrite current month and fix the balance for that month
          positiveTransBalances.unshift(Number(positiveBalance.toFixed(2)));
          negativeTransBalances.unshift(Number(negativeBalance.toFixed(2)));
          positiveBalance = 0;
          negativeBalance = 0;
          currentMonth = dateObj.getMonth();
          currentYear = dateObj.getFullYear();
          dataPoints.unshift({
            date: dateObj
              .toLocaleDateString("ru-RU", {
                month: "long",
              })
              .substring(0, 3),
            balance: balance,
          });
          console.log(`balance for month ${currentMonth} is ${balance}`);
          if (payload.transactions[i].from == payload.account) {
            // if we were the payer then add to balance to go back in time
            balance += payload.transactions[i].amount;
            negativeBalance += payload.transactions[i].amount;
          } else {
            // else subtract whatever was paid to us to go back in time
            balance -= payload.transactions[i].amount;
            positiveBalance += payload.transactions[i].amount;
          }
        } else {
          // same month transactions
          if (payload.transactions[i].from == payload.account) {
            // if we were the payer then add to balance to go back in time
            balance += payload.transactions[i].amount;
            negativeBalance += payload.transactions[i].amount;
          } else {
            // else subtract whatever was paid to us to go back in time
            balance -= payload.transactions[i].amount;
            positiveBalance += payload.transactions[i].amount;
          }
        }
      } else {
        break;
      }
    }
    // if (dataPoints.length == 1) {
    // edge case when only 1 month of data exists
    positiveTransBalances.unshift(Number(positiveBalance.toFixed(2)));
    negativeTransBalances.unshift(Number(negativeBalance.toFixed(2)));
    // }
  }

  let monthsData = [];
  let balancesData = [];
  for (let item of dataPoints) {
    monthsData.push(item.date);
    balancesData.push(item.balance);
  }
  const maxBalance = Math.max.apply(Math, balancesData);

  console.log("dataPoints: ", dataPoints);
  console.log("monthsData: ", monthsData);
  console.log("balancesData: ", balancesData);
  console.log("max balance: ", maxBalance);

  const exitObj = {
    monthsData,
    balancesData,
    maxBalance,
    positiveTransBalances,
    negativeTransBalances,
  };
  console.log("exit object: ", exitObj);
  return exitObj;
}

export function transformSelect() {
  var x, i, j, l, ll, selElmnt, a, b, c;
/* Look for any elements with the class "custom-select": */
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;
  /* For each element, create a new DIV that will act as the selected item: */
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  /* For each element, create a new DIV that will contain the option list: */
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < ll; j++) {
    /* For each option in the original select element,
    create a new DIV that will act as an option item: */
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {
        /* When an item is clicked, update the original select box,
        and the selected item: */
        var y, i, k, s, h, sl, yl;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        sl = s.length;
        h = this.parentNode.previousSibling;
        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            yl = y.length;
            for (k = 0; k < yl; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
        document.getElementsByTagName("select")[0].dispatchEvent(new Event('change'));
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function(e) {
    /* When the select box is clicked, close any other select boxes,
    and open/close the current select box: */
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");

  });
}

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);
}
