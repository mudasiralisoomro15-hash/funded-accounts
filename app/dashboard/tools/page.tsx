"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { PageHeader } from "@/components/dashboard/ui";

const PRESETS = [
  { id: "fx", label: "Forex majors (USD quote)", unit: "pips", pipValue: 10 },
  { id: "xau", label: "XAUUSD (gold)", unit: "$ move", pipValue: 100 },
  { id: "custom", label: "Custom", unit: "points", pipValue: 10 },
];

const num = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export default function ToolsPage() {
  const [balance, setBalance] = useState("10000");
  const [risk, setRisk] = useState("1");
  const [stop, setStop] = useState("20");
  const [presetId, setPresetId] = useState("fx");
  const [pipValue, setPipValue] = useState("10");

  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const riskUsd = (num(balance) * num(risk)) / 100;
  const perLot = num(stop) * num(pipValue);
  const lots = perLot > 0 ? riskUsd / perLot : 0;

  return (
    <>
      <PageHeader title="Tools" subtitle="Handy calculators for your trading." />

      <section className="dash-card max-w-2xl p-5">
        <h2 className="dash-text flex items-center gap-2 font-semibold">
          <Calculator className="dash-primary-text h-5 w-5" /> Position size calculator
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="dash-sub mb-1.5 block text-xs font-medium">Instrument</span>
            <select
              className="dash-input"
              value={presetId}
              onChange={(e) => {
                const p = PRESETS.find((x) => x.id === e.target.value) ?? PRESETS[0];
                setPresetId(p.id);
                setPipValue(String(p.pipValue));
              }}
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="dash-sub mb-1.5 block text-xs font-medium">Value per {preset.unit} per 1 lot ($)</span>
            <input className="dash-input" inputMode="decimal" value={pipValue} onChange={(e) => setPipValue(e.target.value)} />
          </label>
          <label className="block">
            <span className="dash-sub mb-1.5 block text-xs font-medium">Account balance ($)</span>
            <input className="dash-input" inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} />
          </label>
          <label className="block">
            <span className="dash-sub mb-1.5 block text-xs font-medium">Risk per trade (%)</span>
            <input className="dash-input" inputMode="decimal" value={risk} onChange={(e) => setRisk(e.target.value)} />
          </label>
          <label className="block sm:col-span-2">
            <span className="dash-sub mb-1.5 block text-xs font-medium">Stop loss ({preset.unit})</span>
            <input className="dash-input" inputMode="decimal" value={stop} onChange={(e) => setStop(e.target.value)} />
          </label>
        </div>

        <div className="dash-soft mt-5 grid grid-cols-2 gap-4 rounded-lg p-4">
          <div>
            <p className="dash-sub text-xs">Amount at risk</p>
            <p className="dash-text text-xl font-bold">${riskUsd.toFixed(2)}</p>
          </div>
          <div>
            <p className="dash-sub text-xs">Position size</p>
            <p className="dash-primary-text text-xl font-bold">{lots.toFixed(2)} lots</p>
          </div>
        </div>
        <p className="dash-sub mt-3 text-xs">
          Estimate only. Check the contract size and pip value of your instrument in MetaTrader before trading.
        </p>
      </section>
    </>
  );
}
