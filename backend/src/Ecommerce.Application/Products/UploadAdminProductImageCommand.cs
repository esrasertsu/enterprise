namespace Ecommerce.Application.Products;

public sealed class UploadAdminProductImageCommand
{
    public string? AltText { get; init; }
    public bool IsMain { get; init; }
    public int? SortOrder { get; init; }
}