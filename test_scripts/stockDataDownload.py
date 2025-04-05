import yfinance as yf

# Define the stock symbol and period
ticker = "AAPL"  # You can use 'MSFT', 'TSLA', 'GOOGL' , 'AAPL', 'AMZN'  etc.
data = yf.download(ticker, start="2020-01-01", end="2025-04-05")

# Preview the data
print(data.head())

# Save to CSV
data.to_csv("data/stock/prophet/AAPL_stock.csv")


ticker = "MSFT"  # You can use 'MSFT', 'TSLA', 'GOOGL' , 'AAPL', 'AMZN'  etc.
data = yf.download(ticker, start="2020-01-01", end="2025-04-05")

# Preview the data
print(data.head())

# Save to CSV
data.to_csv("data/stock/prophet/MSFT_stock.csv")




ticker = "GOOGL"  # You can use 'MSFT', 'TSLA', 'GOOGL' , 'AAPL', 'AMZN'  etc.
data = yf.download(ticker, start="2020-01-01", end="2025-04-05")

# Preview the data
print(data.head())

# Save to CSV
data.to_csv("data/stock/prophet/GOOGL_stock.csv")




ticker = "AMZN"  # You can use 'MSFT', 'TSLA', 'GOOGL' , 'AAPL', 'AMZN'  etc.
data = yf.download(ticker, start="2020-01-01", end="2025-04-05")

# Preview the data
print(data.head())

# Save to CSV
data.to_csv("data/stock/prophet/AMZN_stock.csv")




ticker = "TSLA"  # You can use 'MSFT', 'TSLA', 'GOOGL' , 'AAPL', 'AMZN'  etc.
data = yf.download(ticker, start="2020-01-01", end="2025-04-05")

# Preview the data
print(data.head())

# Save to CSV
data.to_csv("data/stock/prophet/TSLA_stock.csv")