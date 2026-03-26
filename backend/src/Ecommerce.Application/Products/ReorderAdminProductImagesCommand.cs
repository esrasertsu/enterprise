namespace Ecommerce.Application.Products;

public sealed class ReorderAdminProductImagesCommand
{
    public IReadOnlyList<Guid> ImageIds { get; init; } = [];
}