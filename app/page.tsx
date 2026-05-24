"use client";
import {
  Package,
  Warehouse,
  Boxes,
  Clock3,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { useEffect, useState } from "react";

export default function Home() {

  const [products, setProducts] =
    useState<any[]>([]);

  const [reservation, setReservation] =
    useState<any>(null);

  const [history, setHistory] =
  useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");
  
  const [timeLeft, setTimeLeft] =
    useState("");

  const [lastUpdated, setLastUpdated] =
  useState("");

  async function fetchProducts() {

    const res = await fetch(
      "/api/products"
    );

    const data = await res.json();

    setProducts(data);
    setLastUpdated(
  new Date().toLocaleTimeString()
);
  }

 useEffect(() => {
  fetchProducts();
}, []);

useEffect(() => {

  const interval = setInterval(() => {
    fetchProducts();
  }, 5000);

  return () => clearInterval(interval);

}, []);

  useEffect(() => {

  if (!reservation) return;

  const interval = setInterval(() => {

    const now =
      new Date().getTime();

    const expiry =
      new Date(
        reservation.expiresAt
      ).getTime();

    const distance =
      expiry - now;

    if (distance <= 0) {
      setReservation(null);
fetchProducts();

      setTimeLeft(
        "Expired"
      );

      clearInterval(interval);

      return;
    }

    const minutes =
      Math.floor(
        distance / 1000 / 60
      );

    const seconds =
      Math.floor(
        (distance / 1000) % 60
      );

    setTimeLeft(
      `${minutes}:${
        seconds < 10
          ? "0"
          : ""
      }${seconds}`
    );

  }, 1000);

  return () =>
    clearInterval(interval);

}, [reservation]);

  async function reserve(
    inventoryId: string
  ) {

    setLoading(true);

    setMessage("");

    const res = await fetch(
      "/api/reservations",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          inventoryId,
          quantity: 1,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error);
      setLoading(false);
      return;
    }

    setReservation(data.reservation);

    setMessage(
      "Reservation successful"
    );
    setTimeout(() => {
  setMessage("");
}, 3000);

    fetchProducts();

    setLoading(false);
  }

  const totalStock = products.reduce(
    (acc, item) => acc + item.available,
    0
  );
 

async function confirmReservation() {

  if (!reservation?.id) return;

  const res = await fetch(
    "/api/confirm",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        id: reservation.id,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {

    setMessage(data.error);

    return;
  }

  setMessage(
    "Purchase confirmed successfully"
  );

  setTimeout(() => {
  setMessage("");
}, 3000);

  setReservation(
    data.reservation
  );

  setHistory((prev) => [
  data.reservation,
  ...prev,
]);

  setTimeout(() => {
  setReservation(null);
}, 3000);

  fetchProducts();
}

async function cancelReservation() {

  if (!reservation?.id) return;

  const res = await fetch(
    "/api/release",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        id: reservation.id,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {

    setMessage(data.error);

    return;
  }

  setMessage(
    "Reservation cancelled"
  );
  setTimeout(() => {
  setMessage("");
}, 3000);
  setHistory((prev) => [
  {
    ...reservation,
    status: "RELEASED",
  },
  ...prev,
]);

  setReservation(null);

  fetchProducts();
}
  return (

    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-sky-100 to-cyan-100">

      {/* NAVBAR */}

      <nav className="bg-white/80 backdrop-blur-md border-b border-white/40 shadow-sm">

        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-700 to-cyan-600 bg-clip-text text-transparent">
              Allo Inventory
            </h1>

          </div>

          <div className="flex gap-8 text-gray-700 font-semibold">

          <a
  href="#dashboard"
  className="hover:text-indigo-600 cursor-pointer"
>
  Dashboard
</a>

           <a
  href="#inventory"
  className="hover:text-indigo-600 cursor-pointer"
>
  Inventory
</a>

           <a
  href="#reservations"
  className="hover:text-indigo-600 cursor-pointer"
>
  Reservations
</a>

          </div>

        </div>

      </nav>

      <div className="max-w-7xl mx-auto p-10">

       {/* HEADER */}

<div id="dashboard" className="mb-12">

  <h1 className="text-6xl font-extrabold text-gray-900 leading-tight">
    Inventory Reservation
    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-cyan-600">
      Management Platform
    </span>
  </h1>

  <p className="mt-5 text-xl text-gray-700">
    Real-time stock reservation system for multi-warehouse commerce.
  </p>

  <p className="text-sm text-gray-500 mt-4">
    Last updated:
    {" "}
    <span className="font-semibold">
      {lastUpdated}
    </span>
  </p>

</div>

{/* STATS */}
 
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">

       <div className="bg-white rounded-3xl p-6 shadow-xl flex items-center justify-between">

  <div>

    <p className="text-gray-500 font-semibold">
      Products
    </p>

    <h2 className="text-4xl font-bold mt-3 text-indigo-700">
      {products.length}
    </h2>

  </div>

  <Package
    size={42}
    className="text-indigo-600"
  />

</div>
<div className="bg-white rounded-3xl p-6 shadow-xl flex items-center justify-between">

  <div>

    <p className="text-gray-500 font-semibold">
      Warehouses
    </p>

    <h2 className="text-4xl font-bold mt-3 text-cyan-600">
      1
    </h2>

  </div>

  <Warehouse
    size={42}
    className="text-cyan-600"
  />

</div>
<div className="bg-white rounded-3xl p-6 shadow-xl flex items-center justify-between">

  <div>

    <p className="text-gray-500 font-semibold">
      Available Stock
    </p>

    <h2 className="text-4xl font-bold mt-3 text-emerald-600">
      {totalStock}
    </h2>

  </div>

  <Boxes
    size={42}
    className="text-emerald-600"
  />

</div>
<div className="bg-white rounded-3xl p-6 shadow-xl flex items-center justify-between">

  <div>

    <p className="text-gray-500 font-semibold">
      Active Reservations
    </p>

    <h2 className="text-4xl font-bold mt-3 text-pink-600">
      {reservation ? 1 : 0}
    </h2>

  </div>

  <Clock3
    size={42}
    className="text-pink-600"
  />

</div>
</div>
        {/* MESSAGE */}

        {message && (

          <div className="mb-8 bg-white rounded-2xl shadow-lg p-5 border-l-8 border-indigo-600">

            <p className="text-lg font-semibold text-indigo-700">
              {message}
            </p>

          </div>

        )}

      {/* ACTIVE RESERVATION */}

<div id="reservations">

  {reservation && (

    <div className="mb-12 bg-gradient-to-r from-indigo-700 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl">

      <h2 className="text-3xl font-bold mb-6">
        Active Reservation
      </h2>

      <div className="grid md:grid-cols-2 gap-5 text-lg">

        <p>
          Reservation ID:
          {" "}
          <span className="font-bold text-cyan-200">
            {reservation.id}
          </span>
        </p>

        <p>
          Quantity:
          {" "}
          <span className="font-bold">
            {reservation.quantity}
          </span>
        </p>

        <p>
          Status:
          {" "}
          <span
  className={`px-3 py-1 rounded-full text-sm font-bold ${
    reservation.status === "CONFIRMED"
      ? "bg-green-300 text-black"
      : reservation.status === "RELEASED"
      ? "bg-red-300 text-black"
      : "bg-yellow-300 text-black"
  }`}
>
  {reservation.status}
</span>
        </p>

        {reservation.status === "PENDING" && (
          <p>
            Time Remaining:
            {" "}
            <span className="font-bold text-yellow-300 text-2xl">
              {timeLeft}
            </span>
          </p>
        )}

      </div>

      {/* BUTTONS */}

<div className="flex gap-4 mt-8">

  <button
    disabled={
      reservation.status === "CONFIRMED"
    }
    onClick={confirmReservation}
    className={`px-6 py-3 rounded-xl font-bold transition ${
      reservation.status === "CONFIRMED"
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-500 hover:bg-green-600"
    }`}
  >
    Confirm Purchase
  </button>

  <button
    onClick={cancelReservation}
    className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-xl font-bold transition text-white"
  >
    Cancel Reservation
  </button>


      </div>

    </div>

  )}

</div>
        {/* PRODUCT SECTION */}

        {/* RESERVATION HISTORY */}

{history.length > 0 && (

  <div className="mb-12">

    <h2 className="text-3xl font-bold text-gray-900 mb-6">
      Reservation History
    </h2>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

      {history.map((item, index) => (

        <div
          key={index}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >

          <p className="text-sm text-gray-500 mb-2">
            Reservation ID
          </p>

          <p className="font-bold text-indigo-700 break-all">
            {item.id}
          </p>

          <p className="mt-4">
            Quantity:
            {" "}
            <span className="font-bold">
              {item.quantity}
            </span>
          </p>

          <p className="mt-2">
            Status:
            {" "}
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                item.status === "CONFIRMED"
                  ? "bg-green-300 text-black"
                  : "bg-red-300 text-black"
              }`}
            >
              {item.status}
            </span>
          </p>

        </div>

      ))}

    </div>

  </div>

)}

       <div className="flex items-center justify-between mb-8">

  <h2 className="text-3xl font-bold text-gray-900">
    Inventory
  </h2>

  <div className="flex gap-3">

   <button
  onClick={() => {
    fetchProducts();
    setMessage(
      "Inventory refreshed"
    );
  }}
  className="bg-white px-5 py-2 rounded-full shadow font-semibold text-gray-700 hover:bg-indigo-50 transition"
>
  Refresh Inventory
</button>

   <button
  onClick={() => {
    document
      .getElementById("inventory")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }}
  className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-5 py-2 rounded-full shadow font-semibold hover:scale-105 transition"
>
  Live Inventory
</button>

  </div>

</div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {products.map((item) => (

              <div
                key={item.inventoryId}
                className="bg-white/80 backdrop-blur-md rounded-3xl p-7 shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300 border border-white"
              >

                <div className="flex items-center justify-between mb-6">

                  <h2 className="text-3xl font-bold text-gray-900">
                    {item.product}
                  </h2>

                  <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold">
                    LIVE
                  </span>

                </div>

                <div className="space-y-4 text-lg">

                  <p className="text-gray-700">

                    <span className="font-bold text-gray-900">
                      Warehouse:
                    </span>

                    {" "}
                    {item.warehouse}

                  </p>

                  <p className="text-gray-700">

                    <span className="font-bold text-gray-900">
                      Available:
                    </span>

                    {" "}

                    <span className="text-emerald-600 font-extrabold text-2xl">
                      {item.available}
                    </span>

                  </p>

                </div>

                <button
  disabled={
    loading ||
    item.available === 0
  }
  onClick={() =>
    reserve(item.inventoryId)
  }
  className={`w-full mt-8 py-4 rounded-2xl font-bold text-lg transition duration-300 ${
    loading
      ? "bg-gray-400 text-white cursor-not-allowed"
      : item.available === 0
      ? "bg-red-400 text-white cursor-not-allowed"
      : "bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 hover:scale-105 text-white shadow-lg"
  }`}
>

  {
    loading
      ? "Processing..."
      : item.available === 0
      ? "Out of Stock"
      : "Reserve Now"
  }

</button>

              </div>

            ))}

          </div>

{/* INVENTORY ANALYTICS */}

<div className="bg-white rounded-3xl p-8 shadow-xl mt-16">

  <h2 className="text-3xl font-bold mb-8 text-gray-900">
    Inventory Analytics
  </h2>

  <div className="h-80">

    <ResponsiveContainer width="100%" height="100%">

      <BarChart
        data={products}
        margin={{
          top: 20,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="product" />

        <YAxis />

        <Tooltip />

        <Bar
          dataKey="available"
          fill="#4f46e5"
          radius={[10, 10, 0, 0]}
          barSize={80}
        />

      </BarChart>

    </ResponsiveContainer>

  </div>

</div>

</div>
      {/* FOOTER */}

      <footer className="mt-20 bg-white/70 backdrop-blur-md border-t border-white/40">

        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">

          <p className="text-gray-700 font-medium">
            Built with Next.js + Prisma + Supabase
          </p>

          <p className="text-indigo-700 font-bold">
            Allo Engineering Assessment
          </p>

        </div>

      </footer>

    </div>

  );
}

       