const BalmySDK = require("@balmy/sdk");
const { JsonRpcProvider, parseUnits, formatUnits } = require("ethers");

// Override fetch to log requests and response times
const originalFetch = global.fetch;

global.fetch = async (url, options) => {
    const startTime = new Date();
    console.log(`🟡 API Request: ${options?.method || "GET"} ${url}`);

    try {
        const response = await originalFetch(url, options);
        const duration = new Date() - startTime;
        console.log(`🟢 API Response: ${url} - ${response.status} - ${duration} ms`);
        return response;
    } catch (error) {
        const duration = new Date() - startTime;
        console.error(`🔴 API Error: ${url} - ${duration} ms - ${error.message}`);
        throw error;
    }
};

// RPC Endpoint
const RPC_ENDPOINT = "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID";

// Initialize Ethers Provider
const provider = new JsonRpcProvider(RPC_ENDPOINT);

// Initialize the Balmy SDK
const sdk = BalmySDK.buildSDK({
    provider,
    signer: null, // No signer needed
});

// Function to fetch and display sorted quotes, including failed responses
async function fetchAllQuotes() {
    try {
        const tradeRequest = {
            chainId: 1,
            sellToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            buyToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            order: {
                type: "sell",
                sellAmount: parseUnits("100", 6),
            },
            slippagePercentage: 1,
        };

        console.log("Fetching all quotes (including failed responses)...");

        const allQuotes = await sdk.quoteService.getAllQuotes({
            request: tradeRequest,
            config: {
                sort: { by: "most-swapped" },
                ignoredFailed: false, // Include failed quotes
            },
        });

        if (!allQuotes || allQuotes.length === 0) {
            console.error("No quotes found.");
            return;
        }

        const successfulQuotes = allQuotes.filter((quote) => !quote.failed);
        const failedQuotes = allQuotes.filter((quote) => quote.failed);

        console.log("\n✅ Top Successful Quotes:");
        successfulQuotes.forEach((quote, index) => {
            console.log(`\nQuote #${index + 1}:`);
            console.log(`  Source: ${quote.source?.name || "Unknown"} (${quote.source?.id || "N/A"})`);
            console.log(`  Sell Amount: ${formatUnits(tradeRequest.order.sellAmount, 6)} USDC`);
        });

        console.log("\n❌ Failed Quotes:");
        failedQuotes.forEach((quote, index) => {
            console.log(`\nFailed Quote #${index + 1}:`);
            console.log(`  Source: ${quote.source?.name || "Unknown"} (${quote.source?.id || "N/A"})`);
            console.log(`  Error: ${quote.error || "Unknown error"}`);
        });
    } catch (error) {
        console.error("Error fetching quotes:", error.message);
    }
}

// Run the function
fetchAllQuotes();
