import Layout from "../Components/layout/Layout";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [userId, setUserId] = useState(() => {
  return Number(localStorage.getItem("userId")) || 1;
});
  const [stocks, setStocks] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [prevValue, setPrevValue] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [newStock, setNewStock] = useState({
    stock: "",
    quantity: "",
  });

  // FETCH
useEffect(() => {
  const fetchData = () => {
    fetch(`${import.meta.env.VITE_API_URL}/portfolio?user_id=${userId}`)
      .then((res) => res.json())
      .then((res) => {
        setData({
          ...res,
          holdings: res.holdings || []
        });

        setStocks(res.allStocks || []);

        localStorage.setItem(
          `portfolioData_${userId}`,
          JSON.stringify(res)
        );
      });
  };

  //  call immediately
  fetchData();

  // auto refresh every 5 sec
  const interval = setInterval(fetchData, 5000);

  // cleanup
  return () => clearInterval(interval);

}, [userId]);

  // LIVE UPDATE
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        if (!prev || !prev.holdings) return prev;

        const updated = prev.holdings.map((item) => {
          const change =
            item.current_price * (Math.random() * 0.05 - 0.025);

          return {
            ...item,
            current_price: Number(
              (item.current_price + change).toFixed(2)
            ),
          };
        });

        // GRAPH DATA
        setPriceHistory((prevHist) => {
          const time = new Date().toLocaleTimeString();
          const snapshot = { time };

          updated.forEach((s) => {
            snapshot[s.stock] = s.current_price;
          });

          return [...prevHist.slice(-20), snapshot];
        });

        // AI COMMENTARY
        

const enriched = updated.map((s) => {
  const profit = s.quantity * (s.current_price - s.buy_price);
  const profitPercent =
    ((s.current_price - s.buy_price) / s.buy_price) * 100;
  const value = s.quantity * s.current_price;

  return { ...s, profit, profitPercent, value };
});

const totalValue = enriched.reduce((s, i) => s + i.value, 0);
let dropRisk = false;

if (prevValue !== null) {
  const dropPercent = ((totalValue - prevValue) / prevValue) * 100;

  if (dropPercent < -3) {
    dropRisk = true;
  }
}

setPrevValue(totalValue);

const expectedWeight = 100 / enriched.length;

const driftAlerts = enriched.filter((s) => {
  const actualWeight = (s.value / totalValue) * 100;
  return Math.abs(actualWeight - expectedWeight) > 5;
});


const totalProfit = enriched.reduce((s, i) => s + i.profit, 0);

const suggestions = enriched.map((s) => {
  let action = "HOLD";
  let reason = "";
  let confidence = 60;

  if (s.profitPercent > 8) {
    action = "SELL";
    reason = "Strong gains, profit booking opportunity";
    confidence = 80;
  } else if (s.profitPercent < -5) {
    action = "SELL";
    reason = "Consistent loss, reducing risk advised";
    confidence = 75;
  } else if (s.profitPercent >= -2 && s.profitPercent <= 2) {
    action = "BUY";
    reason = "Near base price, accumulation opportunity";
    confidence = 70;
  } else {
    action = "HOLD";
    reason = "Stable performance, monitor trend";
    confidence = 65;
  }

  return {
    stock: s.stock,
    action,
    reason,
    confidence,
    weight: ((s.value / totalValue) * 100).toFixed(1),
  };
});

const topBuy = suggestions.find((s) => s.action === "BUY");
const topSell = suggestions.find((s) => s.action === "SELL");
const topHold = suggestions.find((s) => s.action === "HOLD");

let risk = "Low";

if (dropRisk) {
  risk = "High";
} else {
  const maxWeight = Math.max(
    ...suggestions.map((s) => Number(s.weight))
  );

  if (maxWeight > 50) risk = "High";
  else if (maxWeight > 30) risk = "Medium";
  else risk = "Low";
}

if (suggestions.length === 1) {

  const s = suggestions[0];

  if (s.profitPercent < -5) risk = "High";
  else if (s.profitPercent < 2) risk = "Medium";
  else risk = "Low";

} else {
  const maxWeight = Math.max(
    ...suggestions.map((s) => Number(s.weight))
  );

  if (maxWeight > 50) risk = "High";
  else if (maxWeight > 30) risk = "Medium";
  else risk = "Low";
}

const driftText =
  driftAlerts.length > 0
    ? `⚠️ Allocation Drift: ${driftAlerts.map(s => s.stock).join(", ")}`
    : "No allocation drift";

const dropText = dropRisk
  ? "🚨 Portfolio dropped more than 3%"
  : "No major drop";

// FINAL AI OUTPUT
const aiText = `
📊 Portfolio Summary:
Total Value: ₹${totalValue.toFixed(2)}

⚠️ Risk Level: ${risk}

${driftText}
${dropText}

📈 BUY:
${topBuy ? `${topBuy.stock} → ${topBuy.reason} (${topBuy.confidence}% confidence)` : "No strong buy signal"}

📉 SELL:
${topSell ? `${topSell.stock} → ${topSell.reason} (${topSell.confidence}% confidence)` : "No strong sell signal"}

📊 HOLD:
${topHold ? `${topHold.stock} → ${topHold.reason}` : "Monitor all stocks"}

💡 Strategy:
- Rebalance high-weight stocks
- Book profits on strong performers
- Accumulate stable stocks near base price
`;

        const newState = { ...prev, holdings: updated, aiReport: aiText };
        localStorage.setItem(
  `portfolioData_${userId}`,
  JSON.stringify(newState)
);
        return newState;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // CALCULATIONS
  const totalValue = data?.holdings?.reduce(
    (sum, i) => sum + i.quantity * i.current_price,
    0
  );

  const totalProfit = data?.holdings?.reduce(
    (sum, i) =>
      sum + i.quantity * (i.current_price - i.buy_price),
    0
  );

  const allocation =
    data?.holdings?.map((i) => ({
      name: i.stock,
      value: i.quantity * i.current_price,
    })) || [];

  // ADD
const addStock = () => {
  console.log("CLICKED", newStock);

  if (!newStock.stock || !newStock.quantity) {
    console.log("BLOCKED ❌");
    return;
  }

  console.log("SENDING POST ✅");

  const price = Math.floor(Math.random() * 500) + 200;

  fetch(`${import.meta.env.VITE_API_URL}/portfolio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      stock: newStock.stock,
      quantity: Number(newStock.quantity),
      buy_price: price,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("DONE ✅", data);
    });
};

  // REMOVE
const removeStock = (item) => {
  console.log("DELETE CLICK:", item);

  fetch(`${import.meta.env.VITE_API_URL}/portfolio`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      stock: item.stock,
    }),
  })
    .then(res => res.json())
    .then(data => console.log("DELETE RESPONSE:", data))
    .catch(err => console.error("DELETE ERROR:", err));
};;

  // QTY
const reduceQuantity = (item) => {
  if (item.quantity === 1) {
    // CALL DELETE
    fetch(`${import.meta.env.VITE_API_URL}/portfolio`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        stock: item.stock,
      }),
    }).then(() => {
      setHoldings((prev) =>
        prev.filter((h) => h.stock !== item.stock)
      );
    });

    return;
  }

  // NORMAL DECREASE
  const newQty = item.quantity - 1;

  fetch(`${import.meta.env.VITE_API_URL}/portfolio`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      stock: item.stock,
      quantity: newQty,
    }),
  }).then(() => {
    setHoldings((prev) =>
      prev.map((h) =>
        h.stock === item.stock
          ? { ...h, quantity: newQty }
          : h
      )
    );
  });
};



const increaseQuantity = (item) => {
  const newQty = item.quantity + 1;

  fetch(`${import.meta.env.VITE_API_URL}/portfolio`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      stock: item.stock,
      quantity: newQty,
    }),
  }).then(() => {
    setHoldings((prev) =>
      prev.map((h) =>
        h.stock === item.stock
          ? { ...h, quantity: newQty }
          : h
      )
    );
  });
};

  if (!data) return <div>Loading...</div>;

  return (
    <Layout>
      {/* USER */}
      <select
        value={userId}
        onChange={(e) => setUserId(Number(e.target.value))}
        className="mb-4 p-2 bg-slate-700 rounded"
      >
        {[...Array(125)].map((_, i) => (
          <option key={i}>{i + 1}</option>
        ))}
      </select>

      {/* ADD STOCK */}
      <div className="flex gap-3 mb-6 bg-slate-800 p-4 rounded-xl shadow">
        <select
  value={newStock.stock}
  onChange={(e) =>
    setNewStock({ ...newStock, stock: e.target.value })
  }
  className="p-2 bg-slate-700 rounded"
>
  <option value="" disabled>
    Select Stock
  </option>

  {stocks?.map((s, i) => (
    <option key={i} value={s}>
      {s}
    </option>
  ))}
</select>

        <input
          type="number"
          placeholder="Qty"
          value={newStock.quantity}
          onChange={(e) =>
            setNewStock({
              ...newStock,
              quantity: e.target.value,
            })
          }
          className="p-2 bg-slate-700 rounded"
        />

        <button
          onClick={addStock}
          className="bg-blue-500 px-4 rounded"
        >
          Add
        </button>
      </div>
      {/* 🚨 ALERT BANNER */}
      {data?.risk === "High" && (
        <div className="bg-red-600 text-white p-3 rounded-lg mb-4 shadow-lg">
          ⚠️ High Risk Detected! Immediate action required.
        </div>
      )}

      {data?.risk === "Medium" && (
        <div className="bg-yellow-500 text-black p-3 rounded-lg mb-4 shadow-lg">
          ⚠️ Medium Risk – Monitor your portfolio.
        </div>
      )}
      {/* SUMMARY */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-600 p-4 rounded-xl shadow">
          <p className="text-sm">Portfolio Value</p>
          ₹{totalValue?.toFixed(2)}
        </div>

        <div
          className={`p-4 rounded-xl shadow ${
            data.risk === "High"
              ? "bg-red-600"
              : data.risk === "Medium"
              ? "bg-yellow-500"
              : "bg-green-600"
          }`}
        >
          <p className="text-sm">Risk</p>
          {data.risk}
        </div>

        <div className="bg-slate-800 p-4 rounded-xl shadow">
          <p className="text-sm">Last Alert</p>
          {new Date().toLocaleString()}
        </div>

        <div
          className={`p-4 rounded-xl shadow ${
            totalProfit >= 0 ? "bg-green-600" : "bg-red-600"
          }`}
        >
          <p className="text-sm">Profit</p>
          ₹{totalProfit?.toFixed(2)}
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-800 p-4 rounded-xl">
          <h3>📈 Stock Prices</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={priceHistory}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              {Object.keys(priceHistory[0] || {})
                .filter((k) => k !== "time")
                .map((key, i) => (
                  <Line
                    key={i}
                    dataKey={key}
                    stroke={`hsl(${i * 60},70%,60%)`}
                    dot={false}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl">
          <h3>🥧 Allocation</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={allocation}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                innerRadius={60}
              >
                {allocation.map((_, i) => (
                  <Cell
                    key={i}
                    fill={`hsl(${i * 60},70%,60%)`}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLE */}
      <div className="mt-6">
  <h3 className="mb-3 text-gray-300 font-semibold">
    📊 Holdings
  </h3>

  <div className="bg-slate-900 p-3 rounded-xl shadow-inner">
    <table className="w-full border-separate border-spacing-y-3 text-center">
      
      {/* HEADER */}
      <thead>
        <tr className="text-gray-400 text-sm sticky top-0">
          <th className="py-2">Stock</th>
          <th>Qty</th>
          <th>Buy</th>
          <th>Current</th>
          <th>Profit</th>
          <th>Action</th>
        </tr>
      </thead>

      {/* BODY */}
      <tbody>
        {data?.holdings?.map((item, i) => {
          const profit =
            item.quantity *
            (item.current_price - item.buy_price);

          return (
            <tr
              key={i}
              className="bg-slate-800 hover:bg-slate-700 transition rounded-xl shadow-md"
            >
              {/* STOCK */}
              <td className="font-semibold">{item.stock}</td>

              {/* QUANTITY CONTROLS */}
              <td>
                <div className="flex justify-center items-center gap-2 bg-slate-700 px-2 py-1 rounded-lg w-fit mx-auto">
                  <button
                    onClick={() => reduceQuantity(item)}
                    className="bg-red-500 hover:bg-red-600 px-2 rounded text-white font-bold"
                  >
                    −
                  </button>

                  <span className="px-2 font-semibold">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => increaseQuantity(item)}
                    className="bg-green-500 hover:bg-green-600 px-2 rounded text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </td>

              {/* BUY */}
              <td className="text-gray-300">
                ₹{item.buy_price}
              </td>

              {/* CURRENT */}
              <td className="text-blue-400 font-semibold">
                ₹{item.current_price}
              </td>

              {/* PROFIT */}
              <td
                className={`font-bold ${
                  profit >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                ₹{profit.toFixed(2)}
              </td>

              {/* REMOVE */}
              <td>
                <button
                  onClick={() => removeStock(item)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-white shadow"
                >
                  Remove
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>

      {/* AI */}
      <div className="bg-slate-800 p-4 rounded mt-6">
        <h3>AI Commentary</h3>
        <pre>{data.aiReport}</pre>
      </div>
    </Layout>
  );
};

export default Dashboard;