using System.Globalization;

namespace CSPriceUpdater.Extensions;

public static class SteamPriceExtensions
{
    /// <summary>
    /// Tries to parse a Steam price string (e.g. "12,17€" or "$5.25") into a decimal.
    /// </summary>
    /// <param name="price">The price string returned by Steam</param>
    /// <param name="value">The parsed decimal value</param>
    /// <returns>True if parsing succeeded, otherwise false</returns>
    public static bool TryParseSteamPrice(this string? price, out decimal value)
    {
        value = 0;

        if (string.IsNullOrWhiteSpace(price))
            return false;

        // Remove common currency symbols and spaces
        var cleaned = price
            .Replace("€", "")
            .Replace("$", "")
            .Replace("£", "")
            .Replace("RUB", "")
            .Trim();

        // Normalize decimal separator (e.g. 12,17 → 12.17)
        cleaned = cleaned.Replace(',', '.');

        return decimal.TryParse(
            cleaned,
            NumberStyles.AllowDecimalPoint | NumberStyles.AllowThousands,
            CultureInfo.InvariantCulture,
            out value
        );
    }
}