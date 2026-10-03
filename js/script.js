const transactionForm = document.querySelector("#transactionForm");
const itemNameInput = document.querySelector("#itemName");
const amountInput = document.querySelector("#amount");
const categorySelect = document.querySelector("#category");
const formError = document.querySelector("#formError");
const transactionList = document.querySelector("#transactionList");
const totalBalance = document.querySelector("#totalBalance");

const categoryForm = document.querySelector("#categoryForm");
const customCategoryInput = document.querySelector("#customCategory");
const categoryList = document.querySelector("#categoryList");

const limitForm = document.querySelector("#limitForm");
const limitInput = document.querySelector("#limitInput");
const limitDisplay = document.querySelector("#limitDisplay");
const limitWarning = document.querySelector("#limitWarning");

const sortSelect = document.querySelector("#sortSelect");

const monthSelect = document.querySelector("#monthSelect");
const monthlyTotal = document.querySelector("#monthlyTotal");
const monthlyTransactions = document.querySelector("#monthlyTransactions");
const summaryTotal = document.querySelector("#summaryTotal");
const summaryEntries = document.querySelector("#summaryEntries");

const themeToggle = document.querySelector("#themeToggle");
const themeIcon = document.querySelector("#themeIcon");

const chartCanvas = document.querySelector("#expenseChart");
const chartEmpty = document.querySelector("#chartEmpty");

const DEFAULT_CATEGORIES = ["Food", "Transport", "Fun"];

let transactions = loadData("transactions", []);
let customCategories = loadData("customCategories", []);
let spendingLimit = Number(localStorage.getItem("spendingLimit")) || 0;
let expenseChart = null;

function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        console.warn(`Could not read ${key} from localStorage.`, error);
        return fallback;
    }
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function formatCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(value);
}

function formatDate(date) {
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(new Date(date));
}

function makeMonthKey(date) {
    const value = new Date(date);
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(monthKey) {
    const [year, month] = monthKey.split("-");
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric"
    }).format(new Date(Number(year), Number(month) - 1, 1));
}

function getTotal(list = transactions) {
    return list.reduce((total, item) => total + item.amount, 0);
}

function saveTransactions() {
    saveData("transactions", transactions);
}

function saveCategories() {
    saveData("customCategories", customCategories);
}

function setError(message = "") {
    formError.textContent = message;
}

transactionForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = itemNameInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categorySelect.value;

    if (!name || !amount || !category) {
        setError("Please fill in the item name, amount, and category.");
        return;
    }

    if (amount <= 0) {
        setError("Amount must be greater than zero.");
        return;
    }

    const transaction = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        name,
        amount,
        category,
        date: new Date().toISOString()
    };

    transactions.push(transaction);
    saveTransactions();

    transactionForm.reset();
    setError("");

    refreshApp();
});

transactionList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-id]");

    if (!button) {
        return;
    }

    const id = button.dataset.deleteId;
    transactions = transactions.filter((item) => item.id !== id);

    saveTransactions();
    refreshApp();
});

sortSelect.addEventListener("change", renderTransactions);

function getSortedTransactions() {
    const sorted = [...transactions];

    switch (sortSelect.value) {
        case "oldest":
            return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));

        case "highest":
            return sorted.sort((a, b) => b.amount - a.amount);

        case "lowest":
            return sorted.sort((a, b) => a.amount - b.amount);

        case "category":
            return sorted.sort((a, b) => a.category.localeCompare(b.category));

        case "newest":
        default:
            return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
}

function renderTransactions() {
    transactionList.innerHTML = "";

    if (transactions.length === 0) {
        transactionList.innerHTML = `
            <div class="empty-state">
                No transactions yet. Add your first expense above.
            </div>
        `;
        return;
    }

    getSortedTransactions().forEach((transaction) => {
        const row = document.createElement("article");
        row.className = "transaction";

        row.innerHTML = `
            <div>
                <div class="transaction-name">${escapeHtml(transaction.name)}</div>
                <div class="transaction-meta">
                    ${escapeHtml(transaction.category)} · ${formatDate(transaction.date)}
                </div>
            </div>

            <div class="transaction-amount">
                ${formatCurrency(transaction.amount)}
            </div>

            <button
                class="delete-button"
                type="button"
                data-delete-id="${transaction.id}"
                aria-label="Delete ${escapeHtml(transaction.name)}"
            >
                Delete
            </button>
        `;

        transactionList.appendChild(row);
    });
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

function updateBalance() {
    const total = getTotal();
    totalBalance.textContent = formatCurrency(total);

    if (spendingLimit > 0 && total > spendingLimit) {
        limitWarning.classList.remove("hidden");
    } else {
        limitWarning.classList.add("hidden");
    }
}

categoryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const value = customCategoryInput.value.trim();

    if (!value) {
        return;
    }

    const alreadyExists = [...DEFAULT_CATEGORIES, ...customCategories]
        .some((category) => category.toLowerCase() === value.toLowerCase());

    if (alreadyExists) {
        customCategoryInput.focus();
        return;
    }

    customCategories.push(value);
    saveCategories();

    customCategoryInput.value = "";
    renderCategories();
});

function renderCategories() {
    [...categorySelect.options].forEach((option) => {
        if (option.dataset.custom === "true") {
            option.remove();
        }
    });

    customCategories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        option.dataset.custom = "true";
        categorySelect.appendChild(option);
    });

    categoryList.innerHTML = "";

    if (customCategories.length === 0) {
        categoryList.innerHTML = `
            <span class="category-tag">No custom categories yet</span>
        `;
        return;
    }

    customCategories.forEach((category) => {
        const tag = document.createElement("span");
        tag.className = "category-tag";
        tag.textContent = category;
        categoryList.appendChild(tag);
    });
}

limitForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const value = Number(limitInput.value);

    if (Number.isNaN(value) || value < 0) {
        return;
    }

    spendingLimit = value;
    localStorage.setItem("spendingLimit", String(spendingLimit));

    limitInput.value = "";
    renderLimit();
    updateBalance();
});

function renderLimit() {
    limitDisplay.textContent = formatCurrency(spendingLimit);
}

function getAvailableMonths() {
    const months = new Set(transactions.map((item) => makeMonthKey(item.date)));
    months.add(makeMonthKey(new Date()));

    return [...months].sort().reverse();
}

function renderMonthOptions() {
    const previousValue = monthSelect.value;
    const months = getAvailableMonths();

    monthSelect.innerHTML = "";

    months.forEach((month) => {
        const option = document.createElement("option");
        option.value = month;
        option.textContent = getMonthLabel(month);
        monthSelect.appendChild(option);
    });

    if (months.includes(previousValue)) {
        monthSelect.value = previousValue;
    }
}

monthSelect.addEventListener("change", renderMonthlySummary);

function renderMonthlySummary() {
    const selectedMonth = monthSelect.value;

    const monthlyData = transactions.filter(
        (item) => makeMonthKey(item.date) === selectedMonth
    );

    const total = getTotal(monthlyData);

    monthlyTotal.textContent = formatCurrency(total);
    monthlyTransactions.textContent = String(monthlyData.length);

    summaryTotal.textContent = formatCurrency(total);
    summaryEntries.textContent = String(monthlyData.length);
}

function updateChart() {
    const categoryTotals = {};

    transactions.forEach((item) => {
        categoryTotals[item.category] =
            (categoryTotals[item.category] || 0) + item.amount;
    });

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    if (expenseChart) {
        expenseChart.destroy();
        expenseChart = null;
    }

    if (labels.length === 0) {
        chartCanvas.classList.add("hidden");
        chartEmpty.classList.remove("hidden");
        return;
    }

    chartCanvas.classList.remove("hidden");
    chartEmpty.classList.add("hidden");

    const PALETTE = [
        "#6366f1", "#ef4444", "#f97316", "#f59e0b",
        "#10b981", "#3b82f6", "#a855f7", "#ec4899",
        "#14b8a6", "#84cc16", "#06b6d4", "#8b5cf6"
    ];

    const backgroundColors = labels.map((_, i) => PALETTE[i % PALETTE.length]);

    expenseChart = new Chart(chartCanvas, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: getComputedStyle(document.body)
                    .getPropertyValue("--card-bg")
                    .trim() || "#ffffff"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom"
                },
                tooltip: {
                    callbacks: {
                        label(context) {
                            return `${context.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
}

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");

    localStorage.setItem("darkMode", String(isDark));
    updateThemeIcon();
    updateChart();
});

function updateThemeIcon() {
    const isDark = document.body.classList.contains("dark");
    themeIcon.textContent = isDark ? "☀️" : "🌙";
}

function loadTheme() {
    const savedTheme = localStorage.getItem("darkMode") === "true";
    document.body.classList.toggle("dark", savedTheme);
    updateThemeIcon();
}

function refreshApp() {
    renderTransactions();
    renderCategories();
    renderLimit();
    updateBalance();
    renderMonthOptions();
    renderMonthlySummary();
    updateChart();
}

loadTheme();
refreshApp();
