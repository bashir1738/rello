"use client";

import { useState, useEffect, useCallback } from "react";
import { ASSETS, type AssetSymbol } from "@/lib/constants";

interface WalletState {
  connected: boolean;
  publicKey: string | null;
  balance: number;
}

interface SwapQuote {
  inAmount: number;
  outAmount: number;
  priceImpact: number;
  route: string;
}

export default function TradePage() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    publicKey: null,
    balance: 0,
  });
  const [fromAsset, setFromAsset] = useState<AssetSymbol>("AAPL");
  const [toAsset, setToAsset] = useState<string>("USDC");
  const [amount, setAmount] = useState<string>("1");
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [txResult, setTxResult] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    try {
      const provider = (window as any).solana;
      if (!provider?.isPhantom) {
        alert("Please install Phantom wallet");
        return;
      }
      const resp = await provider.connect();
      const balance = await fetch(
        `https://api.mainnet-beta.solana.com`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getBalance",
            params: [resp.publicKey.toString()],
          }),
        }
      );
      const balanceData = await balance.json();
      setWallet({
        connected: true,
        publicKey: resp.publicKey.toString(),
        balance: (balanceData.result?.value ?? 0) / 1e9,
      });
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      const provider = (window as any).solana;
      await provider?.disconnect();
      setWallet({ connected: false, publicKey: null, balance: 0 });
    } catch {
      setWallet({ connected: false, publicKey: null, balance: 0 });
    }
  }, []);

  useEffect(() => {
    const provider = (window as any).solana;
    if (provider?.isPhantom && provider.isConnected) {
      provider.publicKey.then((pk: any) => {
        if (pk) {
          setWallet({
            connected: true,
            publicKey: pk.toString(),
            balance: 0,
          });
        }
      });
    }
  }, []);

  async function getQuote() {
    setIsQuoting(true);
    try {
      const res = await fetch("/api/swap/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAsset,
          toAsset,
          amount: parseFloat(amount),
        }),
      });
      const data = await res.json();
      setQuote(data);
    } catch {
      setQuote(null);
    } finally {
      setIsQuoting(false);
    }
  }

  async function executeSwap() {
    if (!wallet.connected) {
      await connectWallet();
      return;
    }

    setIsSwapping(true);
    setTxResult(null);

    try {
      const res = await fetch("/api/swap/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAsset,
          toAsset,
          amount: parseFloat(amount),
          wallet: wallet.publicKey,
        }),
      });
      const data = await res.json();

      if (data.txSignature) {
        setTxResult(`Success! Tx: ${data.txSignature}`);
      } else {
        setTxResult(`Error: ${data.error}`);
      }
    } catch {
      setTxResult("Failed to execute swap");
    } finally {
      setIsSwapping(false);
    }
  }

  const assets = Object.values(ASSETS);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 perspective">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold">Trade</h1>
        <p className="text-text-muted text-sm mt-1">
          Swap tokenized equities via Meteora DBC pools
        </p>
      </div>

      {/* Wallet connection */}
      <div className="bg-surface border border-white/10 rounded-xl p-4 mb-6 animate-fade-in-up delay-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${wallet.connected ? "bg-healthy animate-pulse" : "bg-text-muted"}`} />
            <span className="text-sm font-mono">
              {wallet.connected
                ? `${wallet.publicKey?.slice(0, 4)}...${wallet.publicKey?.slice(-4)}`
                : "Not connected"}
            </span>
            {wallet.connected && (
              <span className="text-xs text-text-muted font-mono">
                {wallet.balance.toFixed(4)} SOL
              </span>
            )}
          </div>
          <button
            onClick={wallet.connected ? disconnectWallet : connectWallet}
            className="btn-3d text-sm px-4 py-1.5 rounded-lg border border-white/10 hover:border-brand"
          >
            {wallet.connected ? "Disconnect" : "Connect Wallet"}
          </button>
        </div>
      </div>

      {/* Swap widget */}
      <div className="bg-surface border border-white/10 rounded-xl p-6 animate-fade-in-up delay-2">
        {/* From */}
        <div className="mb-4">
          <label className="text-xs text-text-muted font-mono uppercase tracking-wider mb-2 block">
            From
          </label>
          <div className="flex gap-3">
            <select
              value={fromAsset}
              onChange={(e) => setFromAsset(e.target.value as AssetSymbol)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-brand"
            >
              {assets.map((a) => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-brand"
              placeholder="Amount"
            />
          </div>
        </div>

        {/* Swap direction */}
        <div className="flex justify-center my-2">
          <button
            onClick={() => {
              setToAsset(fromAsset);
              setFromAsset(toAsset === "USDC" ? "AAPL" : toAsset as AssetSymbol);
            }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-text-muted">
              <path d="M8 2a.5.5 0 01.5.5v5h5a.5.5 0 010 1h-5v5a.5.5 0 01-1 0v-5h-5a.5.5 0 010-1h5v-5A.5.5 0 018 2z" />
            </svg>
          </button>
        </div>

        {/* To */}
        <div className="mb-6">
          <label className="text-xs text-text-muted font-mono uppercase tracking-wider mb-2 block">
            To
          </label>
          <div className="flex gap-3">
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-text-muted flex-shrink-0">
              {toAsset}
            </div>
            <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono">
              {quote ? `$${quote.outAmount.toFixed(2)}` : "—"}
            </div>
          </div>
        </div>

        {/* Quote info */}
        {quote && (
          <div className="bg-white/5 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Price Impact</span>
              <span className={`font-mono ${Math.abs(quote.priceImpact) < 1 ? "text-healthy" : Math.abs(quote.priceImpact) < 3 ? "text-warning" : "text-critical"}`}>
                {quote.priceImpact.toFixed(3)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Route</span>
              <span className="font-mono text-xs">{quote.route}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={getQuote}
            disabled={isQuoting || !amount || parseFloat(amount) <= 0}
            className="flex-1 btn-3d border border-white/20 rounded-xl py-3 font-medium text-sm disabled:opacity-50"
          >
            {isQuoting ? "Getting Quote..." : "Get Quote"}
          </button>
          <button
            onClick={executeSwap}
            disabled={isSwapping || !quote}
            className="flex-1 btn-3d bg-brand text-white rounded-xl py-3 font-medium text-sm disabled:opacity-50"
          >
            {isSwapping
              ? "Swapping..."
              : wallet.connected
                ? "Swap"
                : "Connect & Swap"}
          </button>
        </div>

        {txResult && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-mono ${txResult.startsWith("Success") ? "bg-healthy/10 text-healthy" : "bg-critical/10 text-critical"}`}>
            {txResult}
          </div>
        )}
      </div>

      {/* Pool info */}
      <div className="mt-6 bg-surface border border-white/10 rounded-xl p-6 animate-fade-in-up delay-3">
        <h3 className="text-sm font-bold mb-3">Meteora DBC Pool</h3>
        <p className="text-xs text-text-muted leading-relaxed">
          Swaps are routed through Meteora Dynamic Bonding Curve pools. Equity-tuned
          curves use asymmetric fees — lower near peg, higher when drifted — to
          incentivize market makers to restore peg alignment.
        </p>
        <a
          href="/pools"
          className="text-xs text-brand font-mono mt-3 inline-block hover:underline"
        >
          Configure Pool →
        </a>
      </div>
    </div>
  );
}
