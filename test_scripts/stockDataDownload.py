import yfinance as yf

# Define the stock symbol and period
ticker = "AAPL"  # You can use 'MSFT', 'TSLA', etc.
data = yf.download(ticker, start="2020-01-01", end="2025-01-31")

# Preview the data
print(data.head())

# Save to CSV
data.to_csv("AAPL_stock.csv")
