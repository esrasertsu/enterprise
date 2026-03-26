namespace Ecommerce.Application.Products;

public sealed class ProductImageInput
{
    public string Url { get; init; } = string.Empty;
    public string? AltText { get; init; }
    public int SortOrder { get; init; }
    public bool IsMain { get; init; }
}