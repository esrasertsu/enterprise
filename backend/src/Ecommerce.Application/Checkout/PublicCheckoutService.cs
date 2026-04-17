using System.Text.Json;
using Ecommerce.Application.Abstractions.Persistence;
using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Checkout;

public sealed class PublicCheckoutService
{
    private const decimal DefaultShippingExclVat = 0m;
    private const string LuxembourgCountryCode = "LU";

    private static readonly JsonSerializerOptions SnapshotJsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = false,
    };

    private readonly IAppDbContext _dbContext;

    public PublicCheckoutService(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<CheckoutPreviewDto> PreviewAsync(CheckoutPreviewCommand command, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        var cart = await LoadCartAsync(command.SessionId, cancellationToken);
        ValidateCheckoutCommand(command, cart);

        return MapPreview(cart, NormalizeEmail(command.Email), command.NeedsDesignSupport);
    }

    public async Task<CreatedOrderDto> CreateOrderAsync(CreateOrderFromCheckoutCommand command, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        var cart = await LoadCartAsync(command.SessionId, cancellationToken);
        ValidateCheckoutCommand(command, cart);

        var normalizedEmail = NormalizeEmail(command.Email);
        var billingAddress = NormalizeAddress(command.BillingAddress, nameof(command.BillingAddress));
        var shippingAddress = ResolveShippingAddress(
            billingAddress,
            command.ShippingAddress,
            command.UseBillingAsShippingAddress,
            nameof(command.ShippingAddress));
        var now = DateTime.UtcNow;

        var order = new Order
        {
            OrderNumber = await GenerateOrderNumberAsync(now, cancellationToken),
            GuestEmail = normalizedEmail,
            BillingAddressSnapshotJson = JsonSerializer.Serialize(billingAddress, SnapshotJsonOptions),
            ShippingAddressSnapshotJson = JsonSerializer.Serialize(shippingAddress, SnapshotJsonOptions),
            CurrencyCode = cart.CurrencyCode,
            SubtotalExclVat = cart.SubtotalExclVat,
            DiscountExclVat = cart.DiscountExclVat,
            ShippingExclVat = DefaultShippingExclVat,
            VatTotal = cart.VatTotal,
            GrandTotal = RoundMoney(cart.GrandTotal + DefaultShippingExclVat),
            VatNumber = NormalizeOptional(command.VatNumber),
            CouponCode = cart.CouponCodeSnapshot,
            CouponId = cart.CouponId,
            NeedsDesignSupport = command.NeedsDesignSupport,
            CustomerNote = NormalizeOptional(command.CustomerNote),
            CreatedAt = now,
            UpdatedAt = now,
            Items = cart.Items
                .OrderBy(item => item.CreatedAt)
                .Select(item => new OrderItem
                {
                    ProductId = item.ProductId,
                    ProductVariantId = item.ProductVariantId,
                    Sku = item.Sku,
                    ProductNameSnapshot = item.ProductNameSnapshot,
                    VariantDescriptionSnapshot = item.VariantDescriptionSnapshot,
                    Quantity = item.Quantity,
                    UnitPriceExclVat = item.UnitPriceExclVat,
                    VatRate = item.VatRate,
                    DiscountExclVat = item.DiscountExclVat,
                    LineTotalExclVat = item.LineTotalExclVat,
                    LineVatTotal = item.LineVatTotal,
                    LineGrandTotal = item.LineGrandTotal,
                    CreatedAt = now,
                    UpdatedAt = now,
                })
                .ToList(),
        };

        _dbContext.Orders.Add(order);

        cart.ConvertedToOrderId = order.Id;
        cart.SessionId = BuildConvertedCartSessionId(cart.SessionId, order.Id);
        cart.ExpiresAt = now;
        cart.UpdatedAt = now;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new CreatedOrderDto(
            order.Id,
            order.OrderNumber,
            order.CurrencyCode,
            order.SubtotalExclVat,
            order.DiscountExclVat,
            order.ShippingExclVat,
            order.VatTotal,
            order.GrandTotal,
            order.OrderStatus,
            order.PaymentStatus,
            order.FulfillmentStatus,
            order.CreatedAt);
    }

    private async Task<Cart> LoadCartAsync(string sessionId, CancellationToken cancellationToken)
    {
        var normalizedSessionId = NormalizeSessionId(sessionId);

        var cart = await _dbContext.Carts
            .Include(x => x.Items)
                .ThenInclude(x => x.Product)
            .Include(x => x.Items)
                .ThenInclude(x => x.ProductVariant)
            .FirstOrDefaultAsync(
                x => x.SessionId == normalizedSessionId && x.ConvertedToOrderId == null,
                cancellationToken);

        if (cart is null)
        {
            throw new InvalidOperationException("Cart was not found.");
        }

        return cart;
    }

    private static void ValidateCheckoutCommand(CheckoutPreviewCommand command, Cart cart)
    {
        ValidateCheckoutCommand(
            command.Email,
            command.BillingAddress,
            command.ShippingAddress,
            command.UseBillingAsShippingAddress,
            cart);
    }

    private static void ValidateCheckoutCommand(CreateOrderFromCheckoutCommand command, Cart cart)
    {
        ValidateCheckoutCommand(
            command.Email,
            command.BillingAddress,
            command.ShippingAddress,
            command.UseBillingAsShippingAddress,
            cart);
    }

    private static void ValidateCheckoutCommand(
        string email,
        CheckoutAddressInput billingAddress,
        CheckoutAddressInput? shippingAddress,
        bool useBillingAsShippingAddress,
        Cart cart)
    {
        _ = NormalizeEmail(email);
        var normalizedBillingAddress = NormalizeAddress(billingAddress, nameof(billingAddress));
        _ = ResolveShippingAddress(normalizedBillingAddress, shippingAddress, useBillingAsShippingAddress, nameof(shippingAddress));
        ValidateCart(cart);
    }

    private static void ValidateCart(Cart cart)
    {
        if (cart.Items.Count == 0)
        {
            throw new InvalidOperationException("Cart is empty.");
        }

        if (cart.Items.Any(item => item.Quantity <= 0))
        {
            throw new InvalidOperationException("Cart contains invalid item quantities.");
        }
    }

    private static CheckoutPreviewDto MapPreview(Cart cart, string email, bool needsDesignSupport)
    {
        return new CheckoutPreviewDto(
            cart.Id,
            cart.SessionId ?? string.Empty,
            email,
            cart.CurrencyCode,
            cart.Items.Sum(item => item.Quantity),
            cart.SubtotalExclVat,
            cart.DiscountExclVat,
            DefaultShippingExclVat,
            cart.VatTotal,
            RoundMoney(cart.GrandTotal + DefaultShippingExclVat),
            cart.CouponCodeSnapshot,
            needsDesignSupport,
            cart.Items
                .OrderBy(item => item.CreatedAt)
                .Select(item => new CheckoutPreviewItemDto(
                    item.Id,
                    item.ProductId,
                    item.ProductVariantId,
                    item.Product.Slug,
                    item.ProductNameSnapshot,
                    item.Sku,
                    item.VariantDescriptionSnapshot,
                    item.Quantity,
                    item.UnitPriceExclVat,
                    item.VatRate,
                    item.LineTotalExclVat,
                    item.LineVatTotal,
                    item.LineGrandTotal))
                .ToList());
    }

    private async Task<string> GenerateOrderNumberAsync(DateTime now, CancellationToken cancellationToken)
    {
        var datePrefix = now.ToString("yyyyMMdd");
        var existingCount = await _dbContext.Orders.CountAsync(
            order => order.CreatedAt >= now.Date && order.CreatedAt < now.Date.AddDays(1),
            cancellationToken);

        return $"ORD-{datePrefix}-{existingCount + 1:D4}";
    }

    private static NormalizedCheckoutAddress NormalizeAddress(CheckoutAddressInput? address, string fieldName)
    {
        if (address is null)
        {
            throw new InvalidOperationException($"{fieldName} is required.");
        }

        var contactName = RequireValue(address.ContactName, $"{fieldName}.contactName");
        var line1 = RequireValue(address.Line1, $"{fieldName}.line1");
        var postalCode = RequireValue(address.PostalCode, $"{fieldName}.postalCode");
        var city = RequireValue(address.City, $"{fieldName}.city");
        var countryCode = RequireValue(address.CountryCode, $"{fieldName}.countryCode").ToUpperInvariant();

        if (countryCode.Length != 2)
        {
            throw new InvalidOperationException($"{fieldName}.countryCode must be a 2-letter ISO code.");
        }

        return new NormalizedCheckoutAddress(
            contactName,
            NormalizeOptional(address.CompanyName),
            line1,
            NormalizeOptional(address.Line2),
            postalCode,
            city,
            NormalizeOptional(address.State),
            countryCode,
            NormalizeOptional(address.Phone));
    }

    private static NormalizedCheckoutAddress ResolveShippingAddress(
        NormalizedCheckoutAddress billingAddress,
        CheckoutAddressInput? shippingAddress,
        bool useBillingAsShippingAddress,
        string shippingFieldName)
    {
        var normalizedShippingAddress = useBillingAsShippingAddress
            ? billingAddress
            : NormalizeAddress(shippingAddress, shippingFieldName);

        if (!string.Equals(normalizedShippingAddress.CountryCode, LuxembourgCountryCode, StringComparison.Ordinal))
        {
            throw new InvalidOperationException($"Shipping address countryCode must be {LuxembourgCountryCode}.");
        }

        return normalizedShippingAddress;
    }

    private static string NormalizeEmail(string? email)
    {
        var normalizedEmail = RequireValue(email, "email");

        if (!normalizedEmail.Contains('@', StringComparison.Ordinal))
        {
            throw new InvalidOperationException("email is invalid.");
        }

        return normalizedEmail;
    }

    private static string NormalizeSessionId(string? sessionId)
    {
        return RequireValue(sessionId, "sessionId");
    }

    private static string RequireValue(string? value, string fieldName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException($"{fieldName} is required.");
        }

        return value.Trim();
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static decimal RoundMoney(decimal value)
    {
        return Math.Round(value, 2, MidpointRounding.AwayFromZero);
    }

    private static string BuildConvertedCartSessionId(string? sessionId, Guid orderId)
    {
        var baseSessionId = string.IsNullOrWhiteSpace(sessionId) ? "converted-cart" : sessionId.Trim();
        var convertedSessionId = $"{baseSessionId}::converted::{orderId:N}";

        return convertedSessionId.Length <= 255
            ? convertedSessionId
            : convertedSessionId[..255];
    }

    private sealed record NormalizedCheckoutAddress(
        string ContactName,
        string? CompanyName,
        string Line1,
        string? Line2,
        string PostalCode,
        string City,
        string? State,
        string CountryCode,
        string? Phone);
}