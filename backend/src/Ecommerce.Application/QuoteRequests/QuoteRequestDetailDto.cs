using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.QuoteRequests;

public sealed record QuoteRequestDetailDto(
    Guid Id,
    string FullName,
    string Email,
    string? Phone,
    string? CompanyName,
    string? ProductName,
    int? Quantity,
    string? Notes,
    QuoteRequestStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? AdminNotificationSentAt);