/**
 * @jest-environment jsdom
 */
import { calculateBalances } from "./events-logic.js";

test("CalculateBalances", () => {
  const payload = {
    account: "74213041477477406320783754",
    balance: 5000,
    mine: true,
    transactions: [
      {
        // 5000 balance as of march
        // positive transaction
        amount: 600,
        date: "2023-03-27T12:52:23.421Z",
        from: "58771586251637537441180848",
        to: "74213041477477406320783754",
      },
      {
        // positive transaction
        amount: 400,
        date: "2023-03-27T12:52:23.421Z",
        from: "58771586251637537441180848",
        to: "74213041477477406320783754",
      },
      {
        // positive transaction
        amount: 500,
        date: "2023-03-15T12:52:23.421Z",
        from: "58771586251637537441180848",
        to: "74213041477477406320783754",
      },
      {
        // negative transaction
        amount: 3000,
        date: "2023-03-15T12:52:23.421Z",
        from: "74213041477477406320783754",
        to: "58771586251637537441180848",
      },
      {
        // 6500 balance as of feb
        // positive transaction
        amount: 500,
        date: "2023-02-28T12:52:23.421Z",
        from: "58771586251637537441180848",
        to: "74213041477477406320783754",
      },
      {
        // negative transaction
        amount: 1000,
        date: "2023-02-10T12:52:23.421Z",
        from: "74213041477477406320783754",
        to: "58771586251637537441180848",
      }, // 7000 balance as of feb
      {
        // positive transaction
        amount: 600,
        date: "2023-01-27T12:52:23.421Z",
        from: "58771586251637537441180848",
        to: "74213041477477406320783754",
      },
      {
        // positive transaction
        amount: 400,
        date: "2023-01-21T12:52:23.421Z",
        from: "58771586251637537441180848",
        to: "74213041477477406320783754",
      },
      {
        // positive transaction
        amount: 500,
        date: "2023-01-01T12:52:23.421Z",
        from: "58771586251637537441180848",
        to: "74213041477477406320783754",
      }, // 5500 balance as of jan
      {
        // positive transaction
        amount: 600,
        date: "2022-12-27T12:52:23.421Z",
        from: "58771586251637537441180848",
        to: "74213041477477406320783754",
      },
      {
        // positive transaction
        amount: 400,
        date: "2022-12-19T12:52:23.421Z",
        from: "58771586251637537441180848",
        to: "74213041477477406320783754",
      },
      {
        // positive transaction
        amount: 500,
        date: "2022-12-01T12:52:23.421Z",
        from: "58771586251637537441180848",
        to: "74213041477477406320783754",
      }, // 4000 balance as of dec
    ],
  };
  const scale = 12;
  payload.transactions.reverse();
  console.log("output", calculateBalances(payload, scale));
  expect(calculateBalances(payload, scale)).toMatchObject({
    monthsData: ["дек", "янв", "фев", "мар"],
    balancesData: [5500, 7000, 6500, 5000],
    maxBalance: 7000,
    positiveTransBalances: [1500, 1500, 500, 1500],
    negativeTransBalances: [0, 0, 1000, 3000],
  });
});

// return {
//   monthsData,
//   balancesData,
//   maxBalance,
//   positiveTransBalances,
//   negativeTransBalances,
// };
