namespace Ecommerce.Application.Products;

public sealed class ProductTranslationInput
{
    public string LanguageCode { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? ShortDescription { get; init; }
    public string? Description { get; init; }
    public string? SeoTitle { get; init; }
    public string? SeoDescription { get; init; }
}