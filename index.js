const BalmySDK = require("@balmy/sdk"); // Import Balmy SDK
const { JsonRpcProvider, parseUnits, formatUnits, formatEther } = require("ethers");

// RPC Endpoint (replace with your Infura or RPC provider URL)
const RPC_ENDPOINT = "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID";

// Initialize the provider
const provider = new JsonRpcProvider(RPC_ENDPOINT);

// Initialize the SDK using the correct function name 'buildSDK'
const sdk = BalmySDK.buildSDK({
    provider,
    signer: null, // No signer needed since we are not sending transactions
});

// Function to fetch and display sorted trade quotes
async function fetchSortedQuotes() {
    try {
        // Define trade details
        const tradeRequest = {
            chainId: 1, // Ethereum Mainnet (Chain ID)
            sellToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC token address
            buyToken: "0x0000000000000000000000000000000000000000", // WETH token address
            order: {
                type: "sell", // Sell order
                sellAmount: parseUnits("1000", 6), // Selling 1000 USDC (6 decimals)
            },
            slippagePercentage: 1, // Allowable slippage (1%)
        };

        console.log("Fetching trade quotes...");
        const allQuotes = await sdk.quoteService.getAllQuotesWithTxs({
            request: tradeRequest,
            config: {
                sort: {
                    by: "most-swapped-accounting-for-gas", // Sort by best return considering gas
                },
            },
        });

        console.log("Raw API Response:", allQuotes);

        if (!allQuotes || allQuotes.length === 0) {
            console.error("No quotes found for the specified trade.");
            return;
        }

        console.log("Top 5 Quotes Sorted by Best Return:");
        allQuotes.slice(0, 5).forEach((quote, index) => {
            console.log(`\nQuote #${index + 1}:`);
            console.log(`  Aggregator: ${quote.aggregator}`);
            console.log(`  Buy Amount: ${formatUnits(quote.buyAmount, 18)} WETH`);
            console.log(`  Gas Fee: ${formatEther(quote.gasCost)} ETH`);
            console.log(`  Total Cost (Gas + Sell Token): ${formatEther(quote.totalCost)} ETH`);
        });
    } catch (error) {
        console.error("Error fetching quotes:", error.message);
    }
}

// Run the function
fetchSortedQuotes();
