const BalmySDK = require("@balmy/sdk");
const { JsonRpcProvider, parseUnits, formatUnits } = require("ethers");

// RPC Endpoint
const RPC_ENDPOINT = "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID";

// Initialize Ethers Provider
const provider = new JsonRpcProvider(RPC_ENDPOINT);

// Initialize the Balmy SDK
const sdk = BalmySDK.buildSDK({
    provider,
    signer: null, // No signer needed
});

// Function to fetch and display sorted quotes
async function fetchAllQuotes() {
    try {
        // Define trade details
        const tradeRequest = {
            chainId: 1, // Ethereum Mainnet
            sellToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC token address
            buyToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH token address
            order: {
                type: "sell",
                sellAmount: parseUnits("100", 6), // Sell 100 USDC (6 decimals)
            },
            slippagePercentage: 1, // 1% allowable slippage
        };

        console.log("Fetching all quotes...");
        const allQuotes = await sdk.quoteService.getAllQuotes({
            request: tradeRequest,
            config: {
                sort: {
                    by: "most-swapped", // Sort quotes by the best output amount
                },
                ignoredFailed: false, // Include failed quotes
            },
        });

        if (!allQuotes || allQuotes.length === 0) {
            console.error("No quotes found.");
            return;
        }

        // Display top quotes sorted by the best return
        console.log("Top Quotes Sorted by Best Return:");
        allQuotes.forEach((quote, index) => {
            console.log(`\nQuote #${index + 1}:`);
            console.log(quote);
        });
    } catch (error) {
        console.error("Error fetching quotes:", error.message);
    }
}

// Run the function
fetchAllQuotes();