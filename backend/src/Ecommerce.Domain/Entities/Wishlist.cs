using Ecommerce.Domain.Common;
namespace Ecommerce.Domain.Entities;

public class Wishlist : BaseEntity
{
    public Guid CustomerId { get; set; }
    public Guid ProductId { get; set; }
    public Guid? ProductVariantId { get; set; }
    public Customer Customer { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public ProductVariant? ProductVariant { get; set; }
}