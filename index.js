import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

// ExchangeRate API configuration
const API_URL = "https://v6.exchangerate-api.com/v6/";
const API_KEY = "d26a07c07f2ea339f571a8b0";

// Serve static files (CSS, JS, images) from "public" folder
app.use(express.static("public"));

// Parse form data (urlencoded) from POST requests
app.use(bodyParser.urlencoded({ extended: true }));

// ---------------------- ROUTES ----------------------

// GET "/" → Show initial converter page with available currencies
app.get("/", async (req, res) => {
  try {
    // Fetch list of all supported currencies from CurrencyFreaks API
    const response = await axios.get(
      "https://api.currencyfreaks.com/v2.0/supported-currencies"
    );

    // Convert object of currencies into an array for looping in EJS
    const avalCurrencies = Object.values(response.data.supportedCurrenciesMap);

    // Render index.ejs with:
    // - Empty conversion data initially
    // - All available currencies for dropdowns
    res.render("index.ejs", { data: {}, currencies: avalCurrencies });
  } catch (error) {
    console.error("Error fetching supported currencies:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// POST "/convert" → Handle form submission when user converts
app.post("/convert", async (req, res) => {
  // Extract form input values
  const baseCurrency = req.body.fromCurrency; // Currency to convert from
  const targetCurrency = req.body.toCurrency; // Currency to convert to
  const amount = req.body.fromAmount; // Amount entered by user

  try {
    // Call ExchangeRate API to convert base → target with given amount
    const result = await axios.get(
      `${API_URL}${API_KEY}/pair/${baseCurrency}/${targetCurrency}/${amount}`
    );

    // Fetch supported currencies again for re-rendering dropdowns
    const response = await axios.get(
      "https://api.currencyfreaks.com/v2.0/supported-currencies"
    );
    const avalCurrencies = Object.values(response.data.supportedCurrenciesMap);

    // Debug log conversion result in terminal
    console.log(result.data);

    // Render index.ejs with:
    // - Conversion result (so EJS can show the converted value)
    // - Currencies for dropdowns
    res.render("index.ejs", { data: result.data, currencies: avalCurrencies });
  } catch (error) {
    console.error(
      "Error during conversion:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Conversion failed");
  }
});

// ---------------------- START SERVER ----------------------
app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});
