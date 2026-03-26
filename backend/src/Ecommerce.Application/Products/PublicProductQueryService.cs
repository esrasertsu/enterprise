using Ecommerce.Application.Abstractions.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Products;

public sealed class PublicProductQueryService
{
    private readonly IAppDbContext _dbContext;

    public PublicProductQueryService(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<PublicProductListItemDto>> GetListAsync(
        string? languageCode,
        string? categorySlug,
        CancellationToken cancellationToken = default)
    {
        var normalizedLanguageCode = NormalizeLanguageCode(languageCode);
        var normalizedCategorySlug = string.IsNullOrWhiteSpace(categorySlug) ? null : categorySlug.Trim().ToLowerInvariant();

        var query = _dbContext.Products
            .AsNoTracking()
            .Where(product => product.IsActive);

        if (!string.IsNullOrWhiteSpace(normalizedCategorySlug))
        {
            query = query.Where(product => product.Category.Slug == normalizedCategorySlug);
        }

        return await query
            .OrderByDescending(product => product.IsFeatured)
            .ThenByDescending(product => product.CreatedAt)
            .Select(product => new PublicProductListItemDto(
                product.Id,
                product.Slug,
                product.Translations
                    .Where(translation => translation.LanguageCode == normalizedLanguageCode)
                    .Select(translation => translation.Name)
                    .FirstOrDefault()
                    ?? product.Translations.Select(translation => translation.Name).FirstOrDefault()
                    ?? product.Slug,
                product.Translations
                    .Where(translation => translation.LanguageCode == normalizedLanguageCode)
                    .Select(translation => translation.ShortDescription)
                    .FirstOrDefault()
                    ?? product.Translations.Select(translation => translation.ShortDescription).FirstOrDefault(),
                product.Category.Slug,
                product.Category.Translations
                    .Where(translation => translation.LanguageCode == normalizedLanguageCode)
                    .Select(translation => translation.Name)
                    .FirstOrDefault()
                    ?? product.Category.Translations.Select(translation => translation.Name).FirstOrDefault()
                    ?? product.Category.Slug,
                product.Images
                    .OrderByDescending(image => image.IsMain)
                    .ThenBy(image => image.SortOrder)
                    .Select(image => image.Url)
                    .FirstOrDefault(),
                product.Variants.Where(variant => variant.IsActive).Select(variant => (decimal?)variant.PriceExclVat).Min(),
                product.Variants.Where(variant => variant.IsActive).Select(variant => (decimal?)variant.PriceExclVat).Max(),
                product.ProductType,
                product.IsCustomizable,
                product.RequiresArtwork,
                product.MinOrderQuantity))
            .ToListAsync(cancellationToken);
    }

    public async Task<PublicProductDetailDto?> GetBySlugAsync(
        string slug,
        string? languageCode,
        CancellationToken cancellationToken = default)
    {
        var normalizedSlug = slug.Trim().ToLowerInvariant();
        var normalizedLanguageCode = NormalizeLanguageCode(languageCode);

        var product = await _dbContext.Products
            .AsNoTracking()
            .Include(x => x.Category)
                .ThenInclude(x => x.Translations)
            .Include(x => x.Translations)
            .Include(x => x.Variants)
            .Include(x => x.Images)
            .Include(x => x.Attributes)
            .FirstOrDefaultAsync(x => x.IsActive && x.Slug == normalizedSlug, cancellationToken);

        if (product is null)
        {
            return null;
        }

        var translation = product.Translations.FirstOrDefault(x => x.LanguageCode == normalizedLanguageCode)
            ?? product.Translations.FirstOrDefault();

        var categoryTranslation = product.Category.Translations.FirstOrDefault(x => x.LanguageCode == normalizedLanguageCode)
            ?? product.Category.Translations.FirstOrDefault();

        var attributes = product.Attributes
            .Where(attribute => attribute.LanguageCode is null || attribute.LanguageCode == normalizedLanguageCode)
            .OrderBy(attribute => attribute.SortOrder)
            .Select(attribute => new PublicProductAttributeDto(
                attribute.Id,
                attribute.AttributeKey,
                attribute.AttributeValue,
                attribute.LanguageCode,
                attribute.IsFilterable,
                attribute.SortOrder))
            .ToList();

        return new PublicProductDetailDto(
            product.Id,
            product.Slug,
            translation?.Name ?? product.Slug,
            translation?.ShortDescription,
            translation?.Description,
            product.Category.Slug,
            categoryTranslation?.Name ?? product.Category.Slug,
            product.MaterialSummary,
            product.OriginCountry,
            product.ProductType,
            product.IsCustomizable,
            product.HasVariants,
            product.RequiresArtwork,
            product.Recyclable,
            product.FoodSafe,
            product.MinOrderQuantity,
            product.MaxOrderQuantity,
            product.LeadTimeDays,
            product.BaseVatRate,
            product.WeightGrams,
            product.Variants
                .Where(variant => variant.IsActive)
                .OrderBy(variant => variant.SortOrder)
                .Select(variant => new PublicProductVariantDto(
                    variant.Id,
                    variant.Sku,
                    variant.Barcode,
                    variant.PriceExclVat,
                    variant.CompareAtPriceExclVat,
                    variant.IsActive,
                    variant.SortOrder))
                .ToList(),
            product.Images
                .OrderByDescending(image => image.IsMain)
                .ThenBy(image => image.SortOrder)
                .Select(image => new PublicProductImageDto(
                    image.Id,
                    image.Url,
                    image.AltText,
                    image.SortOrder,
                    image.IsMain))
                .ToList(),
            attributes);
    }

    private static string NormalizeLanguageCode(string? languageCode)
    {
        return string.IsNullOrWhiteSpace(languageCode)
            ? "tr"
            : languageCode.Trim().ToLowerInvariant();
    }
}