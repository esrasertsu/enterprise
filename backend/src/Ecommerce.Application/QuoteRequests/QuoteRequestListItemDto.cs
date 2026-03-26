using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.QuoteRequests;

public sealed record QuoteRequestListItemDto(
    Guid Id,
    string FullName,
    string Email,
    string? CompanyName,
    string? ProductName,
    int? Quantity,
    QuoteRequestStatus Status,
    DateTime CreatedAt,
    DateTime? AdminNotificationSentAt);