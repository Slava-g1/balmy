const BalmySDK = require("@balmy/sdk");
const { JsonRpcProvider, parseUnits, formatUnits } = require("ethers");
const fs = require("fs");
const path = require("path");

// Custom logging to capture output in JSON
const outputLog = {
    successfulQuotes: [],
    failedQuotes: [],
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

// Function to fetch and display quotes
async function fetchAllQuotes() {
    try {
        const tradeRequest = {
            chainId: 1,
            sellToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
            buyToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
            order: {
                type: "sell",
                sellAmount: parseUnits("100", 6),
            },
            slippagePercentage: 1, // 1% allowable slippage
        };

        console.log("Fetching all quotes (including failed responses)...");

        const allQuotes = await sdk.quoteService.getAllQuotes({
            request: tradeRequest,
            config: {
                sort: { by: "most-swapped" },
                ignoredFailed: false, // Include failed quotes
            },
        });

        allQuotes.forEach((quote) => {
            if (quote.failed) {
                outputLog.failedQuotes.push({
                    source: quote.source?.name || "Unknown",
                    id: quote.source?.id || "N/A",
                    error: quote.error || "Unknown error",
                    duration: quote.duration || "Unknown",
                });
            } else {
                outputLog.successfulQuotes.push({
                    source: quote.source?.name || "Unknown",
                    id: quote.source?.id || "N/A",
                    sellAmount: `${formatUnits(tradeRequest.order.sellAmount, 6)} USDC`,
                    gasCost: quote.gas?.estimatedCost
                        ? `${formatUnits(String(quote.gas.estimatedCost), 18)} ETH`
                        : "N/A",
                    gasCostUSD: quote.gas?.estimatedCostInUSD || "N/A",
                    duration: quote.duration || "Unknown",
                });
            }
        });

        console.log("\n✅ Fetching completed. Saving logs...");
    } catch (error) {
        console.error("Error fetching quotes:", error.message);
        outputLog.failedQuotes.push({
            source: "Unknown",
            error: error.message,
        });
    } finally {
        try {
            const filePath = path.resolve(__dirname, "outputLogs.json");
            fs.writeFileSync(filePath, JSON.stringify(outputLog, null, 2));
            console.log(`📝 Logs saved to ${filePath}`);
        } catch (writeError) {
            console.error("Error saving logs to file:", writeError.message);
        }
    }
}

// Run the function
fetchAllQuotes();
