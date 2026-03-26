using Ecommerce.Domain.Common;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Domain.Entities;

public class QuoteRequest : BaseEntity
{
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string? CompanyName { get; set; }
    public string? ProductName { get; set; }
    public int? Quantity { get; set; }
    public string? Notes { get; set; }
    public QuoteRequestStatus Status { get; set; } = QuoteRequestStatus.New;
    public DateTime? AdminNotificationSentAt { get; set; }
}