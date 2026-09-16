import re

with open("app/app/(marketing)/page.tsx", "r") as f:
    content = f.read()

# Replace widths
content = content.replace("max-w-5xl", "max-w-[1536px]")
content = content.replace("max-w-3xl", "max-w-[1536px]")
content = content.replace("max-w-4xl", "max-w-[1536px]")
content = content.replace("max-w-2xl", "max-w-3xl")

# Redesign Hero
content = content.replace("What is this asset<br />", "Real-Time Market Integrity<br />")
content = content.replace("actually worth?", "for Tokenized Equities.")
content = content.replace("text-5xl md:text-6xl font-bold tracking-tight leading-tight", "text-6xl md:text-8xl font-black tracking-tighter leading-none")
content = content.replace("Rello is market-integrity infrastructure for tokenized equities on", "Rello is the execution layer for on-chain price parity. Powered by Pyth Network and Solana.")
content = content.replace("Solana. It compares on-chain wrapped prices against real-world Pyth", "")
content = content.replace("feeds, detects drift, and autonomously corrects it — so pegged", "")
content = content.replace("assets stay pegged.", "")

# Simplify button container and redesign buttons for pyth-like look
content = content.replace("btn-3d inline-flex items-center px-7 py-3.5 bg-brand text-white rounded-lg font-medium", "inline-flex items-center px-8 py-4 bg-black text-white hover:bg-brand transition-colors rounded-full font-bold tracking-wide")
content = content.replace("btn-3d inline-flex items-center px-7 py-3.5 border border-black/10 rounded-lg font-medium", "inline-flex items-center px-8 py-4 bg-surface border border-black/10 hover:border-black/30 transition-colors rounded-full font-bold tracking-wide text-text")

# Make section titles bolder
content = content.replace("text-3xl font-bold mb-4", "text-4xl md:text-5xl font-black tracking-tight mb-4")
content = content.replace("text-lg font-bold mb-2", "text-xl font-bold tracking-tight mb-2")

# Pyth inspired tags
content = content.replace("bg-surface border border-black/5 rounded-xl p-6", "bg-surface border border-black/5 rounded-2xl p-8 hover:border-black/10 transition-colors shadow-sm")

with open("app/app/(marketing)/page.tsx", "w") as f:
    f.write(content)
