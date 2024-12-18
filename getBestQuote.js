const BalmySDK = require("@balmy/sdk");
const { JsonRpcProvider, parseUnits, formatUnits } = require("ethers");

// RPC Endpoint - Replace with your provider's URL
const RPC_ENDPOINT = "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID";

// Initialize Ethers Provider
const provider = new JsonRpcProvider(RPC_ENDPOINT);

// Initialize the Balmy SDK
const sdk = BalmySDK.buildSDK({
    provider,
    signer: null, // No signer needed
});

// Function to fetch the best quote
async function fetchBestQuote() {
    try {
        // Define the trade request details
        const tradeRequest = {
            chainId: 1, // Ethereum Mainnet
            sellToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC token address
            buyToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH token address
            order: {
                type: "sell", // Sell order
                sellAmount: parseUnits("100", 6), // Selling 100 USDC (6 decimals)
            },
            slippagePercentage: 1, // Allowable slippage (1%)
        };

        console.log("Fetching the best quote...");
        const bestQuote = await sdk.quoteService.getBestQuote({
            request: tradeRequest,
            config: {
                choose: { by: "most-swapped" }, // Sort by the best output amount
            },
        });

        if (!bestQuote) {
            console.error("No best quote found.");
            return;
        }

        // Display the best quote details
        console.log("\nBest Quote Found:");
        console.log(`  Source: ${bestQuote.source.name} (${bestQuote.source.id})`);
        console.log(`  Sell Amount: ${formatUnits(tradeRequest.order.sellAmount, 6)} USDC`);
        //console.log(`  Buy Amount: ${formatUnits(tradeRequest.order.buyAmount, 6)} USDC`);

        // Safely handle gas cost
        if (bestQuote.gas?.estimatedCost) {
            const gasCost = bestQuote.gas.estimatedCost.amount || bestQuote.gas.estimatedCost; // Extract amount
            console.log(`  Gas Cost: ${formatUnits(String(gasCost), 18)} ETH`);
            console.log(`  Gas Cost (USD): ${bestQuote.gas.estimatedCostInUSD || "N/A"} USD`);
        } else {
            console.log("  Gas Cost: N/A");
            console.log("  Gas Cost (USD): N/A");
        }
    } catch (error) {
        console.error("Error fetching the best quote:", error.message);
    }
}

// Run the function
fetchBestQuote();
