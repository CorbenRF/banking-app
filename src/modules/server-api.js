export async function loginServer(login, password) {
  let user = { login: login, password: password };
  let query = null;
  try {
    query = await fetch("http://localhost:3000/login", {
      method: "POST",
      // login,
      // password,
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(user),
    });
  } catch (error) {
    console.log(error);
  }
  if (query) {
    return await query.json();
  }
  // const response = await query.json();
  return { error: "Connection error occured" };
}

export async function accountsServer(token, addressPostfix) {
  let query = null;
  try {
    query = await fetch(`http://localhost:3000${addressPostfix}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Basic ${token}`,
      },
    });
  } catch (error) {
    console.log(error);
  }
  if (query) {
    return await query.json();
  }
}

export async function newAccountServer(token) {
  let query = null;
  try {
    query = await fetch("http://localhost:3000/create-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Basic ${token}`,
      },
    });
  } catch (error) {
    console.log(error);
  }
  if (query) {
    return await query.json();
  }
}

export async function ownCurrenciesServer(token) {
  let query = null;
  try {
    query = await fetch("http://localhost:3000/currencies", {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Basic ${token}`,
      },
    });
  } catch (error) {
    console.log(error);
  }
  if (query) {
    return await query.json();
  }
}

export async function allCurrenciesServer(token) {
  let query = null;
  try {
    query = await fetch("http://localhost:3000/all-currencies", {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Basic ${token}`,
      },
    });
  } catch (error) {
    console.log(error);
  }
  if (query) {
    return await query.json();
  }
}

export async function exchangeCurrenciesServer(from, to, amount, token) {
  let query = null;
  try {
    query = await fetch("http://localhost:3000/currency-buy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Basic ${token}`,
      },
      body: JSON.stringify({ from, to, amount }),
    });
  } catch (error) {
    console.log(error);
  }
  if (query) {
    return await query.json();
  }
}

export async function locationsServer(token) {
  let query = null;
  try {
    query = await fetch("http://localhost:3000/banks", {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Basic ${token}`,
      },
    });
  } catch (error) {
    console.log(error);
  }
  if (query) {
    return await query.json();
  }
}

export async function transferFundsServer(
  token,
  accountFrom,
  receiverAccNumber,
  sumToTransfer
) {
  let query = null;
  const info = {
    from: accountFrom,
    to: receiverAccNumber,
    amount: sumToTransfer,
  };
  try {
    query = await fetch("http://localhost:3000/transfer-funds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Basic ${token}`,
      },
      body: JSON.stringify(info),
    });
  } catch (error) {
    console.log(error);
  }
  if (query) {
    return await query.json();
  }
}
