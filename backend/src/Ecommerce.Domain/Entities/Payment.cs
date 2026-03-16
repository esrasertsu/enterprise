using Ecommerce.Domain.Common;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Domain.Entities;

public class Payment : BaseEntity
{
    public Guid OrderId { get; set; }
    public string Provider { get; set; } = "Stripe";
    public string? ProviderPaymentIntentId { get; set; }
    public string? ProviderSessionId { get; set; }
    public string? ProviderEventId { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = "EUR";
    public string? RawResponseJson { get; set; }
    public DateTime? PaidAt { get; set; }

    public string? ProviderChargeId { get; set; }
    public string? ProviderCustomerId { get; set; }
    public string? IdempotencyKey { get; set; }

    public decimal AuthorizedAmount { get; set; }
    public decimal CapturedAmount { get; set; }
    public decimal RefundedAmount { get; set; }

    public string? FailureCode { get; set; }
    public string? FailureMessage { get; set; }

    public string? PaymentMethodType { get; set; }
    public string? PaymentMethodBrand { get; set; }
    public string? PaymentMethodLast4 { get; set; }

    public string? ReceiptUrl { get; set; }
    public DateTime? FailedAt { get; set; }
    public DateTime? RefundedAt { get; set; }

    public string? ProviderRefundId { get; set; } // tek refund modeli için
    public string? MetadataJson { get; set; }     // internal metadata snapshot

    public Order Order { get; set; } = null!;
}