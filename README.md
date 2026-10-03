# 💸 Expense & Budget Visualizer

A simple, mobile-friendly web app for tracking daily spending. No installation, no account — open the file and start tracking.

---

## Getting Started

No build tools or server needed.

1. Clone or download this repository
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari)

```
project/
├── index.html        ← open this
├── css/
│   └── style.css
└── js/
    └── script.js
```

> All data is saved in your browser's **Local Storage**. Nothing leaves your device.

---

## How to Use

### 1. Adding a Transaction

Fill in the **Add transaction** form on the left:

| Field | Description |
|---|---|
| **Item name** | A short label, e.g. *Lunch*, *Bus fare* |
| **Amount** | The amount in IDR (whole numbers, e.g. `25000`) |
| **Category** | Pick from the dropdown — Food, Transport, Fun, or any custom category you've added |

Click **Add transaction**. The total spending card at the top updates immediately.

> All three fields are required. An error message will appear under the button if any field is left empty.

---

### 2. Viewing & Managing Transactions

The **Transactions** section shows a scrollable list of everything you've added.

- Each row displays the **item name**, **category**, **date**, and **amount**
- Click **Delete** on any row to remove that transaction

**Sorting** — use the dropdown in the top-right of the section to reorder:

| Option | Order |
|---|---|
| Newest | Most recent first (default) |
| Oldest | Oldest first |
| Highest amount | Largest spend first |
| Lowest amount | Smallest spend first |
| Category | Alphabetical by category name |

---

### 3. Setting a Spending Limit

In the **Spending limit** card:

1. Enter a monthly limit amount in the input field (e.g. `500000`)
2. Click **Save**

The current limit is displayed in the top balance card next to *Monthly limit*.

If your **total spending exceeds the limit**, a warning message appears:
> *You have gone over your spending limit.*

To remove the limit, set it to `0` and click **Save**.

---

### 4. Monthly Summary

The **Summary** card shows spending for a specific month.

- Use the **month dropdown** to select any month that has transactions (the current month is always included)
- It shows the **total amount spent** and the **number of transactions** for that month

---

### 5. Adding Custom Categories

By default the app has three categories: **Food**, **Transport**, and **Fun**.

To add your own:

1. Go to the **Custom categories** card
2. Type a category name (e.g. *Shopping*, *Health*)
3. Click **Add**

Your new category appears as a tag and is immediately available in the category dropdown when adding transactions. Custom categories are saved across sessions.

---

### 6. Spending Distribution Chart

The **Spending distribution** chart at the bottom shows a pie chart of all your expenses grouped by category.

- Each category gets its own colour slice
- Hover over a slice to see the category name and exact amount
- The chart updates automatically whenever you add or delete a transaction
- If there are no transactions yet, a placeholder message is shown instead

---

### 7. Dark / Light Mode

Click the **🌙** button in the top-right corner to switch to dark mode. Click **☀️** to switch back. Your preference is remembered on your next visit.

---

## Features at a Glance

| Feature | Details |
|---|---|
| Currency | Indonesian Rupiah (IDR) |
| Storage | Browser Local Storage — no account needed |
| Default categories | Food, Transport, Fun |
| Custom categories | Add unlimited custom categories |
| Sorting | By date, amount, or category |
| Spending limit | Warning shown when total exceeds limit |
| Monthly summary | Filter spending by month |
| Chart | Pie chart by category (Chart.js) |
| Dark mode | Toggle with persistent preference |
| Compatibility | Chrome, Firefox, Edge, Safari |
