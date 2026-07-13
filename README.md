# Titrate — Gen Chem Practice App

This is Stage 1: a real, deployed, mobile-friendly app you can share with a link.
No accounts, no payments yet — we add those in Stage 2 and 3 once this is live.

## What you need before starting
1. A free GitHub account: https://github.com/signup
2. A free Vercel account: https://vercel.com/signup (sign up with GitHub, it's one click)
3. An Anthropic API key: https://console.anthropic.com/settings/keys
   (Note: this is a PAID API — you'll be billed per question generated.
   Costs are small, roughly fractions of a cent per question, but keep an eye on usage
   under console.anthropic.com/settings/billing once you have real traffic.)

## Step 1 — Put this code on GitHub
1. Go to https://github.com/new and create a new repository (call it `titrate` or anything you like).
2. On your computer, open a terminal in this folder and run:
   ```
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```
   (Replace YOUR_GITHUB_REPO_URL with the URL GitHub shows you after creating the repo.)

## Step 2 — Deploy on Vercel
1. Go to https://vercel.com/new
2. Import the GitHub repo you just created.
3. Before clicking Deploy, expand "Environment Variables" and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from console.anthropic.com
4. Click Deploy. In about a minute you'll get a live URL like `titrate.vercel.app`.

That URL is now a real, shareable, mobile-friendly app. Send it to your friends and students.

## Step 3 — Test it
Open the URL on your phone. Pick a topic and difficulty, and try answering a question.

## What's NOT included yet (future stages)
- **Accounts/login** — right now anyone with the link can use it, no sign-up required.
  Good for sharing casually; needed before you can track individual student progress or gate paid content.
- **Payments** — no way to sell study materials yet. Stripe is the standard tool for this once you're ready.
- **A question bank / saved library** — right now every question is generated fresh each time and not stored.

Come back and ask for help with any of these next — each is a manageable next step,
not something you need to figure out all at once.
