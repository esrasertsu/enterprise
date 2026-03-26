namespace Ecommerce.Application.Products;

public sealed class ProductAttributeInput
{
    public string AttributeKey { get; init; } = string.Empty;
    public string AttributeValue { get; init; } = string.Empty;
    public string? LanguageCode { get; init; }
    public bool IsFilterable { get; init; }
    public int SortOrder { get; init; }
}