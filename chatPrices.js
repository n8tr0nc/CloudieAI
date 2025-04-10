// chatPrices.js
async function fetchTokenPrices() {
    // Define the token mint addresses
    const tokens = {
        SOL: "So11111111111111111111111111111111111111112",
        CLOUD: "CLoUDKc4Ane7HeQcPpE3YHnznRxhMimJ4MyaUqyHFzAu",
        INF: "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm"
    };

    // Define icon URLs
    const tokenIcons = {
        SOL: "https://cloudie.so/wp-content/uploads/2025/03/sol003.webp",
        CLOUD: "https://cloudie.so/wp-content/uploads/2025/03/cloud003.webp",
        INF: "https://cloudie.so/wp-content/uploads/2025/03/inf003.webp"
    };

    // Define CoinGecko URLs
    const tokenLinks = {
        SOL: "https://jup.ag/tokens/So11111111111111111111111111111111111111112",
        CLOUD: "https://jup.ag/tokens/CLoUDKc4Ane7HeQcPpE3YHnznRxhMimJ4MyaUqyHFzAu",
        INF: "https://jup.ag/tokens/5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm"
    };

    // Construct the API URL
    const ids = Object.values(tokens).join(",");
    const url = `https://api.jup.ag/price/v2?ids=${ids}`;

    try {
        // Fetch the price data
        const response = await fetch(url);
        const data = await response.json();

        // Update the display
        let priceDisplay = "";
        for (const [tokenName, mintAddress] of Object.entries(tokens)) {
        const price = data.data[mintAddress]?.price;
        const formattedPrice = price !== undefined && price !== null ? Number(price).toFixed(4) : "Not available";
        priceDisplay += `<a href="${tokenLinks[tokenName]}" target="_blank" rel="noopener noreferrer"><img src="${tokenIcons[tokenName]}" alt="${tokenName}" class="token-icon"> <span class="current-price">$${formattedPrice}</span></a>  `;
        }
        document.getElementById("prices").innerHTML = priceDisplay.trim();
        document.getElementById("prices").classList.remove("loading");
    } catch (error) {
        console.error("Error fetching prices:", error);
        document.getElementById("prices").innerHTML = "Error fetching prices. Retrying in 5 minutes...";
    }
}

// Initial fetch
fetchTokenPrices();

// Update every 5 minutes (300,000 ms)
setInterval(fetchTokenPrices, 300000);