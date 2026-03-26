using Ecommerce.Application.Abstractions.Persistence;
using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Carts;

public sealed class PublicCartService
{
    private static readonly TimeSpan CartLifetime = TimeSpan.FromDays(30);

    private readonly IAppDbContext _dbContext;

    public PublicCartService(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PublicCartDto> GetAsync(
        string sessionId,
        string? languageCode,
        CancellationToken cancellationToken = default)
    {
        var normalizedSessionId = NormalizeSessionId(sessionId);
        var normalizedLanguageCode = NormalizeLanguageCode(languageCode);

        var cart = await LoadCartAsync(normalizedSessionId, asNoTracking: true, cancellationToken);

        return cart is null
            ? CreateEmptyCart(normalizedSessionId)
            : MapCart(cart, normalizedLanguageCode);
    }

    public async Task<PublicCartDto> AddItemAsync(AddCartItemCommand command, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        var normalizedSessionId = NormalizeSessionId(command.SessionId);
        var normalizedLanguageCode = NormalizeLanguageCode(command.LanguageCode);

        if (command.Quantity <= 0)
        {
            throw new InvalidOperationException("Quantity must be greater than zero.");
        }

        var product = await _dbContext.Products
            .Include(x => x.Translations)
            .Include(x => x.Images)
            .Include(x => x.Variants)
            .FirstOrDefaultAsync(
                x => x.Id == command.ProductId && x.IsActive,
                cancellationToken);

        if (product is null)
        {
            throw new InvalidOperationException("Product was not found.");
        }

        var variant = product.Variants.FirstOrDefault(x => x.Id == command.ProductVariantId && x.IsActive);

        if (variant is null)
        {
            throw new InvalidOperationException("Product variant was not found.");
        }

        var cart = await LoadCartAsync(normalizedSessionId, asNoTracking: false, cancellationToken);
        var isNewCart = cart is null;
        cart ??= CreateCart(normalizedSessionId, "EUR");

        if (isNewCart)
        {
            _dbContext.Carts.Add(cart);
        }

        var existingItem = cart.Items.FirstOrDefault(x => x.ProductVariantId == variant.Id);
        var nextQuantity = (existingItem?.Quantity ?? 0) + command.Quantity;

        ValidateQuantity(product, nextQuantity);

        if (existingItem is null)
        {
            existingItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = product.Id,
                ProductVariantId = variant.Id,
                CreatedAt = DateTime.UtcNow,
            };

            cart.Items.Add(existingItem);
        }

        ApplyItemValues(existingItem, product, variant, nextQuantity, normalizedLanguageCode);
        TouchCart(cart);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var savedCart = await LoadCartAsync(normalizedSessionId, asNoTracking: true, cancellationToken)
            ?? throw new InvalidOperationException("Cart could not be loaded after saving.");

        return MapCart(savedCart, normalizedLanguageCode);
    }

    public async Task<PublicCartDto?> UpdateItemQuantityAsync(
        string itemSessionId,
        Guid itemId,
        UpdateCartItemQuantityCommand command,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        var normalizedRouteSessionId = NormalizeSessionId(itemSessionId);
        var normalizedBodySessionId = NormalizeSessionId(command.SessionId);

        if (!string.Equals(normalizedRouteSessionId, normalizedBodySessionId, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Session id mismatch.");
        }

        if (command.Quantity < 0)
        {
            throw new InvalidOperationException("Quantity cannot be negative.");
        }

        var normalizedLanguageCode = NormalizeLanguageCode(command.LanguageCode);
        var cart = await LoadCartAsync(normalizedRouteSessionId, asNoTracking: false, cancellationToken);

        if (cart is null)
        {
            return null;
        }

        var item = cart.Items.FirstOrDefault(x => x.Id == itemId);

        if (item is null)
        {
            return null;
        }

        if (command.Quantity == 0)
        {
            cart.Items.Remove(item);
            _dbContext.CartItems.Remove(item);
        }
        else
        {
            var product = await _dbContext.Products
                .Include(x => x.Translations)
                .Include(x => x.Images)
                .Include(x => x.Variants)
                .FirstOrDefaultAsync(x => x.Id == item.ProductId && x.IsActive, cancellationToken);

            if (product is null)
            {
                throw new InvalidOperationException("Product was not found.");
            }

            var variant = product.Variants.FirstOrDefault(x => x.Id == item.ProductVariantId && x.IsActive);

            if (variant is null)
            {
                throw new InvalidOperationException("Product variant was not found.");
            }

            ValidateQuantity(product, command.Quantity);
            ApplyItemValues(item, product, variant, command.Quantity, normalizedLanguageCode);
        }

        TouchCart(cart);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var savedCart = await LoadCartAsync(normalizedRouteSessionId, asNoTracking: true, cancellationToken);
        return savedCart is null ? CreateEmptyCart(normalizedRouteSessionId) : MapCart(savedCart, normalizedLanguageCode);
    }

    public async Task<PublicCartDto?> RemoveItemAsync(
        string sessionId,
        Guid itemId,
        string? languageCode,
        CancellationToken cancellationToken = default)
    {
        var normalizedSessionId = NormalizeSessionId(sessionId);
        var normalizedLanguageCode = NormalizeLanguageCode(languageCode);
        var cart = await LoadCartAsync(normalizedSessionId, asNoTracking: false, cancellationToken);

        if (cart is null)
        {
            return null;
        }

        var item = cart.Items.FirstOrDefault(x => x.Id == itemId);

        if (item is null)
        {
            return null;
        }

        cart.Items.Remove(item);
        _dbContext.CartItems.Remove(item);
        TouchCart(cart);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var savedCart = await LoadCartAsync(normalizedSessionId, asNoTracking: true, cancellationToken);
        return savedCart is null ? CreateEmptyCart(normalizedSessionId) : MapCart(savedCart, normalizedLanguageCode);
    }

    private async Task<Cart?> LoadCartAsync(string sessionId, bool asNoTracking, CancellationToken cancellationToken)
    {
        var query = _dbContext.Carts
            .Include(x => x.Items)
                .ThenInclude(x => x.Product)
                    .ThenInclude(x => x.Translations)
            .Include(x => x.Items)
                .ThenInclude(x => x.Product)
                    .ThenInclude(x => x.Images)
            .Include(x => x.Items)
                .ThenInclude(x => x.ProductVariant)
            .Where(x => x.SessionId == sessionId && x.ConvertedToOrderId == null);

        if (asNoTracking)
        {
            query = query.AsNoTracking();
        }

        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    private static Cart CreateCart(string sessionId, string currencyCode)
    {
        var now = DateTime.UtcNow;

        return new Cart
        {
            SessionId = sessionId,
            CurrencyCode = currencyCode,
            ExpiresAt = now.Add(CartLifetime),
            CreatedAt = now,
            UpdatedAt = now,
        };
    }

    private static void ApplyItemValues(
        CartItem item,
        Product product,
        ProductVariant variant,
        int quantity,
        string languageCode)
    {
        var productName = product.Translations
            .Where(x => x.LanguageCode == languageCode)
            .Select(x => x.Name)
            .FirstOrDefault()
            ?? product.Translations.Select(x => x.Name).FirstOrDefault()
            ?? product.Slug;

        var lineTotalExclVat = RoundMoney(variant.PriceExclVat * quantity);
        var lineVatTotal = RoundMoney(lineTotalExclVat * (product.BaseVatRate / 100m));

        item.ProductId = product.Id;
        item.ProductVariantId = variant.Id;
        item.Sku = variant.Sku;
        item.ProductNameSnapshot = productName;
        item.VariantDescriptionSnapshot = product.HasVariants ? variant.Sku : null;
        item.Quantity = quantity;
        item.UnitPriceExclVat = variant.PriceExclVat;
        item.VatRate = product.BaseVatRate;
        item.DiscountExclVat = 0m;
        item.LineTotalExclVat = lineTotalExclVat;
        item.LineVatTotal = lineVatTotal;
        item.LineGrandTotal = RoundMoney(lineTotalExclVat + lineVatTotal);
        item.UpdatedAt = DateTime.UtcNow;
    }

    private static void TouchCart(Cart cart)
    {
        cart.SubtotalExclVat = RoundMoney(cart.Items.Sum(x => x.LineTotalExclVat));
        cart.DiscountExclVat = RoundMoney(cart.Items.Sum(x => x.DiscountExclVat));
        cart.VatTotal = RoundMoney(cart.Items.Sum(x => x.LineVatTotal));
        cart.GrandTotal = RoundMoney(cart.Items.Sum(x => x.LineGrandTotal));
        cart.ExpiresAt = DateTime.UtcNow.Add(CartLifetime);
        cart.UpdatedAt = DateTime.UtcNow;
    }

    private static PublicCartDto MapCart(Cart cart, string languageCode)
    {
        return new PublicCartDto(
            cart.Id,
            cart.SessionId ?? string.Empty,
            cart.CurrencyCode,
            cart.Items.Sum(x => x.Quantity),
            cart.SubtotalExclVat,
            cart.DiscountExclVat,
            cart.VatTotal,
            cart.GrandTotal,
            cart.Items
                .OrderBy(x => x.CreatedAt)
                .Select(item => new PublicCartItemDto(
                    item.Id,
                    item.ProductId,
                    item.ProductVariantId,
                    item.Product.Slug,
                    item.Product.Translations
                        .Where(x => x.LanguageCode == languageCode)
                        .Select(x => x.Name)
                        .FirstOrDefault()
                        ?? item.Product.Translations.Select(x => x.Name).FirstOrDefault()
                        ?? item.ProductNameSnapshot,
                    item.Product.Images
                        .OrderByDescending(x => x.IsMain)
                        .ThenBy(x => x.SortOrder)
                        .Select(x => x.Url)
                        .FirstOrDefault(),
                    item.Sku,
                    item.VariantDescriptionSnapshot,
                    item.Quantity,
                    item.UnitPriceExclVat,
                    item.VatRate,
                    item.LineTotalExclVat,
                    item.LineVatTotal,
                    item.LineGrandTotal,
                    item.Product.MinOrderQuantity,
                    item.Product.MaxOrderQuantity))
                .ToList());
    }

    private static PublicCartDto CreateEmptyCart(string sessionId)
    {
        return new PublicCartDto(
            null,
            sessionId,
            "EUR",
            0,
            0m,
            0m,
            0m,
            0m,
            Array.Empty<PublicCartItemDto>());
    }

    private static string NormalizeLanguageCode(string? languageCode)
    {
        return string.IsNullOrWhiteSpace(languageCode)
            ? "tr"
            : languageCode.Trim().ToLowerInvariant();
    }

    private static string NormalizeSessionId(string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            throw new InvalidOperationException("Session id is required.");
        }

        return sessionId.Trim();
    }

    private static void ValidateQuantity(Product product, int quantity)
    {
        if (quantity < product.MinOrderQuantity)
        {
            throw new InvalidOperationException($"Minimum order quantity is {product.MinOrderQuantity}.");
        }

        if (product.MaxOrderQuantity.HasValue && quantity > product.MaxOrderQuantity.Value)
        {
            throw new InvalidOperationException($"Maximum order quantity is {product.MaxOrderQuantity.Value}.");
        }
    }

    private static decimal RoundMoney(decimal value)
    {
        return Math.Round(value, 2, MidpointRounding.AwayFromZero);
    }
}