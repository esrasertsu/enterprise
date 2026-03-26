namespace Ecommerce.Application.QuoteRequests;

public sealed class SubmitQuoteRequestCommand
{
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? CompanyName { get; init; }
    public string? ProductName { get; init; }
    public int? Quantity { get; init; }
    public string? Notes { get; init; }
}