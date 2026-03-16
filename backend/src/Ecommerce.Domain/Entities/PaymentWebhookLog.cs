using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities;

public class PaymentWebhookLog : BaseEntity
{
    public string Provider { get; set; } = null!;
    public string EventId { get; set; } = null!;
    public string EventType { get; set; } = null!;
    public string PayloadJson { get; set; } = null!;
    public bool Processed { get; set; } = false;
    public DateTime ReceivedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
}
